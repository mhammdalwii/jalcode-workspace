package dto

import "jalcode-api/models"

// Format tampilan utama untuk Proyek
type ProjectResponse struct {
	ID         uint               `json:"id"`
	Title      string             `json:"title"`
	Category   string             `json:"category"`
	Status     string             `json:"status"`
	PIC        TeamMemberResponse `json:"pic"` 
	Client   *models.Client     `json:"client,omitempty"`
} 