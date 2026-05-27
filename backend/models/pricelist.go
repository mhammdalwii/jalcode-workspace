package models

import "time"

type Pricelist struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ServiceName string    `json:"service_name"`
	Category    string    `json:"category"` 
	Price       float64   `json:"price"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}