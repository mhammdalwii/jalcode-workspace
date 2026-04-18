package models

import "time"

type AgencyProfile struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Company   string    `json:"company"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Logo      string    `json:"logo" gorm:"type:text"` 
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}