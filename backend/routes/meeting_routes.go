package routes

import (
	"jalcode-api/controllers"

	"github.com/gin-gonic/gin"
)

func SetupMeetingRoutes(r *gin.Engine) {
	meetingGroup := r.Group("/api/meetings")
	{
		meetingGroup.GET("/", controllers.GetMeetings)
		meetingGroup.POST("/", controllers.CreateMeeting)
		meetingGroup.DELETE("/:id", controllers.DeleteMeeting)
		
		// Rute khusus untuk membalik status checklist Action Item
		meetingGroup.PATCH("/actions/:action_id/status", controllers.ToggleActionItem)
	}
}