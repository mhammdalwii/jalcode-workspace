package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Ambil semua daftar rapat
func GetMeetings(c *gin.Context) {
	var meetings []models.MeetingNote
	
	// 🚀 PRELOAD PICS (Banyak orang)
	query := config.DB.Preload("ActionItems").Preload("ActionItems.PICs")

	if projectID := c.Query("project_id"); projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}

	if err := query.Order("date DESC").Find(&meetings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data rapat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": meetings})
}

// Simpan jurnal rapat baru
func CreateMeeting(c *gin.Context) {
	var req dto.MeetingNoteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal salah. Gunakan YYYY-MM-DD"})
		return
	}

	var actionItems []models.MeetingActionItem
	for _, item := range req.ActionItems {
		// 🚀 Cari profil tim berdasarkan ID yang dikirim
		var selectedPICs []models.TeamMember
		if len(item.PICIDs) > 0 {
			config.DB.Where("id IN ?", item.PICIDs).Find(&selectedPICs)
		}

		actionItems = append(actionItems, models.MeetingActionItem{
			Task:   item.Task,
			PICs:   selectedPICs,
			IsDone: false,
		})
	}

	meeting := models.MeetingNote{
		ProjectID:   req.ProjectID,
		Title:       req.Title,
		Date:        date,
		Notes:       req.Notes,
		ActionItems: actionItems,
	}

	if err := config.DB.Create(&meeting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan jurnal rapat"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Jurnal rapat berhasil dikunci!", "data": meeting})
}

// 🚀 FUNGSI BARU: Edit Jurnal Rapat
func UpdateMeeting(c *gin.Context) {
	id := c.Param("id")
	var req dto.MeetingNoteReq

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingMeeting models.MeetingNote
	if err := config.DB.Preload("ActionItems").First(&existingMeeting, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jurnal tidak ditemukan"})
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal salah."})
		return
	}

	// Hapus Action Items lama dan koneksi Many-to-Many
	for _, oldAction := range existingMeeting.ActionItems {
		config.DB.Model(&oldAction).Association("PICs").Clear()
		config.DB.Delete(&oldAction)
	}

	// Rakit Action Items baru
	var newActionItems []models.MeetingActionItem
	for _, item := range req.ActionItems {
		var selectedPICs []models.TeamMember
		if len(item.PICIDs) > 0 {
			config.DB.Where("id IN ?", item.PICIDs).Find(&selectedPICs)
		}

		newActionItems = append(newActionItems, models.MeetingActionItem{
			Task: item.Task,
			PICs: selectedPICs,
		})
	}

	// Update data utama
	existingMeeting.Title = req.Title
	existingMeeting.Date = date
	existingMeeting.Notes = req.Notes
	existingMeeting.ProjectID = req.ProjectID
	existingMeeting.ActionItems = newActionItems

	if err := config.DB.Save(&existingMeeting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate rapat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Jurnal rapat berhasil diperbarui!"})
}

// Hapus jurnal rapat
func DeleteMeeting(c *gin.Context) {
	id := c.Param("id")
	
	// Bersihkan juga relasi Many-to-Many sebelum hapus agar rapi
	var meeting models.MeetingNote
	if err := config.DB.Preload("ActionItems").First(&meeting, id).Error; err == nil {
		for _, action := range meeting.ActionItems {
			config.DB.Model(&action).Association("PICs").Clear()
		}
	}

	if err := config.DB.Delete(&models.MeetingNote{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus jurnal rapat"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Jurnal rapat berhasil dihapus"})
}

// Centang / Batal Centang tugas
func ToggleActionItem(c *gin.Context) {
	actionID := c.Param("action_id")
	var actionItem models.MeetingActionItem
	
	if err := config.DB.First(&actionItem, actionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Action Item tidak ditemukan"})
		return
	}

	config.DB.Model(&actionItem).Update("is_done", !actionItem.IsDone)
	c.JSON(http.StatusOK, gin.H{"message": "Status tugas diperbarui!"})
}