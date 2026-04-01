package controllers

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"net/http"
	// "jalcode-api/config"
	// "jalcode-api/models"
	"github.com/gin-gonic/gin"
)

// @Summary Ambil semua data peserta didik
// @Description Menampilkan daftar semua mentee beserta mentornya
// @Tags Mentorship
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/mentees [get]
func GetMentees(c *gin.Context) {
	var mentees []models.Mentee
	// Gunakan Preload untuk menarik data Mentor (TeamMember)
	if err := config.DB.Preload("Mentor").Find(&mentees).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data mentee"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": mentees})
}

// @Summary Tambah peserta didik baru
// @Description Mendaftarkan mentee baru ke dalam program mentorship
// @Tags Mentorship
// @Accept json
// @Produce json
// @Param body body models.Mentee true "Data Mentee"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/mentees [post]
func CreateMentee(c *gin.Context) {
	var input models.Mentee
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data mentee"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Peserta didik berhasil didaftarkan", "data": input})
}

// @Summary Update data peserta didik
// @Description Memperbarui informasi mentee berdasarkan ID
// @Tags Mentorship
// @Accept json
// @Produce json
// @Param id path string true "ID Mentee"
// @Param body body models.Mentee true "Data Update"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/mentees/{id} [put]
func UpdateMentee(c *gin.Context) {
	id := c.Param("id")
	var mentee models.Mentee

	if err := config.DB.First(&mentee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Peserta didik tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&mentee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	config.DB.Save(&mentee)
	c.JSON(http.StatusOK, gin.H{"message": "Data peserta didik berhasil diperbarui", "data": mentee})
}

// @Summary Hapus data peserta didik
// @Description Menghapus mentee dari sistem
// @Tags Mentorship
// @Produce json
// @Param id path string true "ID Mentee"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/mentees/{id} [delete]
func DeleteMentee(c *gin.Context) {
	id := c.Param("id")
	var mentee models.Mentee

	if err := config.DB.First(&mentee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Peserta didik tidak ditemukan"})
		return
	}

	config.DB.Delete(&mentee)
	c.JSON(http.StatusOK, gin.H{"message": "Peserta didik berhasil dihapus"})
}