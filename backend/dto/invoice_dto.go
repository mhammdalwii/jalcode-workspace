package dto

import "time"

// 🚀 STRUKTUR REQUEST UNTUK ITEM
type InvoiceItemRequest struct {
	Description string  `json:"description" binding:"required"`
	Quantity    int     `json:"quantity" binding:"required"`
	Price       float64 `json:"price" binding:"required"`
	Total       float64 `json:"total" binding:"required"`
}

type InvoiceRequest struct {
	ProjectID   uint                 `json:"project_id" binding:"required"`
	Amount      float64              `json:"amount" binding:"required"`
	Status      string               `json:"status" binding:"required"`
	IssueDate   string               `json:"issue_date"` 
	DueDate     string               `json:"due_date"`   
	ServiceType string               `json:"service_type"`
	Notes       string               `json:"notes"`
	Items       []InvoiceItemRequest `json:"items"` // 🚀 ARRAY ITEM DARI FRONTEND
}

// 🚀 STRUKTUR RESPONSE UNTUK ITEM
type InvoiceItemResponse struct {
	ID          uint    `json:"id"`
	Description string  `json:"description"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
	Total       float64 `json:"total"`
}

type InvoiceResponse struct {
	ID            uint                  `json:"id"`
	InvoiceNumber string                `json:"invoice_number"`
	ProjectID     uint                  `json:"project_id"`
	ProjectTitle  string                `json:"project_title"`
	ClientName    string                `json:"client_name"`
	Amount        float64               `json:"amount"`
	Status        string                `json:"status"`
	IssueDate     *time.Time            `json:"issue_date"`
	DueDate       *time.Time            `json:"due_date"`
	ServiceType   string                `json:"service_type"`
	Notes         string                `json:"notes"`
	Items         []InvoiceItemResponse `json:"items"` // 🚀 ARRAY ITEM UNTUK FRONTEND
	CreatedAt     time.Time             `json:"created_at"`
}