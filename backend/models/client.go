package models

import "time"

// Client merepresentasikan perusahaan atau entitas klien
type Client struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Company   string    `json:"company" binding:"required"` 
	Name      string    `json:"name" binding:"required"`    
	Email     string    `json:"email"`            
	Phone     string    `json:"phone"`                  
	Address   string    `json:"address"`                  
	Projects  []Project `json:"projects,omitempty" gorm:"foreignKey:ClientID"` // Relasi One-to-Many
	Credentials []Credential `json:"credentials" gorm:"foreignKey:ClientID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}