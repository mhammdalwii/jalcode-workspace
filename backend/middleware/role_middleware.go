package middleware

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireAdmin memastikan hanya user dengan Role "Admin" atau "Founder" yang bisa lewat
func RequireAdmin(c *gin.Context) {
	// Ambil userID dari context (yang sudah diset oleh RequireAuth sebelumnya)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda belum login"})
		c.Abort()
		return
	}

	// Cari user di database
	var user models.TeamMember
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak ditemukan"})
		c.Abort()
		return
	}

	// Cek apakah dia Admin/Founder
	// (Pastikan di database kamu nanti ada user dengan Role "Admin" atau "Founder")
	if user.Role != "Admin" && user.Role != "Founder" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak! Fitur ini hanya untuk Admin."})
		c.Abort()
		return
	}

	// Jika lolos, silakan lanjut ke controller
	c.Next()
}