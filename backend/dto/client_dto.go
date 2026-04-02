package dto

import "time"

type ClientResponse struct {
	ID        uint      `json:"id"`
	Company   string    `json:"company"`
	Name      string    `json:"name"`
	Email     string    `json:"email,omitempty"`
	Phone     string    `json:"phone,omitempty"`
	Address   string    `json:"address,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}