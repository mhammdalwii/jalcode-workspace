package controllers

import (
	"jalcode-api/config"
	"jalcode-api/models"
	"jalcode-api/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CredentialRequest struct {
	Type       string `json:"type"`
	URL        string `json:"url"`
	Username   string `json:"username"`
	Password   string `json:"password"`
	ExpiryDate string `json:"expiry_date"` // Format yang diharapkan frontend: YYYY-MM-DD
	Notes      string `json:"notes"`
}

// @Summary Tambah akses kredensial klien
// @Description Menyimpan password cPanel/Hosting/WordPress klien secara terenkripsi AES-256
// @Tags Credentials
// @Accept json
// @Produce json
// @Param client_id path string true "ID Klien"
// @Param body body controllers.CredentialRequest true "Data Kredensial"
// @Success 201 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/clients/{client_id}/credentials [post]
func CreateCredential(c *gin.Context) {
	clientIDStr := c.Param("client_id")
	clientID, _ := strconv.ParseUint(clientIDStr, 10, 32)

	var req CredentialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//  Enkripsi Password (AES-256)
	encryptedPassword, err := utils.Encrypt(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	// Parse Tanggal Secara Aman
	var expiryDate time.Time
	if req.ExpiryDate != "" {
		// Menggunakan format standar tanggal Golang: 2006-01-02
		parsed, err := time.Parse("2006-01-02", req.ExpiryDate)
		if err == nil {
			expiryDate = parsed
		}
	}

	//  Simpan ke Database
	cred := models.Credential{
		ClientID:   uint(clientID),
		Type:       req.Type,
		URL:        req.URL,
		Username:   req.Username,
		Password:   encryptedPassword, // Password acak yang tersimpan
		ExpiryDate: expiryDate,        // Variabel ini sekarang digunakan dengan benar!
		Notes:      req.Notes,
	}

	config.DB.Create(&cred)

	// Catat di Audit Trail
	userIDObj, exists := c.Get("id")
	if exists {
		// Konversi ke uint
		var userID uint
		switch v := userIDObj.(type) {
		case float64:
			userID = uint(v)
		case uint:
			userID = v
		}
		utils.LogActivity(userID, "Menambahkan akses kredensial", "Klien ID: "+clientIDStr)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Kredensial berhasil diamankan!", "data": cred})
}

// @Summary Hapus akses kredensial
// @Description Menghapus data kredensial klien dari database secara permanen
// @Tags Credentials
// @Produce json
// @Param id path string true "ID Kredensial"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/credentials/{id} [delete]
func DeleteCredential(c *gin.Context) {
	id := c.Param("id")
	var cred models.Credential

	// Cari datanya dulu
	if err := config.DB.First(&cred, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kredensial tidak ditemukan"})
		return
	}

	// Hapus datanya
	config.DB.Delete(&cred)

	// Catat di Audit Trail
	userIDObj, exists := c.Get("id")
	if exists {
		var userID uint
		switch v := userIDObj.(type) {
		case float64:
			userID = uint(v)
		case uint:
			userID = v
		}
		utils.LogActivity(userID, "Menghapus kredensial", cred.Type+" (Klien ID: "+strconv.Itoa(int(cred.ClientID))+")")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kredensial berhasil dihapus secara permanen"})
}

// @Summary Ambil daftar kredensial klien
// @Description Mengambil semua data akses (cPanel, WordPress, dll) milik satu klien tertentu
// @Tags Credentials
// @Produce json
// @Param client_id path string true "ID Klien"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/clients/{client_id}/credentials [get]
func GetCredentials(c *gin.Context) {
	clientID := c.Param("client_id")
	var credentials []models.Credential

	// Cari semua kredensial berdasarkan ID Klien
	if err := config.DB.Where("client_id = ?", clientID).Order("created_at desc").Find(&credentials).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data kredensial"})
		return
	}

	// Kita buat array map khusus untuk response, agar kita bisa memasukkan password yang sudah di-dekripsi
	var response []map[string]interface{}

	for _, cred := range credentials {
		// BUKA KUNCI ENKRIPSI! 🔓
		decryptedPassword, err := utils.Decrypt(cred.Password)
		if err != nil {
			// Jika gagal (misal kunci di .env berubah), jangan buat sistem crash, cukup beri peringatan
			decryptedPassword = "--- ENKRIPSI RUSAK / KUNCI BERUBAH ---"
		}

		response = append(response, map[string]interface{}{
			"id":          cred.ID,
			"client_id":   cred.ClientID,
			"type":        cred.Type,
			"url":         cred.URL,
			"username":    cred.Username,
			"password":    decryptedPassword, // Password yang sudah bersih dan bisa dibaca
			"expiry_date": cred.ExpiryDate,
			"notes":       cred.Notes,
			"created_at":  cred.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}