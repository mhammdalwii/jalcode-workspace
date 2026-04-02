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
		teamGroup.POST("/", controllers.CreateTeamMember)
		teamGroup.PUT("/:id", controllers.UpdateTeamMember)
		teamGroup.DELETE("/:id", controllers.DeleteTeamMember)
	}
}