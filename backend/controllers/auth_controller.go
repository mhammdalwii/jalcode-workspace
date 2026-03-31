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

// @Summary Register pengguna / Tambah Tim
// @Description Mendaftarkan akun baru ke dalam sistem
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body models.TeamMember true "Data Pendaftaran"
// @Success 200 {object} map[string]interface{}
// @Router /api/auth/register [post]
// Register - Mendaftarkan anggota tim baru
func Register(c *gin.Context) {
	var input dto.RegisterRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//  Enkripsi (Hash) password menggunakan bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	// Siapkan data untuk disimpan ke database
	user := models.TeamMember{
		Name:     input.Name,
		Role:     input.Role,
		Email:    input.Email,
		Password: string(hashedPassword), 
	}

	// Simpan ke database
if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Gagal menyimpan data",
			"detail": err.Error(), 
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi berhasil! Silakan login."})
}

// @Summary Login pengguna
// @Description Melakukan autentikasi menggunakan email dan password untuk mendapatkan token JWT
// @Tags Auth
// @Accept json
// @Produce json
// @Param body body map[string]string true "Kredensial (email, password)"
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