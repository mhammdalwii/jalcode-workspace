package controllers

import (
	"fmt"
	"jalcode-api/config"
	"jalcode-api/models"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// @Summary Upload file ke proyek
// @Description Mengunggah file lampiran untuk proyek tertentu
// @Tags Attachments
// @Accept multipart/form-data
// @Produce json
// @Param id path string true "ID Proyek"
// @Param file formData file true "File Upload"
// @Success 201 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/projects/{id}/attachments [post]
func UploadAttachment(c *gin.Context) {
	projectIDStr := c.Param("id")
	projectID, _ := strconv.ParseUint(projectIDStr, 10, 32)

	// Tangkap file dari request
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File tidak ditemukan dalam request"})
		return
	}

	const MaxFileSize = 5 << 20 
	if file.Size > MaxFileSize {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "Ukuran file terlalu besar! Maksimal 5 MB."})
		return
	}

	// Buat nama file 
	ext := filepath.Ext(file.Filename)
	newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", newFileName)

	// Simpan file ke folder lokal "uploads" di dalam kontainer
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file ke server"})
		return
	}

	// Otomatis Lingkungan (Lokal vs Produksi)
	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}

	// Simpan catatan ke Database dengan URL yang dinamis
	attachment := models.Attachment{
		ProjectID: uint(projectID),
		FileName:  file.Filename,
		FileURL:   baseURL + "/uploads/" + newFileName,
		FileType:  ext,
	}

	config.DB.Create(&attachment)
	c.JSON(http.StatusCreated, gin.H{"message": "File berhasil diunggah", "data": attachment})
}

// @Summary Hapus file lampiran
// @Tags Attachments
// @Produce json
// @Param id path string true "ID Attachment"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/attachments/{id} [delete]
func DeleteAttachment(c *gin.Context) {
	id := c.Param("id")
	var attachment models.Attachment

	if err := config.DB.First(&attachment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File tidak ditemukan"})
		return
	}

	// Hapus catatan dari Database
	config.DB.Delete(&attachment)

	c.JSON(http.StatusOK, gin.H{"message": "File berhasil dihapus dari proyek"})
}

