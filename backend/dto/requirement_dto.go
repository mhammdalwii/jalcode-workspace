package dto

type RequirementFeatureReq struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
}

type ProjectRequirementReq struct {
	ProjectID         uint                    `json:"project_id" binding:"required"`
	BusinessGoal      string                  `json:"business_goal"`
	TargetAudience    string                  `json:"target_audience"`
	DesignPreferences string                  `json:"design_preferences"`
	TechStack         string                  `json:"tech_stack"`
	Notes             string                  `json:"notes"`
	Features          []RequirementFeatureReq `json:"features"`
}