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
	if err := config.DB.Preload("PIC").Order("created_at desc").Find(&contents).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data konten"})
		return
	}

	// Mapping ke DTO Response agar bersih
	var contentResponses []dto.ContentResponse
	for _, c := range contents {
		pic := dto.TeamMemberResponse{
			ID:    c.PIC.ID,
			Name:  c.PIC.Name,
			Role:  c.PIC.Role,
			Email: c.PIC.Email,
		}

		contentResponses = append(contentResponses, dto.ContentResponse{
			ID:          c.ID,
			Title:       c.Title,
			Platform:    c.Platform,
			Status:      c.Status,
			PublishDate: c.PublishDate,
			PIC:         pic,
			Notes:       c.Notes,
			CreatedAt:   c.CreatedAt,
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

	content := models.ContentPlan{
		Title:        req.Title,
		Platform:     req.Platform,
		Status:       req.Status,
		PublishDate:  pubDate,
		TeamMemberID: req.TeamMemberID,
		Notes:        req.Notes,
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

	config.DB.Preload("PIC").First(&content, content.ID)
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

	var pubDate *time.Time
	if req.PublishDate != "" {
		parsed, err := time.Parse("2006-01-02", req.PublishDate)
		if err == nil {
			pubDate = &parsed
		}
	}

	content.Title = req.Title
	content.Platform = req.Platform
	content.Status = req.Status
	content.PublishDate = pubDate
	content.TeamMemberID = req.TeamMemberID
	content.Notes = req.Notes

	config.DB.Save(&content)

	if userIDObj, exists := c.Get("id"); exists {
		var userID uint
		switch v := userIDObj.(type) {
		case float64:
			userID = uint(v)
		case uint:
			userID = v
		}

		if oldStatus != content.Status {
			utils.LogActivity(userID, "Menggeser status konten", content.Title+" menjadi "+content.Status)
		} else {
			utils.LogActivity(userID, "Memperbarui data konten", content.Title)
		}
	}

	config.DB.Preload("PIC").First(&content, id)
	c.JSON(http.StatusOK, gin.H{"message": "Konten berhasil diperbarui", "data": content})
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

	config.DB.Delete(&content)
	c.JSON(http.StatusOK, gin.H{"message": "Konten berhasil dihapus"})
}