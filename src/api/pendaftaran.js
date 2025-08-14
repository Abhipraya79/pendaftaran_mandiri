// src/api/pendaftaran.js (FINAL - DIPERBAIKI)
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const USERNAME = import.meta.env.VITE_API_USERNAME;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

// =================================================
// BAGIAN INI TIDAK DIUBAH
// =================================================
export const getToken = async () => {
  const url = `${BASE_URL}/api/auth`;
  const response = await axios.get(url, {
    headers: { "x-username": USERNAME, "x-password": PASSWORD },
  });
  return {
    token: response.data.response.token,
    username: USERNAME,
  };
};

export const cariPasienByNama = async (nama, token = null, username = null) => {
  let tokenToUse = token,
    usernameToUse = username;
  if (!tokenToUse || !usernameToUse) {
    const t = await getToken();
    tokenToUse = t.token;
    usernameToUse = t.username;
  }
  const url = `${BASE_URL}/pxref/name?nama=${encodeURIComponent(nama)}&pg=0&sz=10`;
  try {
    const response = await axios.get(url, {
      headers: {
        "x-token": tokenToUse,
        "x-username": usernameToUse,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      const t = await getToken();
      const retry = await axios.get(url, {
        headers: {
          "x-token": t.token,
          "x-username": t.username,
          Accept: "application/json",
        },
      });
      return retry.data;
    }
    throw err.response?.data?.message || "Gagal fetch data pasien";
  }
};

// ... (fungsi-fungsi lain yang tidak diubah tetap di sini) ...

export const cariPasienByRekmed = async (rekmed, token = null, username = null) => {
  let tokenToUse = token,
    usernameToUse = username;
  if (!tokenToUse || !usernameToUse) {
    const t = await getToken();
    tokenToUse = t.token;
    usernameToUse = t.username;
  }
  const url = `${BASE_URL}/pxref/rekmed?rekmed=${encodeURIComponent(rekmed)}`;
  try {
    const response = await axios.get(url, {
      headers: {
        "x-token": tokenToUse,
        "x-username": usernameToUse,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      const t = await getToken();
      const retry = await axios.get(url, {
        headers: {
          "x-token": t.token,
          "x-username": t.username,
          Accept: "application/json",
        },
      });
      return retry.data;
    }
    throw err.response?.data?.message || "Gagal fetch data pasien";
  }
};

export const getJadwalDokterHarian = async (token = null, username = null) => {
  let tokenToUse = token,
    usernameToUse = username;
  if (!tokenToUse || !usernameToUse) {
    const t = await getToken();
    tokenToUse = t.token;
    usernameToUse = t.username;
  }
  const url = `${BASE_URL}/jpref/daily`;
  try {
    const response = await axios.get(url, {
      headers: {
        "x-token": tokenToUse,
        "x-username": usernameToUse,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      const t = await getToken();
      const retry = await axios.get(url, {
        headers: {
          "x-token": t.token,
          "x-username": t.username,
          Accept: "application/json",
        },
      });
      return retry.data;
    }
    throw err.response?.data?.message || "Gagal fetch jadwal dokter";
  }
};

export const savePendaftaranApm = async (payload, token = null, username = null) => {
  let tokenToUse = token,
    usernameToUse = username;
  if (!tokenToUse || !usernameToUse) {
    const t = await getToken();
    tokenToUse = t.token;
    usernameToUse = t.username;
  }

  const url = `${BASE_URL}/api/apmpx`;

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "x-token": tokenToUse,
        "x-username": usernameToUse,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      const t = await getToken();
      const retry = await axios.post(url, payload, {
        headers: {
          "x-token": t.token,
          "x-username": t.username,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      return retry.data;
    }
    throw err.response?.data?.message || "Gagal menyimpan pendaftaran";
  }
};

export const getBisnisTitle = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/bisnistitle`);
    return response.data.response; // ✅ FIX: Menggunakan .response
  } catch (error) {
    console.error("Error fetching bisnis title:", error);
    throw error;
  }
};

export const getWaktuServer = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/webservicetime`);
    return response.data.response.webTime;
  } catch (error) {
    console.error("Error fetching server time:", error);
    throw error;
  }
};

export const getGates = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/gates`);
    return response.data.response;
  } catch (error) {
    console.error("Error fetching gates:", error);
    throw error;
  }
};

export const getCurrentNumber = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/queregno`);
    return response.data.response;
  } catch (error) {
    console.error("Error fetching nomor terkhir:", error);
    throw error;
  }
};

export const postNomorAntrianPx = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/queregpxno`, payload);
    return response.data;
  } catch (error) {
    console.error("Error posting queue number:", error);
    throw error;
  }
};