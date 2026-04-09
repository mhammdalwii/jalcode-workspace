package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// RequireAuth adalah fungsi penengah (middleware) untuk mengecek token
func RequireAuth(c *gin.Context) {
	// Ambil header Authorization dari request frontend/Postman
	authHeader := c.GetHeader("Authorization")
	
	if authHeader == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Akses ditolak! Token tidak ditemukan."})
		return
	}

	// Pisahkan kata "Bearer " untuk mengambil token aslinya saja
	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	// Validasi keaslian token menggunakan kunci rahasia dari .env
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("metode enkripsi tidak valid")
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	// Jika token rusak, palsu, atau kedaluwarsa
	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau sudah kedaluwarsa!"})
		return
	}

	// Ekstrak isi tiket (Claims) dan simpan ID serta Role-nya ke Context memori Gin
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		c.Set("id", claims["id"])
		c.Set("role", claims["role"])
	} else {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Gagal membaca isi token"})
		return
	}

	// Jika token sah dan data berhasil disimpan, persilakan masuk ke Controller
	c.Next()
}