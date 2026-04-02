package dto

type MenteeResponse struct {
	ID      uint               `json:"id"`
	Name    string             `json:"name"`
	Email   string             `json:"email,omitempty"`
	Program string             `json:"program"`
	Status  string             `json:"status"`
	Mentor  TeamMemberResponse `json:"mentor,omitempty"`
}