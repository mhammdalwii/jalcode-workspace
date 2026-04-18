package dto

type AgencyProfileRequest struct {
	Name    string `json:"name" binding:"required"`
	Company string `json:"company" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Phone   string `json:"phone"`
	Logo    string `json:"logo"`
}

type AgencyProfileResponse struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Company string `json:"company"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Logo    string `json:"logo"`
}