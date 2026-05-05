package dto

import "jalcode-api/models"

// DashboardInitResponse adalah cetakan untuk membungkus 7 data sekaligus
type DashboardInitResponse struct {
	Teams    []models.TeamMember  `json:"teams"`
	Projects []models.Project     `json:"projects"`
	Clients  []models.Client      `json:"clients"`
	Mentees  []models.Mentee      `json:"mentees"`
	Contents []ContentResponse    `json:"contents"` 
	Invoices []models.Invoice     `json:"invoices"`
	Agency   models.AgencyProfile `json:"agency"`
}