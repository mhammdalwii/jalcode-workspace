package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupTeamRoutes(r *gin.Engine) {
	//  grup route dengan prefix /api/teams
	teamGroup := r.Group("/api/teams", middleware.RequireAuth)
	{
		teamGroup.GET("/", controllers.GetTeams)
		teamGroup.POST("/", middleware.RequireAdmin, controllers.CreateTeamMember)
		teamGroup.PUT("/:id", middleware.RequireAdmin, controllers.UpdateTeamMember)
		teamGroup.DELETE("/:id", middleware.RequireAdmin, controllers.DeleteTeamMember)
		teamGroup.PUT("/:id/reset-password", middleware.RequireAdmin, controllers.ResetTeamPassword)
	}
}