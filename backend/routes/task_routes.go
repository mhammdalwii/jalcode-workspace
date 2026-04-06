package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupTaskRoutes(r *gin.Engine) {
	taskGroup := r.Group("/api/tasks", middleware.RequireAuth)
	{
		taskGroup.POST("/", controllers.CreateTask)
		taskGroup.PATCH("/:id/status", controllers.UpdateTaskStatus)
		taskGroup.DELETE("/:id", controllers.DeleteTask)
	}
}