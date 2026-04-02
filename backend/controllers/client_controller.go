package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Tambah klien baru
// @Description Menambahkan data perusahaan klien ke database
// @Tags Clients
// @Accept json
// @Produce json
// @Param body body dto.ClientRequest true "Data Klien"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/clients [post]
func CreateClient(c *gin.Context) {
	var req dto.ClientRequest 

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid: " + err.Error()})
		return
	}

	// Pindahkan data dari DTO ke Model DB yang asli
	client := models.Client{
		Company: req.Company,
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Address: req.Address,
	}

	if err := config.DB.Create(&client).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan data klien"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Data klien berhasil ditambahkan", "data": client})
}

// @Summary Ambil semua data klien
// @Description Menampilkan daftar semua klien beserta proyek yang mereka miliki
// @Tags Clients
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/clients [get]
func GetClients(c *gin.Context) {
	var clients []models.Client

	if err := config.DB.Find(&clients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data klien"})
		return
	}

	var clientResponses []dto.ClientResponse

	for _, cl := range clients {
		clientResponses = append(clientResponses, dto.ClientResponse{
			ID:        cl.ID,
			Company:   cl.Company,
			Name:      cl.Name,
			Email:     cl.Email,
			Phone:     cl.Phone,
			Address:   cl.Address,
			CreatedAt: cl.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": clientResponses})
}

// @Summary Update data klien
// @Description Memperbarui informasi klien berdasarkan ID
// @Tags Clients
// @Accept json
// @Produce json
// @Param id path string true "ID Klien"
// @Param body body dto.ClientRequest true "Data Update"
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

	var req dto.ClientRequest 
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	// Update field yang diperbolehkan saja
	client.Company = req.Company
	client.Name = req.Name
	client.Email = req.Email
	client.Phone = req.Phone
	client.Address = req.Address

	config.DB.Save(&client)
	c.JSON(http.StatusOK, gin.H{"message": "Data klien berhasil diperbarui", "data": client})
}

// @Summary Hapus data klien
// @Description Menghapus perusahaan klien dari database berdasarkan ID
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
	c.JSON(http.StatusOK, gin.H{"message": "Data klien berhasil dihapus"})
}