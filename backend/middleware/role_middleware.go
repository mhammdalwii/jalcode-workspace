package middleware

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireAdmin memastikan hanya user dengan Role "Admin" atau "Founder" yang bisa lewat
func RequireAdmin(c *gin.Context) {
//  (Sesuai dengan yang ada di auth_middleware & jwt.go)
	userIDObj, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda belum login"})
		c.Abort()
		return
	}

	// JWT secara default membaca angka sebagai float64, kita ubah ke uint
	var userID uint
	switch v := userIDObj.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	}

	// Cari user di database
	var user models.TeamMember
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak ditemukan"})
		c.Abort()
		return
	}

	// Cek apakah dia Admin/Founder
	if user.Role != "Admin" && user.Role != "Founder" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak! Fitur ini hanya untuk Admin."})
		c.Abort()
		return
	}

	// Jika lolos, silakan lanjut ke controller
	c.Next()
}