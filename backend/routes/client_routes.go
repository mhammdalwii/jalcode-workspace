package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupClientRoutes(r *gin.Engine) {
	clientGroup := r.Group("/api/clients", middleware.RequireAuth)
	{
		clientGroup.GET("/", controllers.GetClients)
		clientGroup.POST("/", controllers.CreateClient)
		clientGroup.PUT("/:id", controllers.UpdateClient)
		clientGroup.DELETE("/:id", controllers.DeleteClient)
	}
}