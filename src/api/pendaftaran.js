import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;
const USERNAME = import.meta.env.VITE_API_USERNAME;
const PASSWORD = import.meta.env.VITE_API_PASSWORD;

export const getToken = async () => {
  const url = `${BASE_URL}/api/auth`;
  const response = await axios.get(url, {
    headers: { 
      "x-username": USERNAME, 
      "x-password": PASSWORD 
    },
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
  const doRequest = async (tokenToUse, usernameToUse) => {
    const url = `${BASE_URL}/api/apmpx`;

    const response = await axios.post(url, payload, {
      headers: {
        "x-token": tokenToUse,
        "x-username": usernameToUse,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("DEBUG Save Response:", response.data);

    // ✅ Response bisa berupa object atau string
    let responseData = response.data?.response;

    // ✅ Jika masih string, parse jadi object
    if (typeof responseData === "string") {
      try {
        responseData = JSON.parse(responseData);
      } catch (e) {
        console.warn("Response bukan JSON valid, tetap sebagai string");
      }
    }

    console.log("📝 Parsed Response Data:", responseData);

    // ✅ Ambil apmId (ID hash untuk WA)
    let apmId = null;
    
    if (typeof responseData === "object" && responseData !== null) {
      // Response berbentuk JSON object
      apmId = responseData.apmId || responseData.id;
    } else if (typeof responseData === "string") {
      // Response berbentuk string, parse dengan regex
      const matchId = responseData.match(/No\.\s*ID\s*[\t:]+\s*([0-9]+)/i);
      apmId = matchId ? matchId[1] : null;
    }

    if (!apmId) {
      console.error("❌ Struktur response:", responseData);
      throw new Error("ID APM tidak ditemukan di response API!");
    }

    console.log("✅ APM ID (untuk WA) berhasil didapat:", apmId);

    // ✅ Siapkan data lengkap untuk return
    return {
      success: true,
      id: String(apmId),           // ID hash untuk WA
      responseData: responseData,  // Full data object/string
      metadata: response.data?.metadata,
    };
  };

  try {
    if (!token || !username) {
      const t = await getToken();
      token = t.token;
      username = t.username;
    }
    return await doRequest(token, username);

  } catch (err) {
    if (err.response?.status === 401) {
      console.warn("Token expired — mencoba refresh token...");
      const t = await getToken();
      return await doRequest(t.token, t.username);
    }

    console.error("SavePendaftaran Error:", err);
    throw err.response?.data?.message || err.message;
  }
};

export const getApmToday = async (token = null, username = null) => {
  let tokenToUse = token,
    usernameToUse = username;
  
  if (!tokenToUse || !usernameToUse) {
    const t = await getToken();
    tokenToUse = t.token;
    usernameToUse = t.username;
  }
  
  const url = `${BASE_URL}/api/apmpx`;

  try {
    const response = await axios.get(url, {
      headers: {
        "x-token": tokenToUse,
        "x-username": usernameToUse,
        Accept: "application/json",
      },
    });

    return {
      success: true,
      appointments: response.data.response || [],
      metadata: response.data.metadata,
      total: response.data.response ? response.data.response.length : 0
    };
    
  } catch (err) {
    // Retry jika 401 Unauthorized
    if (err.response && err.response.status === 401) {
      try {
        const t = await getToken();
        const retry = await axios.get(url, {
          headers: {
            "x-token": t.token,
            "x-username": t.username,
            Accept: "application/json",
          },
        });
        
        return {
          success: true,
          appointments: retry.data.response || [],
          metadata: retry.data.metadata,
          total: retry.data.response ? retry.data.response.length : 0
        };
      } catch (retryErr) {
        console.error('Error on retry:', retryErr);
        return {
          success: false,
          appointments: [],
          error: retryErr.response?.data?.message || retryErr.message
        };
      }
    }
    
    console.error('Error fetching appointments:', err);
    return {
      success: false,
      appointments: [],
      error: err.response?.data?.message || err.message
    };
  }
};

export const getBisnisTitle = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/bisnistitle`);
    return response.data.response;
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

export const sendWaMessage = async (idHash, token = null, username = null) => {
  if (!idHash) throw new Error("ID hash tidak ditemukan untuk WhatsApp Message!");

  try {
    if (!token || !username) {
      const t = await getToken();
      token = t.token;
      username = t.username;
    }

    const url = `${BASE_URL}/api/wamsg?id=${encodeURIComponent(idHash)}`;

    const response = await axios.get(url, {
      headers: {
        "x-token": token,
        "x-username": username,
        Accept: "application/json",
      },
    });

    return {
      success: true,
      response: response.data.response,
      metadata: response.data.metadata,
    };

  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message || err.message,
    };
  }
};
