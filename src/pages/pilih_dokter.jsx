import React, { useEffect, useState } from "react";
import { getJadwalDokterHarian } from "../api/pendaftaran";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

// Helper untuk format jam dari string "1900-01-01 15:00:00" → "15:00 WIB"
function formatJam(jam) {
  if (!jam) return "";
  const parts = jam.split(" ")[1]?.split(":");
  return parts ? `${parts[0]}:${parts[1]} WIB` : jam;
}

// Helper jam sekarang (format: Selasa, 15 Juli 2025 13:44:48 WIB)
function getWaktuSekarang() {
  const now = new Date();
  const hari = [
    "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
  ][now.getDay()];
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ][now.getMonth()];
  const tgl = now.getDate();
  const th = now.getFullYear();
  const jam = now.toLocaleTimeString('id-ID', { hour12: false });
  return `${hari}, ${tgl} ${bulan} ${th} ${jam} WIB`;
}

// Cek apakah jam praktek sudah habis (jam sekarang > endTime)
function isHabis(beginTime, endTime) {
  if (!endTime) return false;
  const now = new Date();
  // Hanya ambil jam:menit dari endTime (abaikan tanggal 1900-01-01)
  const [h, m] = endTime.split(" ")[1].split(":");
  const end = new Date(now);
  end.setHours(Number(h), Number(m), 0, 0);
  return now > end;
}

// Jika ada foto, render <img src="data:image/jpeg;base64,..." />
function DokterPhoto({ photo, dokterName }) {
  if (!photo) return (
    <div
      style={{
        width: 90,
        height: 90,
        background: "#f3f4f6",
        borderRadius: 12,
        margin: "0 auto 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 38,
        color: "#8b8b8b",
      }}
    >
      <span role="img" aria-label="user">👤</span>
    </div>
  );
  const isFullBase64 = photo.startsWith("data:image");
  const src = isFullBase64 ? photo : `data:image/jpeg;base64,${photo}`;
  return (
    <img
      src={src}
      alt={dokterName}
      style={{
        width: 90, height: 90,
        objectFit: "cover",
        borderRadius: 12,
        margin: "0 auto 8px"
      }}
    />
  );
}

