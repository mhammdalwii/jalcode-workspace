package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"jalcode-api/utils"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// @Summary Ambil semua rencana konten
// @Description Mengambil daftar ide dan jadwal konten internal Jalcode
// @Tags Contents
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/contents/ [get]
func GetContents(c *gin.Context) {
	var contents []models.ContentPlan
	
	// Preload PICs dengan aman
	if err := config.DB.Preload("PICs").Order("created_at desc").Find(&contents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data konten"})
		return
	}

	// Mapping ke DTO Response agar bersih
	var contentResponses []dto.ContentResponse
	for _, contentItem := range contents {
		picsResponse := []dto.TeamMemberResponse{}

		// PERBAIKAN: Hanya loop jika PICs benar-benar ada isinya
		if len(contentItem.PICs) > 0 {
			for _, pic := range contentItem.PICs {
				picsResponse = append(picsResponse, dto.TeamMemberResponse{
					ID:    pic.ID,
					Name:  pic.Name,
					Role:  pic.Role,
					Email: pic.Email,
				})
			}
		}

		contentResponses = append(contentResponses, dto.ContentResponse{
			ID:          contentItem.ID,
			Title:       contentItem.Title,
			Platform:    contentItem.Platform,
			Status:      contentItem.Status,
			PublishDate: contentItem.PublishDate,
			PICs:        picsResponse, 
			Notes:       contentItem.Notes,
			CreatedAt:   contentItem.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": contentResponses})
}

// @Summary Tambah rencana konten baru
// @Description Menambahkan ide atau jadwal konten ke dalam kalender
// @Tags Contents
// @Accept json
// @Produce json
// @Param body body dto.ContentRequest true "Data Konten"
// @Success 201 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/contents/ [post]
func CreateContent(c *gin.Context) {
	var req dto.ContentRequest 
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var pubDate *time.Time
	if req.PublishDate != "" {
		parsed, err := time.Parse("2006-01-02", req.PublishDate)
		if err == nil {
			pubDate = &parsed
		}
	}

	// CARI SEMUA TEAM MEMBER BERDASARKAN ARRAY ID YANG DIKIRIM FRONTEND
	var pics []models.TeamMember
	if len(req.PicIDs) > 0 {
		config.DB.Where("id IN ?", req.PicIDs).Find(&pics)
	}

	content := models.ContentPlan{
		Title:       req.Title,
		Platform:    req.Platform,
		Status:      req.Status,
		PublishDate: pubDate,
		PICs:        pics, // MASUKKAN ARRAY TEAM MEMBER KE STRUCT
		Notes:       req.Notes,
	}

	config.DB.Create(&content)

	if userIDObj, exists := c.Get("id"); exists {
		var userID uint
		switch v := userIDObj.(type) {
		case float64:
			userID = uint(v)
		case uint:
			userID = v
		}
		utils.LogActivity(userID, "Menambahkan rencana konten baru", req.Title)
	}

	config.DB.Preload("PICs").First(&content, content.ID)
	c.JSON(http.StatusCreated, gin.H{"message": "Konten berhasil ditambahkan", "data": content})
}

// @Summary Update data konten
// @Description Memperbarui status, jadwal, atau detail konten lainnya
// @Tags Contents
// @Accept json
// @Produce json
// @Param id path string true "ID Konten"
// @Param body body dto.ContentRequest true "Data Update"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/contents/{id} [put]
func UpdateContent(c *gin.Context) {
	id := c.Param("id")
	var content models.ContentPlan

	if err := config.DB.First(&content, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Konten tidak ditemukan"})
		return
	}

	oldStatus := content.Status

	var req dto.ContentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 🔒 BENTENG KEAMANAN INDUSTRI (CEK ROLE UNTUK MODAL EDIT)
	var userID uint
	if userIDObj, exists := c.Get("id"); exists {
		switch v := userIDObj.(type) {
		case float64:
			userID = uint(v)
		case uint:
			userID = v
		}

		var currentUser models.TeamMember
		config.DB.First(&currentUser, userID)

		// 🚨 JIKA STATUSNYA MAU DIUBAH
		if oldStatus != req.Status {
			// 1. BLOKIR TOTAL UNTUK ANGGOTA BIASA
			if currentUser.Role != "Founder" && currentUser.Role != "Admin" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Akses Ditolak: Hanya Admin dan Founder yang berhak mengubah status konten!"})
				return
			}
			
			// 2. BLOKIR KHUSUS APPROVAL IDE UNTUK ADMIN (Hanya Founder yang boleh)
			if oldStatus == "Ide" && currentUser.Role != "Founder" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Akses Ditolak: Hanya Founder yang berhak mengubah status Ide!"})
				return
			}

			// 3. BLOKIR MUNDUR: Tidak bisa kembali ke "Ide" jika sudah disetujui
			if oldStatus != "Ide" && req.Status == "Ide" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Operasi Ditolak: Kartu yang sudah diproses tidak bisa dikembalikan menjadi Ide!"})
				return
			}
		}
	}

	var pubDate *time.Time
	if req.PublishDate != "" {
		parsed, err := time.Parse("2006-01-02", req.PublishDate)
		if err == nil {
			pubDate = &parsed
		}
	}

	// CARI TEAM MEMBER YANG BARU DIPILIH
	var pics []models.TeamMember
	if len(req.PicIDs) > 0 {
		config.DB.Where("id IN ?", req.PicIDs).Find(&pics)
	}

	content.Title = req.Title
	content.Platform = req.Platform
	content.Status = req.Status
	content.PublishDate = pubDate
	content.Notes = req.Notes

	// UPDATE DATA DASAR
	config.DB.Save(&content)

	// REPLACE ASOSIASI MANY2MANY PICS
	config.DB.Model(&content).Association("PICs").Replace(pics)

	if userID > 0 {
		if oldStatus != content.Status {
			utils.LogActivity(userID, "Menggeser status konten", content.Title+" menjadi "+content.Status)
		} else {
			utils.LogActivity(userID, "Memperbarui data konten", content.Title)
		}
	}

	config.DB.Preload("PICs").First(&content, id)
	c.JSON(http.StatusOK, gin.H{"message": "Konten berhasil diperbarui", "data": content})
}

