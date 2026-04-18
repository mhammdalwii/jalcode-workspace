package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"jalcode-api/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

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

	//  data dari DTO ke Model

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
// @Description Melakukan autentikasi menggunakan email dan password untuk mendapatkan token JWT
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

	//  Cari user di database berdasarkan email
	var user models.TeamMember
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah!"})
		return
	}

	//  Cocokkan password yang dikirim dengan hash di database
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau password salah!"})
		return
	}

	//  Jika cocok, buatkan Token JWT
	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token"})
		return
	}

	// Kirim token ke frontend
	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil!",
		"token":   token,
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
	//  User dari Token menggunakan kunci "id"
	userIDObj, exists := c.Get("id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Anda belum login"})
		return
	}

	//  JWT membaca angka sebagai float64, kita ubah ke uint
	var userID uint
	switch v := userIDObj.(type) {
	case float64:
		userID = uint(v)
	case uint:
		userID = v
	}

	//  Input dari Frontend
	var req struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewPassword     string `json:"new_password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah atau password kurang dari 8 karakter"})
		return
	}

	//  Data User di Database (Pakai tabel TeamMember)
	var user models.TeamMember
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}

	//  Verifikasi Password Saat Ini (Bcrypt)
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password saat ini salah!"})
		return
	}

	// Enkripsi dan Simpan Password Baru
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	user.Password = string(hashedPassword)
	config.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil diperbarui! Keamanan akun ditingkatkan."})
}