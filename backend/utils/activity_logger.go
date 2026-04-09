package utils

import (
	"jalcode-api/config"
	"jalcode-api/models"
)

// LogActivity adalah fungsi bantuan untuk mencatat aktivitas ke database secara instan
func LogActivity(userID uint, action string, target string) {
	log := models.ActivityLog{
		UserID: userID,
		Action: action,
		Target: target,
	}
	// Simpan di background tanpa memblokir proses utama
	go config.DB.Create(&log) 
}