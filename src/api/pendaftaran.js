import axios from "axios";

// Ambil dari .env
const BASE_URL = import.meta.env.VITE_API_URL;
const DEFAULT_TOKEN = import.meta.env.VITE_API_TOKEN;
const DEFAULT_USERNAME = import.meta.env.VITE_API_USERNAME;

// Cari pasien by nama
export const cariPasienByNama = async (nama) => {
  const url = `${BASE_URL}/pxref/name?nama=${encodeURIComponent(nama)}&pg=0&sz=10`;
  try {
    const response = await axios.get(url, {
      headers: {
        "x-token": DEFAULT_TOKEN,
        "x-username": DEFAULT_USERNAME,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Gagal fetch data pasien";
  }
};

// Cari pasien by nomor rekam medis (next step, opsional)
export const cariPasienByRekmed = async (rekmed) => {
  const url = `${BASE_URL}/pxref/rekmed?rekmed=${encodeURIComponent(rekmed)}`;
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (err) {
    throw err.response?.data?.message || "Gagal fetch data pasien";
  }
};
