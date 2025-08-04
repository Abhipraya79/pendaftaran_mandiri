import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const USERNAME = import.meta.env.VITE_API_USERNAME;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

export const getToken = async () => {
  const url = `${BASE_URL}/api/auth`;
  const response = await axios.get(url, {
    headers: {
      "x-username": USERNAME,
      "x-password": PASSWORD,
    },
  });
  return {
    token: response.data.response.token,
    username: USERNAME,
  };
};

export const cariPasienByNama = async (nama, token = null, username = null) => {
  let tokenToUse = token, usernameToUse = username;
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

export const cariPasienByRekmed = async (rekmed, token = null, username = null) => {
  let tokenToUse = token, usernameToUse = username;
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
  let tokenToUse = token, usernameToUse = username;
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
  let tokenToUse = token, usernameToUse = username;
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