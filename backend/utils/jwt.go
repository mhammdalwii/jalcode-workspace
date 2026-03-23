package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken akan membuat tiket JWT yang berlaku selama 24 jam
func GenerateToken(userID uint, role string) (string, error) {
	//  kunci rahasia dari file .env
	secretKey := []byte(os.Getenv("JWT_SECRET"))

	// Buat isi tiketnya (Claims)
	claims := jwt.MapClaims{
		"id":   userID,
		"role": role,
		"exp":  time.Now().Add(time.Hour * 24).Unix(), 
	}

	// Buat token dengan algoritma HS256
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Tanda tangani token tersebut
	return token.SignedString(secretKey)
}