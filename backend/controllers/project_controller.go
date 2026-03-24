package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Menambahkan proyek baru dan menugaskannya ke anggota tim
func CreateProject(c *gin.Context) {
	var input models.Project

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//  proyek ke database
	config.DB.Create(&input)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Proyek berhasil ditambahkan!",
		"data":    input,
	})
}

//  semua proyek beserta data anggota tim yang mengerjakannya
func GetProjects(c *gin.Context) {
    var projects []models.Project
    if err := config.DB.Preload("TeamMember").Find(&projects).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data proyek"})
        return 
    }


    // array kosong dengan format DTO
    var projectResponses []dto.ProjectResponse

    // Lakukan perulangan (looping) untuk memindahkan data dari Database ke format DTO
    for _, p := range projects {
        pic := dto.TeamMemberResponse{
            ID:    p.TeamMember.ID,
            Name:  p.TeamMember.Name,
            Role:  p.TeamMember.Role,
            Email: p.TeamMember.Email,
        }

        projectResponse := dto.ProjectResponse{
            ID:       p.ID,
            Title:    p.Title,
            Category: p.Category,
            Status:   p.Status,
            PIC:      pic, // <--- Perhatikan, key-nya sekarang bernama 'PIC'
        }

        projectResponses = append(projectResponses, projectResponse)
    }

    // Kirimkan array DTO yang sudah bersih ke frontend (Hanya ada SATU c.JSON di sini)
    c.JSON(http.StatusOK, gin.H{
        "data": projectResponses,
    })
}

func UpdateProject(c *gin.Context) {
	id := c.Param("id")
	var project models.Project

	// Cari proyek berdasarkan ID
	if err := config.DB.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proyek tidak ditemukan!"})
		return
	}

	// Tangkap data perubahan dari client
	var input models.Project
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Lakukan update ke database
	config.DB.Model(&project).Updates(input)

	// Ambil ulang data proyek yang sudah diupdate beserta data timnya (Preload)
	// agar response JSON tetap lengkap
	config.DB.Preload("TeamMember").First(&project, id)

	c.JSON(http.StatusOK, gin.H{
		"message": "Data proyek berhasil diperbarui!",
		"data":    project,
	})
}

func DeleteProject(c *gin.Context) {
	id := c.Param("id")
	var project models.Project

	// Cari proyek terlebih dahulu
	if err := config.DB.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proyek tidak ditemukan!"})
		return
	}

	// Hapus proyek dari database
	config.DB.Delete(&project)

	c.JSON(http.StatusOK, gin.H{
		"message": "Proyek berhasil dihapus dari sistem!",
	})
}