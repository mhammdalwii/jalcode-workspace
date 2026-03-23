package dto

// Format untuk Register
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Role     string `json:"role" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"` 
}

// Format untuk Login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}