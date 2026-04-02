package dto

type MenteeResponse struct {
	ID      uint               `json:"id"`
	Name    string             `json:"name"`
	Email   string             `json:"email,omitempty"`
	Program string             `json:"program"`
	Status  string             `json:"status"`
	Mentor  TeamMemberResponse `json:"mentor,omitempty"`
}

type MenteeRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email"`
	Program  string `json:"program" binding:"required"`
	Status   string `json:"status" binding:"required"`
	MentorID uint   `json:"mentor_id" binding:"required"`
}