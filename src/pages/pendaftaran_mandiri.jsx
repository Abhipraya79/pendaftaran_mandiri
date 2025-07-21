import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cariPasienByNama, cariPasienByRekmed } from "../api/pendaftaran";
import "../App.css";

// KOMONEN PILIHANCARD DENGAN STYLE BARU (HIJAU/BIRU)
const PilihanCard = ({ title, onClick, color }) => (
  <button
    onClick={onClick}
    style={{
      background: color,
      color: "#fff",
      border: "none",
      borderRadius: 12,
      margin: 16,
      width: 220,
      fontSize: 20,
      fontWeight: 700,
      cursor: "pointer",
      textAlign: "center",
      boxShadow: "0 2px 10px #0001",
      padding: 18,
      transition: "background 0.18s",
    }}
    onMouseOver={e => (e.currentTarget.style.background = shadeColor(color, -15))}
    onMouseOut={e => (e.currentTarget.style.background = color)}
  >
    {title}
  </button>
);

// Helper untuk darken warna sedikit saat hover
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1,3),16);
  let G = parseInt(color.substring(3,5),16);
  let B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;
  G = (G<255)?G:255;
  B = (B<255)?B:255;

  const RR = ((R.toString(16).length===1)?"0":"") + R.toString(16);
  const GG = ((G.toString(16).length===1)?"0":"") + G.toString(16);
  const BB = ((B.toString(16).length===1)?"0":"") + B.toString(16);

  return "#"+RR+GG+BB;
}

const LABEL_JENIS_KELAMIN = {
  "L": "Laki-laki",
  "P": "Perempuan",
};

