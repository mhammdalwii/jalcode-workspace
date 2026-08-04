package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Ambil semua daftar rapat (bisa difilter berdasarkan proyek)
func GetMeetings(c *gin.Context) {
	var meetings []models.MeetingNote
	
	// Tarik data rapat beserta rincian Action Items dan profil anggota tim (PIC)
	query := config.DB.Preload("ActionItems").Preload("ActionItems.PIC")

	// Filter opsional: Jika frontend mengirim parameter project_id
	if projectID := c.Query("project_id"); projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}

	if err := query.Order("date DESC").Find(&meetings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data rapat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": meetings})
}

// Simpan jurnal rapat baru beserta rincian tugasnya
func CreateMeeting(c *gin.Context) {
	var req dto.MeetingNoteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Konversi format string tanggal ke tipe time.Time
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal salah. Gunakan YYYY-MM-DD"})
		return
	}

	// Rakit Action Items
	var actionItems []models.MeetingActionItem
	for _, item := range req.ActionItems {
		actionItems = append(actionItems, models.MeetingActionItem{
			Task:   item.Task,
			PICID:  item.PICID,
			IsDone: false, // Default: Belum selesai
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

// Hapus jurnal rapat
func DeleteMeeting(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.MeetingNote{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus jurnal rapat"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Jurnal rapat berhasil dihapus"})
}

// Centang / Batal Centang tugas Action Item
func ToggleActionItem(c *gin.Context) {
	actionID := c.Param("action_id")
	var actionItem models.MeetingActionItem
	
	if err := config.DB.First(&actionItem, actionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Action Item tidak ditemukan"})
		return
	}

	// Balikkan status (jika true jadi false, jika false jadi true)
	config.DB.Model(&actionItem).Update("is_done", !actionItem.IsDone)
	c.JSON(http.StatusOK, gin.H{"message": "Status tugas diperbarui!"})
}