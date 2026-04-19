package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// GetTeamMembers godoc
// @Summary Mengambil semua data anggota tim
// @Description Mendapatkan daftar lengkap semua tim beserta role-nya
// @Tags Teams
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/teams/ [get]
// Mengambil semua data anggota tim
func GetTeams(c *gin.Context) {
	var teams []models.TeamMember

	if err := config.DB.Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data tim"})
		return
	}

	// Siapkan array kosong untuk DTO
	var teamResponses []dto.TeamMemberResponse

	// Looping untuk memindahkan data dari DB ke DTO
	for _, t := range teams {
		teamResponses = append(teamResponses, dto.TeamMemberResponse{
			ID:    t.ID,
			Name:  t.Name,
			Email: t.Email,
			Role:  t.Role,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": teamResponses})
}

// @Summary Menambahkan anggota tim baru
// @Description Mendaftarkan anggota tim baru ke dalam sistem
// @Tags Teams
// @Accept json
// @Produce json
// @Param body body dto.TeamMemberRequest true "Data Anggota Tim"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/teams [post]
func CreateTeamMember(c *gin.Context) {
	var req dto.TeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password sebelum simpan
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)

	input := models.TeamMember{
		Name:     req.Name,
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     req.Role,
	}

	config.DB.Create(&input)
	input.Password = "" // Sembunyikan saat return JSON
	c.JSON(http.StatusCreated, gin.H{"message": "Anggota tim berhasil ditambahkan!", "data": input})
}

// @Summary Mengedit data anggota tim
// @Description Memperbarui nama, role, email, atau password anggota tim berdasarkan ID
// @Tags Teams
// @Accept json
// @Produce json
// @Param id path string true "ID Anggota Tim"
// @Param body body dto.TeamMemberRequest true "Data Update"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/teams/{id} [put]
func UpdateTeamMember(c *gin.Context) {
	id := c.Param("id")
	var team models.TeamMember

	if err := config.DB.First(&team, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anggota tim tidak ditemukan"})
		return
	}

	var req dto.TeamMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	team.Name = req.Name
	team.Role = req.Role
	team.Email = req.Email

	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err == nil {
			team.Password = string(hashedPassword)
		}
	}

	config.DB.Save(&team)
	team.Password = ""
	c.JSON(http.StatusOK, gin.H{"message": "Data anggota berhasil diperbarui", "data": team})
}

// @Summary Menghapus anggota tim
// @Description Menghapus data anggota tim secara permanen berdasarkan ID
// @Tags Teams
// @Produce json
// @Param id path string true "ID Anggota Tim"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/teams/{id} [delete]
func DeleteTeamMember(c *gin.Context) {
	id := c.Param("id")
	var team models.TeamMember

	// Cek apakah anggota tim ada
	if err := config.DB.First(&team, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anggota tim tidak ditemukan"})
		return
	}

	// Hapus data dari database
	if err := config.DB.Delete(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus anggota tim"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Anggota tim berhasil dihapus"})
}

// @Summary Reset Password Tim
// @Description Mereset password anggota tim menjadi default "jalcode123" (Hanya Admin)
// @Tags Teams
// @Produce json
// @Security BearerAuth
// @Router /api/teams/{id}/reset-password [put]
func ResetTeamPassword(c *gin.Context) {
	id := c.Param("id")
	var member models.TeamMember

	// Cari anggota berdasarkan ID
	if err := config.DB.First(&member, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anggota tidak ditemukan"})
		return
	}

	//  hash untuk password default: "jalcode123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("jalcode123"), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat password default"})
		return
	}

	// Simpan ke database
	member.Password = string(hashedPassword)
	config.DB.Save(&member)

	c.JSON(http.StatusOK, gin.H{"message": "Password berhasil direset menjadi: jalcode123"})
}