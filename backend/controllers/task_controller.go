package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Tambah tugas baru ke proyek
// @Description Menambahkan to-do list ke dalam proyek tertentu
// @Tags Tasks
// @Accept json
// @Produce json
// @Param body body dto.TaskRequest true "Data Tugas"
// @Success 201 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/tasks/ [post]
func CreateTask(c *gin.Context) {
	var req dto.TaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task := models.Task{
		ProjectID: req.ProjectID,
		Title:     req.Title,
		IsDone:    false, // Default selalu belum selesai
	}

	config.DB.Create(&task)
	c.JSON(http.StatusCreated, gin.H{"message": "Tugas berhasil ditambahkan", "data": task})
}

// @Summary Update status tugas (Centang)
// @Description Mengubah status tugas menjadi selesai (true) atau belum (false)
// @Tags Tasks
// @Accept json
// @Produce json
// @Param id path string true "ID Tugas"
// @Param body body dto.TaskStatusRequest true "Status Tugas"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/tasks/{id}/status [patch]
func UpdateTaskStatus(c *gin.Context) {
	id := c.Param("id")
	var task models.Task

	if err := config.DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	var req dto.TaskStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task.IsDone = req.IsDone
	config.DB.Save(&task)

	c.JSON(http.StatusOK, gin.H{"message": "Status tugas diperbarui", "data": task})
}

// @Summary Hapus tugas
// @Description Menghapus tugas dari to-do list
// @Tags Tasks
// @Produce json
// @Param id path string true "ID Tugas"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/tasks/{id} [delete]
func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task

	if err := config.DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tugas tidak ditemukan"})
		return
	}

	config.DB.Delete(&task)
	c.JSON(http.StatusOK, gin.H{"message": "Tugas berhasil dihapus"})
}