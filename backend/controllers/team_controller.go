package controllers

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetTeamMembers godoc
// @Summary Mengambil semua data anggota tim
// @Description Mendapatkan daftar lengkap semua tim beserta role-nya
// @Tags Teams
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/teams/ [get]
// Mengambil semua data anggota tim
func GetTeamMembers(c *gin.Context) {
	var teams []models.TeamMember
	// GORM otomatis melakukan "SELECT * FROM team_members"
	config.DB.Find(&teams)

	c.JSON(http.StatusOK, gin.H{
		"data": teams,
	})
}

// Menambahkan anggota tim baru
func CreateTeamMember(c *gin.Context) {
	var input models.TeamMember

	// Validasi JSON yang dikirim client 
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Simpan ke database
	config.DB.Create(&input)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Anggota tim berhasil ditambahkan!",
		"data":    input,
	})
}

func UpdateTeamMember(c *gin.Context) {
	//  ID dari URL
	id := c.Param("id")
	var team models.TeamMember

	//  data di database berdasarkan ID
	// Jika tidak ditemukan, kembalikan error 404
	if err := config.DB.First(&team, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anggota tim tidak ditemukan!"})
		return
	}

	// data JSON baru dari client
	var input models.TeamMember
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// update data ke database
	config.DB.Model(&team).Updates(input)

	c.JSON(http.StatusOK, gin.H{
		"message": "Data anggota tim berhasil diperbarui!",
		"data":    team,
	})
}

func DeleteTeamMember(c *gin.Context) {
	//  Ambil ID dari URL
	id := c.Param("id")
	var team models.TeamMember

	// data terlebih dahulu
	if err := config.DB.First(&team, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Anggota tim tidak ditemukan!"})
		return
	}

	//  data dari database
	config.DB.Delete(&team)

	c.JSON(http.StatusOK, gin.H{
		"message": "Anggota tim berhasil dihapus dari sistem!",
	})
}