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
	Tasks    []TaskResponse     `json:"tasks"`
	Attachments []AttachmentResponse `json:"attachments"`
} 

type ProjectRequest struct {
	Title        string `json:"title" binding:"required"`
	Category     string `json:"category" binding:"required"`
	Status       string `json:"status" binding:"required"`
	TeamMemberID uint   `json:"team_member_id" binding:"required"`
	ClientID     *uint  `json:"client_id"` 
}