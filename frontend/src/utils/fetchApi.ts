import Cookies from "js-cookie";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  //  token utama
  const token = Cookies.get("token");

  // Siapkan header bawaan
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  //  Pasang token ke header jika ada
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  //  request pertama ke Golang
  let response = await fetch(url, { ...options, headers });

  //  JIKA GOLANG MENOLAK (401 Unauthorized - Token Mati/Basi)
  if (response.status === 401) {
    const refreshToken = Cookies.get("refresh_token");

    if (refreshToken) {
      try {
        // Diam-diam minta token baru ke Golang menggunakan Refresh Token
        const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();

          // Simpan token yang baru (Diperpanjang)
          Cookies.set("token", data.token, { expires: 1 });
          Cookies.set("refresh_token", data.refresh_token, { expires: 7 });

          // ULANGI REQUEST YANG GAGAL TADI dengan token baru!
          headers["Authorization"] = `Bearer ${data.token}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh token juga sudah kedaluwarsa (Harus login ulang)
          throw new Error("Sesi benar-benar habis");
        }
      } catch (error) {
        // Bersihkan semua cookie dan tendang ke halaman login
        Cookies.remove("token");
        Cookies.remove("refresh_token");
        Cookies.remove("role");
        window.location.href = "/login";
      }
    } else {
      // Tidak punya refresh token sama sekali
      Cookies.remove("token");
      Cookies.remove("role");
      window.location.href = "/login";
    }
  }

  return response;
}
