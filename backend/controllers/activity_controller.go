package controllers

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Ambil log aktivitas tim
// @Description Mengambil 50 aktivitas terbaru dari seluruh anggota tim
// @Tags Activities
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/activities [get]
func GetActivities(c *gin.Context) {
	var logs []models.ActivityLog

	// Ambil 50 log terakhir, urutkan dari yang terbaru, dan sertakan nama pelakunya (Preload User)
	if err := config.DB.Preload("User").Order("created_at desc").Limit(50).Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil log aktivitas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": logs})
}