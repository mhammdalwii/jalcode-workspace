package controllers

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CategoryInput struct {
	Name string `json:"name" binding:"required"`
}

func CreateCategory(c *gin.Context) {
	var input CategoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	category := models.Category{Name: input.Name}
	if err := config.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Kategori sudah ada atau gagal disimpan"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Kategori ditambahkan", "data": category})
}

func DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.Category{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Kategori dihapus"})
}