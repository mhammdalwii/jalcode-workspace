package routes

import (
	"jalcode-api/controllers"

	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(r *gin.Engine) {
	authGroup := r.Group("/api/auth")
	{
		authGroup.POST("/register", controllers.Register)
		authGroup.POST("/login", controllers.Login)
	}
}