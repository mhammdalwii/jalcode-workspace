package config

import (
	"context"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
	redisHost := os.Getenv("REDIS_HOST")
	redisPort := os.Getenv("REDIS_PORT")
	redisPassword := os.Getenv("REDIS_PASSWORD")

	// Deteksi Lingkungan
	if redisHost == "" {
		if os.Getenv("APP_ENV") == "production" {
			redisHost = "jalcode-redis" 
		} else {
			redisHost = "localhost" 
		}
	}
	if redisPort == "" {
		redisPort = "6379"
	}

	// Buat koneksi sementara
	client := redis.NewClient(&redis.Options{
		Addr:     redisHost + ":" + redisPort,
		Password: redisPassword,
		DB:       0,
	})

	// Uji koneksi (Ping)
	_, err := client.Ping(Ctx).Result()
	if err != nil {
		log.Println("⚠️ PERINGATAN: GAGAL TERHUBUNG KE REDIS. Sistem akan berjalan tanpa Caching. Error:", err)
		RDB = nil 
	} else {
		RDB = client 
		log.Println("✅ TERHUBUNG KE REDIS SERVER (" + redisHost + ") - Caching Ready! ⚡")
	}
}