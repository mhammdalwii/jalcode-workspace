package dto

type ActionItemReq struct {
	Task   string `json:"task" binding:"required"`
	PICIDs []uint `json:"pic_ids" binding:"required"`
}

type MeetingNoteReq struct {
	ProjectID   *uint           `json:"project_id"` // Bisa dikosongkan
	Title       string          `json:"title" binding:"required"`
	Date        string          `json:"date" binding:"required"` // Format dari frontend: YYYY-MM-DD
	Notes       string          `json:"notes"`
	ActionItems []ActionItemReq `json:"action_items"`
}