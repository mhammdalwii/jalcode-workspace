package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupProjectRoutes(r *gin.Engine) {
projectGroup := r.Group("/api/projects", middleware.RequireAuth)
	{
		projectGroup.GET("/", controllers.GetProjects)
		projectGroup.PUT("/:id", controllers.UpdateProject) // Biarkan agar tim bisa ubah status (Kanban)
		projectGroup.POST("/", middleware.RequireRoles("Founder", "Admin"), controllers.CreateProject)
		projectGroup.POST("/:id/attachments", controllers.UploadAttachment)
		projectGroup.DELETE("/:id", middleware.RequireRoles("Founder", "Admin"), controllers.DeleteProject)
		r.DELETE("/api/attachments/:id", middleware.RequireAuth, controllers.DeleteAttachment)
		r.GET("/api/activities/", middleware.RequireAuth, controllers.GetActivities)
	}
}

