package dto

import "jalcode-api/models"

// Format tampilan untuk data Tim di dalam Proyek (Tanpa tanggal dan tanpa array projects yang null)
type TeamMemberResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	Email string `json:"email"`
}

// Format tampilan utama untuk Proyek
type ProjectResponse struct {
	ID         uint               `json:"id"`
	Title      string             `json:"title"`
	Category   string             `json:"category"`
	Status     string             `json:"status"`
	PIC        TeamMemberResponse `json:"pic"` 
	Client   *models.Client     `json:"client,omitempty"`
} 