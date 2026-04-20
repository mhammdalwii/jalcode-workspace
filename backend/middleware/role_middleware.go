package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		//  jabatan (role) dari memori yang sudah dititipkan oleh auth_middleware
		userRoleObj, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Akses ditolak: Data jabatan tidak ditemukan!"})
			return
		}

		userRole := userRoleObj.(string)
		isAllowed := false

		//  apakah jabatan pengguna saat ini ada di dalam daftar tamu VIP
		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				isAllowed = true
				break
			}
		}

		// Jika jabatannya tidak cocok, tendang keluar!
		if !isAllowed {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "Akses ditolak! Jabatan Anda (" + userRole + ") tidak memiliki izin untuk tindakan ini.",
			})
			return
		}

		//  Jika lolos, silakan buka pintu ke Controller
		c.Next()
	}
}