// @Summary Update status konten (Kanban)
// @Description Memperbarui hanya status konten (Drag and drop / Dropdown)
// @Tags Contents
// @Accept json
// @Produce json
// @Param id path string true "ID Konten"
// @Param body body map[string]string true "Status baru"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/contents/{id}/status [patch]
func UpdateContentStatus(c *gin.Context) {
	id := c.Param("id")
	var content models.ContentPlan

	if err := config.DB.First(&content, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Konten tidak ditemukan"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status diperlukan"})
		return
	}

	oldStatus := content.Status

	// 🔒 BENTENG KEAMANAN INDUSTRI (CEK ROLE)
	var userID uint
	if userIDObj, exists := c.Get("id"); exists {
		switch v := userIDObj.(type) {
		case float64:
			userID = uint(v)
		case uint:
			userID = v
		}

		// Tarik data user asli dari database untuk memastikan jabatannya
		var currentUser models.TeamMember
		config.DB.First(&currentUser, userID)

		// 🚨 1. BLOKIR TOTAL: Jika bukan Founder DAN bukan Admin, larang pindah kartu sama sekali!
		if currentUser.Role != "Founder" && currentUser.Role != "Admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses Ditolak: Hanya Admin dan Founder yang berhak memindah kartu!"})
			return
		}

		// 🚨 2. BLOKIR KHUSUS: Hanya Founder yang bisa memindah dari status "Ide"
		if oldStatus == "Ide" && req.Status != "Ide" && currentUser.Role != "Founder" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Akses Ditolak: Hanya Founder yang berhak menyetujui atau menolak Ide Konten!"})
			return
		}

		// 🚀 3. BLOKIR MUNDUR: Tidak bisa kembali ke "Ide" jika sudah disetujui
		if oldStatus != "Ide" && req.Status == "Ide" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Operasi Ditolak: Kartu yang sudah diproses tidak bisa dikembalikan menjadi Ide!"})
			return
		}
	}

	if req.Status == "Ditolak" && req.Reason != "" {
		content.Notes = "❌ ALASAN DITOLAK: " + req.Reason + "\n\n" + content.Notes
	}

	content.Status = req.Status
	config.DB.Save(&content)

	if userID > 0 && oldStatus != content.Status {
		utils.LogActivity(userID, "Memindah kartu konten", content.Title+" ke "+content.Status)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status konten berhasil dipindah", "data": content})
}

// @Summary Hapus rencana konten
// @Description Menghapus konten dari kalender pemasaran
// @Tags Contents
// @Produce json
// @Param id path string true "ID Konten"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/contents/{id} [delete]
func DeleteContent(c *gin.Context) {
	id := c.Param("id")
	var content models.ContentPlan

	if err := config.DB.First(&content, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Konten tidak ditemukan"})
		return
	}

	if userIDObj, exists := c.Get("id"); exists {
		var userID uint
		switch v := userIDObj.(type) {
		case float64:
			userID = uint(v)
		case uint:
			userID = v
		}
		utils.LogActivity(userID, "Menghapus rencana konten", content.Title)
	}

	// HAPUS ASOSIASI PICS SEBELUM MENGHAPUS KONTEN
	config.DB.Model(&content).Association("PICs").Clear()
	config.DB.Delete(&content)
	
	c.JSON(http.StatusOK, gin.H{"message": "Konten berhasil dihapus"})
}