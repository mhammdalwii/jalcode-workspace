package dto

type PricelistRequest struct {
	ServiceName string  `json:"service_name" binding:"required"`
	Category    string  `json:"category" binding:"required"`
	Price       float64 `json:"price" binding:"required"`
	Description string  `json:"description"`
}