const PendaftaranMandiri = () => {
  const [metode, setMetode] = useState(null);
  const [namaCari, setNamaCari] = useState("");
  const [rekmedArr, setRekmedArr] = useState(["", "", ""]);
  const [dataPasien, setDataPasien] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPasien, setSelectedPasien] = useState(null);

  const logoSrc = "/assets/logo-klinik.png";
  const navigate = useNavigate();

  // Handle input rekam medis
  const handleRekmedInput = (idx, val) => {
    if (!/^\d{0,2}$/.test(val)) return;
    const next = [...rekmedArr];
    next[idx] = val.slice(0, 2);
    setRekmedArr(next);
    if (val.length === 2 && idx < 2) {
      const nextInput = document.getElementById(`rekmed-field-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Cari pasien by nama
  const handleCariPasien = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSelectedPasien(null);
    try {
      const result = await cariPasienByNama(namaCari);
      if (
        result.response &&
        Array.isArray(result.response) &&
        result.response.length > 0
      ) {
        setDataPasien(result.response);
      } else {
        setDataPasien([]);
        setErrorMsg("Data tidak ditemukan.");
      }
    } catch (err) {
      setDataPasien([]);
      setErrorMsg("Terjadi kesalahan saat fetch data pasien.");
    }
    setLoading(false);
  };

  // Cari pasien by nomor rekam medis
  const handleCariRekmed = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSelectedPasien(null);
    if (rekmedArr.some(rm => rm.length !== 2)) {
      setErrorMsg("Semua kolom harus diisi 2 digit angka.");
      setLoading(false);
      return;
    }
    const rekmedStr = `${rekmedArr[0]}.${rekmedArr[1]}.${rekmedArr[2]}`;
    try {
      const result = await cariPasienByRekmed(rekmedStr);
      if (result.response && typeof result.response === "object" && result.response.id) {
        setSelectedPasien(result.response);
      } else {
        setErrorMsg("Nomor rekam medis tidak ditemukan.");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan saat fetch data pasien.");
    }
    setLoading(false);
  };

  // Reset state
  const handleBack = () => {
    setMetode(null);
    setDataPasien([]);
    setNamaCari("");
    setRekmedArr(["", "", ""]);
    setSelectedPasien(null);
    setErrorMsg("");
  };

  // Pilih pasien dari tabel hasil pencarian
  const handlePilihPasien = (pasien) => {
    setSelectedPasien(pasien);
  };

  // === RENDER ===

  // Konfirmasi data pasien (langsung redirect ke pilih dokter jika klik konfirmasi)
  if (selectedPasien) {
    return (
      <div className="pendaftaran-bg">
        <button onClick={handleBack} className="pendaftaran-back-btn">← Kembali</button>
        <div className="box-validasi" style={{ maxWidth: 500 }}>
          <h2>Konfirmasi Data Pasien</h2>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr><td><b>Nomor Rekam Medis</b></td><td>{selectedPasien.id}</td></tr>
              <tr><td><b>Nama Pasien</b></td><td>{selectedPasien.pxName}</td></tr>
              <tr><td><b>Alamat</b></td><td>{selectedPasien.pxAddress}</td></tr>
              <tr><td><b>Tanggal Lahir</b></td><td>{selectedPasien.pxBirthdate}</td></tr>
              <tr><td><b>Jenis Kelamin</b></td><td>{LABEL_JENIS_KELAMIN[selectedPasien.pxSex] || selectedPasien.pxSex || "-"}</td></tr>
            </tbody>
          </table>
          <div style={{ marginTop: 22, textAlign: "center" }}>
            <button
              style={{
                padding: "10px 36px",
                background: "#4ade80",
                borderRadius: 9,
                fontWeight: 600,
                border: "none",
                color: "#134e4a",
                fontSize: "1.13rem",
                marginRight: 16,
              }}
              onClick={() => navigate("/pilih-dokter", { state: { pasien: selectedPasien } })}
            >
              Konfirmasi
            </button>
            <button
              style={{
                padding: "10px 26px",
                background: "#f87171",
                borderRadius: 9,
                fontWeight: 600,
                border: "none",
                color: "#831b1b",
                fontSize: "1.09rem",
              }}
              onClick={handleBack}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!metode) {
    return (
      <div className="pendaftaran-bg" style={{ minHeight: "100vh" }}>
        <img src={logoSrc} alt="Logo" className="pendaftaran-logo" style={{ marginTop: 32, marginBottom: 16, width: 80 }} />
        <h1 className="pendaftaran-title" style={{ fontSize: 36, fontWeight: 800 }}>
          Pendaftaran Mandiri Pasien Klinik Muhammadiyah Lamongan
        </h1>
        <div className="pendaftaran-instruksi" style={{ fontSize: 18, marginBottom: 30 }}>
          Silahkan Lanjutkan Pendaftaran dengan menggunakan <b>Nama</b> atau <b>Nomor Rekam Medis</b>
        </div>
        <div className="pendaftaran-pilihan-wrapper" style={{ display: "flex", justifyContent: "center" }}>
          <PilihanCard title="Nama" onClick={() => setMetode("nama")} color="#2ab36b" />
          <PilihanCard title="Nomor Rekam Medis" onClick={() => setMetode("rekam_medis")} color="#2276c3" />
        </div>
      </div>
    );
  }

  // Cari berdasarkan nama
  if (metode === "nama") {
    return (
      <div className="pendaftaran-bg">
        <button onClick={handleBack} className="pendaftaran-back-btn">← Kembali</button>
        <h2 className="pendaftaran-subtitle">Masukkan Nama Anda</h2>
        <form onSubmit={handleCariPasien} style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            value={namaCari}
            onChange={(e) => setNamaCari(e.target.value)}
            placeholder="Masukkan nama anda disini (Contoh: Budi)"
            className="pendaftaran-input"
            required
            minLength={1}
          />
          <button
            type="submit"
            disabled={loading || namaCari.length < 1}
            style={{
              padding: "12px 0", background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer"
            }}
          >
            {loading ? "Mencari..." : "Cari"}
          </button>
        </form>
        {errorMsg && (
          <div style={{ color: "red", marginTop: 12 }}>{errorMsg}</div>
        )}
        {dataPasien.length > 0 && (
          <div style={{
            width: "100%",
            maxWidth: 700,
            background: "#fff",
            borderRadius: 14,
            marginTop: 28,
            boxShadow: "0 2px 12px #0002",
            padding: 12,
            overflowX: "auto"
          }}>
            <table className="tabel-pasien">
              <thead>
                <tr>
                  <th>Nomor Rekam Medis</th>
                  <th>Nama Pasien</th>
                  <th>Alamat</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {dataPasien.map((p, i) => (
                  <tr key={i}>
                    <td>{p.id}</td>
                    <td>{p.pxName}</td>
                    <td>{p.pxAddress}</td>
                    <td>
                      <button
                        style={{
                          padding: "4px 16px", borderRadius: 7, border: "none",
                          background: "#4ade80", color: "#1f2937", fontWeight: 600, cursor: "pointer"
                        }}
                        onClick={() => handlePilihPasien(p)}
                      >Pilih</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (metode === "rekam_medis") {
    return (
      <div className="pendaftaran-bg">
        <button onClick={handleBack} className="pendaftaran-back-btn">← Kembali</button>
        <h2 className="pendaftaran-subtitle">Cari Pasien Berdasarkan Nomor Rekam Medis</h2>
        <form onSubmit={handleCariRekmed} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2].map(i => (
              <input
                key={i}
                id={`rekmed-field-${i}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={rekmedArr[i]}
                onChange={e => {
                  // Hanya angka
                  const onlyNum = e.target.value.replace(/[^0-9]/g, '');
                  handleRekmedInput(i, onlyNum);
                }}
                className="pendaftaran-input"
                style={{ width: 60, textAlign: "center" }}
                placeholder="00"
                maxLength={2}
                required
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || rekmedArr.some(rm => rm.length !== 2)}
            style={{
              padding: "12px 0", background: "#3b82f6", color: "#fff",
              border: "none", borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer", width: 180
            }}
          >
            {loading ? "Mencari..." : "Cari"}
          </button>
        </form>
        {errorMsg && (
          <div style={{ color: "red", marginTop: 12 }}>{errorMsg}</div>
        )}
      </div>
    );
  }

  return null;
};

export default PendaftaranMandiri;
