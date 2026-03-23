package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// DB adalah variabel global untuk dipanggil dari file lain
var DB *gorm.DB

func ConnectDatabase() {
	//  file .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Gagal membaca file .env")
	}

	//  Susun string koneksi (DSN)
	dsn := "host=" + os.Getenv("DB_HOST") + 
		" user=" + os.Getenv("DB_USER") + 
		" password=" + os.Getenv("DB_PASSWORD") + 
		" dbname=" + os.Getenv("DB_NAME") + 
		" port=" + os.Getenv("DB_PORT") + 
		" sslmode=disable"

	//  menggunakan GORM
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke database!", err)
	}

	DB = database
	log.Println("✅ Koneksi PostgreSQL Berhasil!")
}