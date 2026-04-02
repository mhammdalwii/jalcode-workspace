package seeders

import (
	"jalcode-api/config"
	"jalcode-api/models"

	"golang.org/x/crypto/bcrypt"
)

// SeedTeamMembers membuat user default jika belum ada di database.
func SeedTeamMembers() error {
	// Contoh user admin default
	const (
		defaultName     = "Admin Jalcode"
		defaultRole     = "admin"
		defaultEmail    = "admin@jalcode.test"
		defaultPassword = "password123" // password asli yang bisa dipakai login
	)

	var count int64
	if err := config.DB.Model(&models.TeamMember{}).
		Where("email = ?", defaultEmail).
		Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		// Sudah ada user dengan email tersebut, tidak perlu seeding lagi
		return nil
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.TeamMember{
		Name:     defaultName,
		Role:     defaultRole,
		Email:    defaultEmail,
		Password: string(hashedPassword),
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return err
	}

	return nil
}
