package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Tambah katalog harga baru
// @Description Menambahkan item layanan dan harga standar ke dalam pricelist
// @Tags Pricelists
// @Accept json
// @Produce json
// @Param body body dto.PricelistRequest true "Data Pricelist"
// @Success 201 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/pricelists/ [post]
func CreatePricelist(c *gin.Context) {
	var req dto.PricelistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item := models.Pricelist{
		ServiceName: req.ServiceName, 
		Category:    req.Category, 
		Price:       req.Price, 
		Description: req.Description,
	}

	config.DB.Create(&item)
	c.JSON(http.StatusCreated, gin.H{"message": "Katalog harga berhasil ditambahkan", "data": item})
}

// @Summary Update katalog harga
// @Description Memperbarui nominal harga atau detail layanan di pricelist
// @Tags Pricelists
// @Accept json
// @Produce json
// @Param id path string true "ID Pricelist"
// @Param body body dto.PricelistRequest true "Data Update"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/pricelists/{id} [put]
func UpdatePricelist(c *gin.Context) {
	id := c.Param("id")
	var item models.Pricelist

	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		return
	}

	var req dto.PricelistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item.ServiceName = req.ServiceName
	item.Category = req.Category
	item.Price = req.Price
	item.Description = req.Description

	config.DB.Save(&item)
	c.JSON(http.StatusOK, gin.H{"message": "Data berhasil diupdate", "data": item})
}

// @Summary Hapus katalog harga
// @Description Menghapus item dari pricelist
// @Tags Pricelists
// @Produce json
// @Param id path string true "ID Pricelist"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/pricelists/{id} [delete]
func DeletePricelist(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.Pricelist{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Data berhasil dihapus"})
}