const PilihDokter = () => {
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [spesialis, setSpesialis] = useState("Semua");
  const [search, setSearch] = useState("");
  const [waktuSekarang, setWaktuSekarang] = useState(getWaktuSekarang());
  const navigate = useNavigate();
  const location = useLocation();
  const pasien = location.state?.pasien;

  // Update jam real time
  useEffect(() => {
    const timer = setInterval(() => setWaktuSekarang(getWaktuSekarang()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter: jika pasien ingin filter dokter
  const spesialisList = [
    "Semua",
    ...Array.from(new Set(jadwal.map(j => j.spesialisName).filter(Boolean))),
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getJadwalDokterHarian();
        if (result.response && Array.isArray(result.response)) {
          setJadwal(result.response);
        } else {
          setErrMsg("Data jadwal dokter kosong.");
        }
      } catch (err) {
        setErrMsg("Gagal mengambil data jadwal dokter.");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handlePilihDokter = (dokter) => {
    navigate("/konfirmasi-pendaftaran", { state: { pasien, dokter } });
  };

  // --- FILTER data berdasarkan pencarian & spesialis
  const dataTampil = jadwal.filter(j => {
    const matchNama = j.dokterName.toLowerCase().includes(search.toLowerCase());
    const matchSpe = spesialis === "Semua" || (j.spesialisName === spesialis);
    return matchNama && matchSpe;
  });

  if (!pasien) {
    return (
      <div className="pendaftaran-bg">
        <div className="box-validasi">
          <h2>Data pasien tidak ditemukan</h2>
          <div>Silahkan ulangi proses pendaftaran.</div>
          <button className="pendaftaran-back-btn" onClick={() => navigate("/")}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pendaftaran-bg" style={{ minHeight: "100vh", alignItems: "start", paddingTop: 32 }}>
      <div className="box-validasi" style={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        background: "transparent",
        boxShadow: "none",
        padding: 0
      }}>
        <h1 className="pendaftaran-title" style={{ marginBottom: 2, fontSize: 28, color: "#2a3450" }}>
          Jadwal Praktek Dokter RS Muhammadiyah Kalikapas
        </h1>
        <div style={{
          background: "linear-gradient(90deg,#6f48f7 40%,#8e6aff 100%)",
          color: "#fff",
          fontWeight: 700,
          borderRadius: 12,
          padding: "14px 0",
          textAlign: "center",
          fontSize: 19,
          margin: "18px 0 12px 0"
        }}>
          Pilih Dokter / Poli Tujuan
        </div>
        <div style={{
          textAlign: "center",
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 18,
          color: "#2a3450",
        }}>
          Waktu Sekarang: <span style={{ color: "#6545ee" }}>{waktuSekarang}</span>
        </div>
        <div style={{
          display: "flex", gap: 16, alignItems: "center", marginBottom: 20, flexWrap: "wrap"
        }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <input
              type="text"
              placeholder="Telusuri Nama Dokter"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", borderRadius: 10, fontSize: 16,
                padding: "10px 18px", border: "1.3px solid #ccc"
              }}
            />
          </div>
          <div style={{ minWidth: 160 }}>
            <select
              value={spesialis}
              onChange={e => setSpesialis(e.target.value)}
              style={{
                borderRadius: 10, fontSize: 16, padding: "10px 12px",
                border: "1.3px solid #ccc", minWidth: 140
              }}
            >
              {spesialisList.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {loading && <div>Mengambil data jadwal dokter...</div>}
        {errMsg && <div style={{ color: "red" }}>{errMsg}</div>}
        {!loading && !errMsg && (
          <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 38,
    marginTop: 18,
    padding: "0 20px 44px 20px",
    overflowX: "auto",
  }}
>
  {dataTampil.length === 0 ? (
    <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#444" }}>Tidak ada dokter ditemukan.</div>
  ) : dataTampil.map((j, idx) => {
    const habis = isHabis(j.beginTime, j.endTime);
    return (
      <div
        key={idx}
        style={{
          background: "#fff",
          borderRadius: 28,
          boxShadow: "0 6px 24px #0002",
          padding: "38px 18px 30px 18px",
          minHeight: 390,
          minWidth: 0,
          maxWidth: 420,
          wordBreak: "break-word",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <img
          src={j.photo && j.photo.startsWith("data:image") ? j.photo : (j.photo ? `data:image/jpeg;base64,${j.photo}` : "/no-foto.png")}
          alt={j.dokterName}
          style={{
            width: "auto",
            height: "auto",
            maxWidth: 140,
            maxHeight: 160,
            objectFit: "contain",
            borderRadius: 16,
            margin: "0 auto 14px"
          }}
        />
        <div style={{ fontWeight: 800, fontSize: 22, marginTop: 4, color: "#413096", textAlign: "center", lineHeight: 1.2 }}>
          {j.dokterName}
        </div>
        <div style={{ fontSize: 17, color: "#464646", marginTop: 7, textAlign: "center" }}>
          <span style={{ fontWeight: 600 }}>Kode DPJP: {j.dpjp || "-"}</span>
        </div>
        <div style={{ fontSize: 18, color: "#2a2a2a", margin: "12px 0 6px 0", fontWeight: 600, textAlign: "center" }}>
          {j.spesialisName || "-"}
        </div>
        <div style={{
          background: "#f7f7fc",
          borderRadius: 10,
          padding: "13px 0",
          fontSize: 19,
          color: "#444",
          fontWeight: 700,
          width: "96%",
          margin: "12px 0 24px 0",
          textAlign: "center"
        }}>
          {formatJam(j.beginTime)} - {formatJam(j.endTime)}
        </div>
        <div style={{ width: "100%", marginTop: "auto", textAlign: "center" }}>
          {habis ? (
            <div style={{
              padding: "11px 0",
              background: "#fde7e7",
              color: "#d32f2f",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 20
            }}>
              Jam Praktek Telah Habis
            </div>
          ) : (
            <button
              style={{
                width: "100%",
                padding: "17px 0",
                background: "#22c55e",
                borderRadius: 10,
                color: "#fff",
                fontWeight: 800,
                fontSize: 22,
                border: "none",
                marginTop: 0,
                cursor: "pointer",
                letterSpacing: "0.5px",
              }}
              onClick={() => handlePilihDokter(j)}
            >
              Buat Janji
            </button>
          )}
        </div>
      </div>
    );
  })}
</div>


        )}
      </div>
    </div>
  );
};

export default PilihDokter;
