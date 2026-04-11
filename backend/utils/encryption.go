package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"os"
)

//  kunci rahasia dari .env
func getSecretKey() []byte {
	key := os.Getenv("ENCRYPTION_KEY")
	if len(key) != 32 {
		// Fallback sementara jika lupa set di .env
		return []byte("JalcodeRahasiaSuperAman32Karaktr") 
	}
	return []byte(key)
}

// Encrypt mengunci teks menjadi kode acak (AES-GCM)
func Encrypt(plainText string) (string, error) {
	block, err := aes.NewCipher(getSecretKey())
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	cipherText := aesGCM.Seal(nonce, nonce, []byte(plainText), nil)
	return base64.URLEncoding.EncodeToString(cipherText), nil
}

// Decrypt membuka kode acak kembali menjadi teks asli
func Decrypt(encryptedText string) (string, error) {
	data, err := base64.URLEncoding.DecodeString(encryptedText)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(getSecretKey())
	if err != nil {
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := aesGCM.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("kode terenkripsi terlalu pendek")
	}

	nonce, cipherText := data[:nonceSize], data[nonceSize:]
	plainText, err := aesGCM.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return "", err
	}

	return string(plainText), nil
}