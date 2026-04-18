package controllers

import (
	"jalcode-api/config"
	"jalcode-api/dto"
	"jalcode-api/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Ambil profil agensi
// @Description Mengambil data profil perusahaan, logo, dan kontak utama
// @Tags Agency
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/agency/ [get]
func GetAgencyProfile(c *gin.Context) {
	var profile models.AgencyProfile
	
	if err := config.DB.First(&profile).Error; err != nil {
		// Jika belum ada data di database, kirim data default via DTO
		defaultProfile := dto.AgencyProfileResponse{
			Name:    "Muhammad Alwi",
			Company: "Jalcode Agency",
			Email:   "hello@jalcode.com",
			Phone:   "-",
		}
		c.JSON(http.StatusOK, gin.H{"data": defaultProfile})
		return
	}

	// Mapping ke DTO Response
	response := dto.AgencyProfileResponse{
		ID:      profile.ID,
		Name:    profile.Name,
		Company: profile.Company,
		Email:   profile.Email,
		Phone:   profile.Phone,
		Logo:    profile.Logo,
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// @Summary Update profil agensi
// @Description Memperbarui nama, email, logo, dan detail perusahaan
// @Tags Agency
// @Accept json
// @Produce json
// @Param body body dto.AgencyProfileRequest true "Data Agensi"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/agency/ [put]
func UpdateAgencyProfile(c *gin.Context) {
	var req dto.AgencyProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var profile models.AgencyProfile
	result := config.DB.First(&profile)

	// Update data dari Request
	profile.Name = req.Name
	profile.Company = req.Company
	profile.Email = req.Email
	profile.Phone = req.Phone
	profile.Logo = req.Logo

	if result.Error != nil {
		// Buat baru jika belum ada record sama sekali
		config.DB.Create(&profile)
	} else {
		// Simpan perubahan jika sudah ada
		config.DB.Save(&profile)
	}

	// Format response keluar
	response := dto.AgencyProfileResponse{
		ID:      profile.ID,
		Name:    profile.Name,
		Company: profile.Company,
		Email:   profile.Email,
		Phone:   profile.Phone,
		Logo:    profile.Logo,
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profil agensi berhasil diperbarui", "data": response})
}