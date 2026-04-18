package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupAuthRoutes(r *gin.Engine) {
	authGroup := r.Group("/api/auth")
	{
		// Rute Publik (Tidak butuh token JWT)
		authGroup.POST("/register", controllers.Register)
		authGroup.POST("/login", controllers.Login)

		// Rute Privat (Wajib membawa token JWT)
		protected := authGroup.Group("/")
		protected.Use(middleware.RequireAuth)
		{
			protected.PUT("/update-password", controllers.UpdatePassword)
		}
	}
}