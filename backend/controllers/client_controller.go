package controllers

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Ambil semua data klien
// @Description Menampilkan daftar semua klien beserta proyek yang mereka miliki
// @Tags Clients
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/clients [get]
func GetClients(c *gin.Context) {
	var clients []models.Client
	// Gunakan Preload untuk menarik data proyek yang terhubung dengan klien ini
	if err := config.DB.Preload("Projects").Find(&clients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data klien"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": clients})
}

// @Summary Tambah klien baru
// @Description Menyimpan data perusahaan/klien baru ke database
// @Tags Clients
// @Accept json
// @Produce json
// @Param body body models.Client true "Data Klien"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/clients [post]
func CreateClient(c *gin.Context) {
	var input models.Client
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data klien"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Klien berhasil ditambahkan", "data": input})
}

// @Summary Update data klien
// @Description Memperbarui informasi klien berdasarkan ID
// @Tags Clients
// @Accept json
// @Produce json
// @Param id path string true "ID Klien"
// @Param body body models.Client true "Data Klien"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/clients/{id} [put]
func UpdateClient(c *gin.Context) {
	id := c.Param("id")
	var client models.Client

	if err := config.DB.First(&client, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Klien tidak ditemukan"})
		return
	}

	if err := c.ShouldBindJSON(&client); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	config.DB.Save(&client)
	c.JSON(http.StatusOK, gin.H{"message": "Data klien berhasil diperbarui", "data": client})
}

// @Summary Hapus data klien
// @Description Menghapus klien dari sistem
// @Tags Clients
// @Produce json
// @Param id path string true "ID Klien"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/clients/{id} [delete]
func DeleteClient(c *gin.Context) {
	id := c.Param("id")
	var client models.Client

	if err := config.DB.First(&client, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Klien tidak ditemukan"})
		return
	}

	config.DB.Delete(&client)
	c.JSON(http.StatusOK, gin.H{"message": "Klien berhasil dihapus"})
}