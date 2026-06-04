package config

import (
	"context"
	"log"
	"os"

	"github.com/go-redis/redis/v8"
)

var RDB *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
	redisHost := os.Getenv("REDIS_HOST")
	redisPort := os.Getenv("REDIS_PORT")
	redisPassword := os.Getenv("REDIS_PASSWORD")

	// Default otomatis diarahkan ke nama kontainer Docker
	if redisHost == "" {
		redisHost = "jalcode-redis" 
	}
	if redisPort == "" {
		redisPort = "6379"
	}

	RDB = redis.NewClient(&redis.Options{
		Addr:     redisHost + ":" + redisPort,
		Password: redisPassword, 
		DB:       0,             
	})

	_, err := RDB.Ping(Ctx).Result()
	if err != nil {
		// Ganti log.Fatal menjadi log.Println
		log.Println("⚠️ PERINGATAN: GAGAL TERHUBUNG KE REDIS. Sistem akan tetap berjalan tanpa Caching. Error:", err)
	} else {
		log.Println("✅ TERHUBUNG KE REDIS SERVER (Caching Ready!)")
	}
}