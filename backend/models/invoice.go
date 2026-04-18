package models

import "time"

type Invoice struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	InvoiceNumber string    `json:"invoice_number" gorm:"unique"` // Contoh: INV-202604-001
	ProjectID     uint      `json:"project_id"`
	Project       Project   `json:"project" gorm:"foreignKey:ProjectID"` // Relasi ke proyek yang ditagih
	Amount        float64   `json:"amount"`
	Status        string    `json:"status"`       // "Unpaid", "Paid", "Overdue"
	IssueDate     time.Time `json:"issue_date"`   // Tanggal terbit
	DueDate       time.Time `json:"due_date"`     // Tenggat waktu bayar
	ServiceType   string    `json:"service_type"` // Web App, Mobile App, UI/UX, IoT, atau Mentorship
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
}