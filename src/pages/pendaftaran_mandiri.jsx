import React, { useState } from "react";
import PilihanCard from "../components/pilihanCard";
import { cariPasienByNama } from "../api/pendaftaran";
import "../App.css";

const PendaftaranMandiri = () => {
  const [metode, setMetode] = useState(null);
  const [namaCari, setNamaCari] = useState("");
  const [dataPasien, setDataPasien] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedPasien, setSelectedPasien] = useState(null);

  const logoSrc = "/assets/logo-klinik.png";

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

  const handleBack = () => {
    setMetode(null);
    setDataPasien([]);
    setNamaCari("");
    setSelectedPasien(null);
    setErrorMsg("");
  };

  const handlePilihPasien = (pasien) => {
    setSelectedPasien(pasien);
  };

  if (!metode) {
    return (
      <div className="pendaftaran-bg">
        <img src={logoSrc} alt="Logo" className="pendaftaran-logo" />
        <h1 className="pendaftaran-title">
          Pendaftaran Mandiri Pasien Klinik Muhammadiyah Lamongan
        </h1>
        <div className="pendaftaran-instruksi">
          Silahkan Lanjutkan Pendaftaran dengan menggunakan <b>Nama</b> atau <b>Nomor Rekam Medis</b>
        </div>
        <div className="pendaftaran-pilihan-wrapper">
          <PilihanCard title="Nama" onClick={() => setMetode("nama")} />
          <PilihanCard title="Nomor Rekam Medis" onClick={() => setMetode("rekam_medis")} />
        </div>
      </div>
    );
  }

  if (selectedPasien) {
    return (
      <div className="pendaftaran-bg">
        <button onClick={handleBack} className="pendaftaran-back-btn">← Kembali</button>
        <div className="box-validasi">
          <h2>Validasi Pasien Terpilih</h2>
          <p><b>Nomor Rekam Medis:</b> {selectedPasien.id || "-"}</p>
          <p><b>Nama Pasien:</b> {selectedPasien.pxName || "-"}</p>
          <p><b>Alamat:</b> {selectedPasien.pxAddress || "-"}</p>
          <button
            style={{ marginTop: 20 }}
            onClick={() => alert("Validasi berhasil! (Contoh)")}>
            Konfirmasi & Lanjutkan
          </button>
        </div>
      </div>
    );
  }

  if (metode === "nama") {
    return (
      <div className="pendaftaran-bg">
        <button onClick={handleBack} className="pendaftaran-back-btn">← Kembali</button>
        <h2 className="pendaftaran-subtitle">Cari Pasien Berdasarkan Nama</h2>
        <form onSubmit={handleCariPasien} style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            value={namaCari}
            onChange={(e) => setNamaCari(e.target.value)}
            placeholder="Masukkan minimal 1 huruf nama pasien"
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

  return (
    <div className="pendaftaran-bg">
      <button onClick={handleBack} className="pendaftaran-back-btn">← Kembali</button>
      <h2 className="pendaftaran-subtitle">Cari Pasien Berdasarkan Nomor Rekam Medis</h2>
      <div>Belum diimplementasikan.</div>
    </div>
  );
};

export default PendaftaranMandiri;
