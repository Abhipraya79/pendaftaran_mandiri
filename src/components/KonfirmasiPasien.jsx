// src/components/KonfirmasiPasien.jsx
import React from "react";

const LABEL_JENIS_KELAMIN = { L: "Laki-laki", P: "Perempuan" };

// Fungsi menghitung umur dari tanggal lahir
function hitungUmur(tanggalLahir) {
  if (!tanggalLahir) return "-";
  const lahir = new Date(tanggalLahir);
  const hariIni = new Date();
  let umur = hariIni.getFullYear() - lahir.getFullYear();
  const m = hariIni.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && hariIni.getDate() < lahir.getDate())) {
    umur--;
  }
  return `${umur} tahun`;
}

export default function KonfirmasiPasien({ pasien, onBack, onConfirm }) {
  if (!pasien) return null;

  return (
    <div className="pendaftaran-bg">
      <button
        onClick={onBack}
        className="pendaftaran-back-btn"
        style={{
          position: "fixed",
          top: "40px",
          left: "70px",
          zIndex: 1000,
          background: "#dc2626",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 20px",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 1px 6px #0002",
        }}
      >
        Kembali
      </button>

      <div
        className="box-validasi"
        style={{
          maxWidth: 500,
          margin: "0 auto",
          background: "#fff",
          padding: "24px 30px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          marginTop: "50px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Apakah ini anda?
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 4px", fontWeight: 600 }}>
                Nomor Rekam Medis
              </td>
              <td style={{ padding: "8px 4px" }}>{pasien.id}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 4px", fontWeight: 600 }}>
                Nama Pasien
              </td>
              <td style={{ padding: "8px 4px" }}>{pasien.pxName}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 4px", fontWeight: 600 }}>Alamat</td>
              <td style={{ padding: "8px 4px" }}>{pasien.pxAddress}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 4px", fontWeight: 600 }}>
                Tanggal Lahir
              </td>
              <td style={{ padding: "8px 4px" }}>{pasien.pxBirthdate}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 4px", fontWeight: 600 }}>Umur</td>
              <td style={{ padding: "8px 4px" }}>
                {hitungUmur(pasien.pxBirthdate)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 4px", fontWeight: 600 }}>
                Jenis Kelamin
              </td>
              <td style={{ padding: "8px 4px" }}>
                {LABEL_JENIS_KELAMIN[pasien.pxSex] || pasien.pxSex || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 30, textAlign: "center" }}>
          <button
            style={{
              padding: "10px 36px",
              background: "#10b981",
              borderRadius: 10,
              fontWeight: 600,
              border: "none",
              color: "#fff",
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            onClick={() => onConfirm(pasien)}
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}
