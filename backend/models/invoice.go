package models

import "time"

// 🚀 TABEL BARU: Rincian per baris tagihan
type InvoiceItem struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	InvoiceID   uint    `json:"invoice_id"` // Foreign key
	Description string  `json:"description"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
	Total       float64 `json:"total"`
}

type Invoice struct {
	ID            uint          `json:"id" gorm:"primaryKey"`
	InvoiceNumber string        `json:"invoice_number" gorm:"unique"` 
	ProjectID     uint          `json:"project_id"`
	Project       Project       `json:"project" gorm:"foreignKey:ProjectID"` 
	Amount        float64       `json:"amount"`
	Status        string        `json:"status"`       
	IssueDate     time.Time     `json:"issue_date"`   
	DueDate       time.Time     `json:"due_date"`     
	ServiceType   string        `json:"service_type"` 
	Notes         string        `json:"notes"`
	Items         []InvoiceItem `json:"items" gorm:"foreignKey:InvoiceID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt     time.Time     `json:"created_at"`
}