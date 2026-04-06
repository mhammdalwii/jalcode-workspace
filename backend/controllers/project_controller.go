package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Ambil semua data proyek
// @Description Mendapatkan daftar semua proyek beserta PIC, Klien, Tugas, dan Lampiran
// @Tags Projects
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/projects/ [get]
func GetProjects(c *gin.Context) {
	var projects []models.Project

	//   data dari DB beserta relasi Tim, Klien, Tasks, dan Attachments
	if err := config.DB.Preload("TeamMember").Preload("Client").Preload("Tasks").Preload("Attachments").Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data proyek"})
		return
	}

	//  array kosong untuk DTO hasil akhir
	var projectResponses []dto.ProjectResponse

	//  Perulangan untuk memetakan data
	for _, p := range projects {
		pic := dto.TeamMemberResponse{
			ID:    p.TeamMember.ID,
			Name:  p.TeamMember.Name,
			Role:  p.TeamMember.Role,
			Email: p.TeamMember.Email,
		}

		var taskResponses []dto.TaskResponse
		for _, t := range p.Tasks {
			taskResponses = append(taskResponses, dto.TaskResponse{
				ID:        t.ID,
				ProjectID: t.ProjectID,
				Title:     t.Title,
				IsDone:    t.IsDone,
			})
		}

		var attachmentResponses []dto.AttachmentResponse
		for _, a := range p.Attachments {
			attachmentResponses = append(attachmentResponses, dto.AttachmentResponse{
				ID:        a.ID,
				ProjectID: a.ProjectID,
				FileName:  a.FileName,
				FileURL:   a.FileURL,
				FileType:  a.FileType,
				CreatedAt: a.CreatedAt,
			})
		}

		projectResponse := dto.ProjectResponse{
			ID:          p.ID,
			Title:       p.Title,
			Category:    p.Category,
			Status:      p.Status,
			PIC:         pic,
			Client:      p.Client,
			Tasks:       taskResponses,
			Attachments: attachmentResponses,
		}

		projectResponses = append(projectResponses, projectResponse)
	}

	//  array DTO yang sudah bersih ke frontend
	c.JSON(http.StatusOK, gin.H{
		"data": projectResponses,
	})
}

// @Summary Tambah proyek baru
// @Description Menambahkan proyek dan menugaskannya ke anggota tim
// @Tags Projects
// @Accept json
// @Produce json
// @Param body body dto.ProjectRequest true "Data Proyek"
// @Success 201 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/projects/ [post]
func CreateProject(c *gin.Context) {
	var req dto.ProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := models.Project{
		Title:        req.Title,
		Category:     req.Category,
		Status:       req.Status,
		TeamMemberID: req.TeamMemberID,
		ClientID:     req.ClientID,
	}

	config.DB.Create(&input)
	c.JSON(http.StatusCreated, gin.H{"message": "Proyek berhasil ditambahkan!", "data": input})
}

// @Summary Update data proyek
// @Description Memperbarui informasi proyek berdasarkan ID
// @Tags Projects
// @Accept json
// @Produce json
// @Param id path string true "ID Proyek"
// @Param body body dto.ProjectRequest true "Data Update"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/projects/{id} [put]
func UpdateProject(c *gin.Context) {
	id := c.Param("id")
	var project models.Project

	if err := config.DB.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proyek tidak ditemukan!"})
		return
	}

	var req dto.ProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	project.Title = req.Title
	project.Category = req.Category
	project.Status = req.Status
	project.TeamMemberID = req.TeamMemberID
	project.ClientID = req.ClientID

	config.DB.Save(&project)
	config.DB.Preload("TeamMember").Preload("Client").First(&project, id)

	c.JSON(http.StatusOK, gin.H{"message": "Data proyek berhasil diperbarui!", "data": project})
}

// @Summary Hapus proyek
// @Description Menghapus proyek dari database berdasarkan ID
// @Tags Projects
// @Produce json
// @Param id path string true "ID Proyek"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/projects/{id} [delete]
func DeleteProject(c *gin.Context) {
	id := c.Param("id")
	var project models.Project

	if err := config.DB.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proyek tidak ditemukan!"})
		return
	}

	config.DB.Delete(&project)
	c.JSON(http.StatusOK, gin.H{"message": "Proyek berhasil dihapus dari sistem!"})
}