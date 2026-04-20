package routes

import (
	"jalcode-api/controllers"
	"jalcode-api/middleware"

	"github.com/gin-gonic/gin"
)

func SetupTeamRoutes(r *gin.Engine) {
	//  Semua route di dalam grup ini WAJIB bawa token (RequireAuth)
	teamGroup := r.Group("/api/teams", middleware.RequireAuth)
	{
		// Semua anggota tim (yang sudah login) boleh melihat daftar tim
		teamGroup.GET("/", controllers.GetTeams)

		teamGroup.POST("/", middleware.RequireRoles("Founder", "Admin"), controllers.CreateTeamMember)
		teamGroup.PUT("/:id", middleware.RequireRoles("Founder", "Admin"), controllers.UpdateTeamMember)
		teamGroup.DELETE("/:id", middleware.RequireRoles("Founder", "Admin"), controllers.DeleteTeamMember)
		teamGroup.PUT("/:id/reset-password", middleware.RequireRoles("Founder", "Admin"), controllers.ResetTeamPassword)
	}
}