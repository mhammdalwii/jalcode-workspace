package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// --- FUNGSI BANTUAN UNTUK MEMBUAT 2 TOKEN ---
func generateTokens(user models.TeamMember) (string, string, error) {
	//  Access Token (Umur Pendek: 15 Menit)
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":   user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(time.Minute * 15).Unix(),
	})
	accessTokenString, err := accessToken.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", "", err
	}

	// Buat Refresh Token (Umur Panjang: 7 Hari)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(),
	})
	// Menggunakan Secret khusus untuk Refresh Token
	refreshTokenString, err := refreshToken.SignedString([]byte(os.Getenv("JWT_REFRESH_SECRET")))
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

// @Summary Register member baru
// @Description Mendaftarkan anggota tim baru ke dalam sistem
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body dto.RegisterRequest true "Data Registrasi"
// @Success 200 {object} map[string]interface{}
// @Router /api/auth/register [post]
func Register(c *gin.Context) {
	var req dto.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	user := models.TeamMember{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     req.Role,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mendaftarkan user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registrasi berhasil"})
}

// @Summary Login pengguna
// @Description Melakukan autentikasi menggunakan email dan password untuk mendapatkan Access dan Refresh Token
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body dto.LoginRequest true "Data Login"
// @Success 200 {object} map[string]interface{} "Berhasil login & mendapat token"
// @Router /api/auth/login [post]
func Login(c *gin.Context) {
	var input dto.LoginRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.TeamMember
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah!"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah!"})
		return
	}

	// Gunakan fungsi bantuan baru untuk mencetak 2 token
	accessToken, refreshToken, err := generateTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token"})
		return
	}

	// Kirim token dan data user ke frontend
	c.JSON(http.StatusOK, gin.H{
		"message":       "Login berhasil!",
		"token":         accessToken,
		"refresh_token": refreshToken,
		"user": gin.H{
			"id":   user.ID,
			"name": user.Name,
			"role": user.Role,
		},
	})
}

// @Summary Refresh Token
// @Description Mendapatkan token akses baru menggunakan refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body map[string]string true "Format: {\"refresh_token\": \"string\"}"
// @Success 200 {object} map[string]interface{} "Berhasil mendapat token baru"
// @Router /api/auth/refresh [post]
func RefreshToken(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token diperlukan"})
		return
	}

	// Validasi Refresh Token
	token, err := jwt.Parse(input.RefreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_REFRESH_SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token tidak valid atau kedaluwarsa"})
		return
	}

	// Ekstrak ID
	claims, _ := token.Claims.(jwt.MapClaims)
	userID := claims["id"]

	// Cek database untuk melihat apakah user masih ada dan ambil Role terbarunya
	var user models.TeamMember
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User tidak ditemukan di sistem"})
		return
	}

	// Cetak token baru dengan Role yang mungkin sudah diperbarui
	newAccessToken, newRefreshToken, err := generateTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memuat ulang token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":         newAccessToken,
		"refresh_token": newRefreshToken,
	})
}

// @Summary Update Password
// @Description Mengganti password pengguna yang sedang login
// @Tags Auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Router /api/auth/update-password [put]
func UpdatePassword(c *gin.Context) {
	userIDObj, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda belum login"})
		return
	}

	var userID uint
	switch v := userIDObj.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	}

	var req struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah atau password kurang dari 8 karakter"})
		return
	}

	var user models.TeamMember
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password saat ini salah!"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	user.Password = string(hashedPassword)
	config.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil diperbarui! Keamanan akun ditingkatkan."})
}