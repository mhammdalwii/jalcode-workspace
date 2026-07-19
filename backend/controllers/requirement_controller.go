package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary Ambil Analisis Kebutuhan
// @Description Mengambil detail Project Brief berdasarkan ID Proyek
// @Tags Requirements
// @Router /api/projects/{id}/requirement [get]
func GetRequirement(c *gin.Context) {
	projectID := c.Param("id")
	var requirement models.ProjectRequirement

	// Cari data berdasarkan ID Proyek, dan tarik juga daftar fiturnya (Preload)
	if err := config.DB.Preload("Features").Where("project_id = ?", projectID).First(&requirement).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Analisis kebutuhan belum dibuat untuk proyek ini", 
			"data": nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": requirement})
}

// @Summary Simpan / Perbarui Analisis Kebutuhan
// @Description Menyimpan baru (Create) atau memperbarui (Update) data Project Brief
// @Tags Requirements
// @Router /api/projects/{id}/requirement [post]
func SaveRequirement(c *gin.Context) {
	projectIDStr := c.Param("id")
	projectID, errConv := strconv.ParseUint(projectIDStr, 10, 32)
	if errConv != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID Proyek tidak valid"})
		return
	}

	var req dto.ProjectRequirementReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Siapkan daftar fitur baru dari request Frontend
	var newFeatures []models.RequirementFeature
	for _, f := range req.Features {
		newFeatures = append(newFeatures, models.RequirementFeature{
			Title:       f.Title,
			Description: f.Description,
		})
	}

	var existingReq models.ProjectRequirement
	err := config.DB.Where("project_id = ?", projectID).First(&existingReq).Error

	if err == nil {
		existingReq.BusinessGoal = req.BusinessGoal
		existingReq.TargetAudience = req.TargetAudience
		existingReq.DesignPreferences = req.DesignPreferences
		existingReq.TechStack = req.TechStack
		existingReq.Notes = req.Notes

		// Hapus daftar fitur yang lama, ganti dengan yang baru (menghindari duplikasi)
		config.DB.Where("requirement_id = ?", existingReq.ID).Delete(&models.RequirementFeature{})
		existingReq.Features = newFeatures

		config.DB.Save(&existingReq)
		c.JSON(http.StatusOK, gin.H{"message": "Analisis kebutuhan berhasil diperbarui!", "data": existingReq})
	} else {
		newReq := models.ProjectRequirement{
			ProjectID:         uint(projectID),
			BusinessGoal:      req.BusinessGoal,
			TargetAudience:    req.TargetAudience,
			DesignPreferences: req.DesignPreferences,
			TechStack:         req.TechStack,
			Notes:             req.Notes,
			Features:          newFeatures,
		}
		config.DB.Create(&newReq)
		c.JSON(http.StatusCreated, gin.H{"message": "Analisis kebutuhan berhasil disimpan!", "data": newReq})
	}
}