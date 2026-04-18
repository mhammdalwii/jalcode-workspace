package dto

import "time"

type InvoiceRequest struct {
	ProjectID   uint    `json:"project_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	Status      string  `json:"status" binding:"required"`
	IssueDate   string  `json:"issue_date"` // Format: YYYY-MM-DD
	DueDate     string  `json:"due_date"`   // Format: YYYY-MM-DD
	ServiceType string  `json:"service_type"`
	Notes       string  `json:"notes"`
}

type InvoiceResponse struct {
	ID            uint       `json:"id"`
	InvoiceNumber string     `json:"invoice_number"`
	ProjectID     uint       `json:"project_id"`
	ProjectTitle  string     `json:"project_title"`
	ClientName    string     `json:"client_name"`
	Amount        float64    `json:"amount"`
	Status        string     `json:"status"`
	IssueDate     *time.Time `json:"issue_date"`
	DueDate       *time.Time `json:"due_date"`
	ServiceType   string     `json:"service_type"`
	Notes         string     `json:"notes"`
	CreatedAt     time.Time  `json:"created_at"`
}