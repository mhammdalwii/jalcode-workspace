package dto

// TaskResponse mengatur data tugas yang dikirim ke Frontend
type TaskResponse struct {
	ID        uint   `json:"id"`
	ProjectID uint   `json:"project_id"`
	Title     string `json:"title"`
	IsDone    bool   `json:"is_done"`
}

// TaskRequest mengatur data saat membuat tugas baru
type TaskRequest struct {
	ProjectID uint   `json:"project_id" binding:"required"`
	Title     string `json:"title" binding:"required"`
}

// TaskStatusRequest mengatur data saat mencentang tugas (Selesai/Belum)
type TaskStatusRequest struct {
	IsDone bool `json:"is_done"`
}