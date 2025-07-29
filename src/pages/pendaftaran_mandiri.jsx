import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cariPasienByNama, cariPasienByRekmed } from "../api/pendaftaran";
import PilihanCard from "../components/PilihanCard";
import BackButton from "../components/BackButton";
import PasienTable from "../components/PasienTable";
import RekmedInputGroup from "../components/RekmedInputGroup";
import KonfirmasiPasien from "../components/KonfirmasiPasien";

const COLOR_NAME_METHOD = "#2ab36b";
const COLOR_REKMED_METHOD = "#2276c3";

const STEP = {
  CHOOSE_METHOD: "CHOOSE_METHOD",
  INPUT_NAME: "INPUT_NAME",
  INPUT_REKMED: "INPUT_REKMED",
  CONFIRM: "CONFIRM",
};

export default function PendaftaranMandiri() {
  const nav = useNavigate();
  const [step, setStep] = useState(STEP.CHOOSE_METHOD);
  const [namaCari, setNamaCari] = useState("");
  const [rekmedParts, setRekmedParts] = useState(["", "", ""]);
  const [pasienList, setPasienList] = useState([]);
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const resetAll = () => {
    setNamaCari("");
    setRekmedParts(["", "", ""]);
    setPasienList([]);
    setSelectedPasien(null);
    setMsg("");
  };
  const goBack = () => {
    resetAll();
    setStep(STEP.CHOOSE_METHOD);
  };

  async function submitNama(e) {
    e?.preventDefault();
    if (!namaCari.trim()) return;
    setLoading(true);
    setMsg("");
    setSelectedPasien(null);
    try {
      const result = await cariPasienByNama(namaCari.trim());
      if (
        result.response &&
        Array.isArray(result.response) &&
        result.response.length > 0
      ) {
        setPasienList(result.response);
      } else {
        setPasienList([]);
        setMsg("Data tidak ditemukan.");
      }
    } catch {
      setPasienList([]);
      setMsg("Terjadi kesalahan koneksi.");
    }
    setLoading(false);
  }

  async function submitRekmed(e) {
    e?.preventDefault();
    setMsg("");
    setSelectedPasien(null);
    if (rekmedParts.some(rm => rm.length !== 2)) {
      setMsg("Semua kolom harus diisi 2 digit angka.");
      return;
    }
    setLoading(true);
    const rekmed = `${rekmedParts[0]}.${rekmedParts[1]}.${rekmedParts[2]}`;
    try {
      const result = await cariPasienByRekmed(rekmed);
      if (result.response && typeof result.response === "object" && result.response.id) {
        setSelectedPasien(result.response);
        setStep(STEP.CONFIRM);
      } else {
        setMsg("Nomor rekam medis tidak ditemukan.");
      }
    } catch {
      setMsg("Terjadi kesalahan koneksi.");
    }
    setLoading(false);
  }

  function pilihPasien(p) {
    setSelectedPasien(p);
    setStep(STEP.CONFIRM);
  }

  function confirmPasien(p) {
    nav("/pilih-dokter", { state: { pasien: p } });
  }

  switch (step) {
    case STEP.CHOOSE_METHOD:
      return (
        <div className="pendaftaran-bg" style={{ minHeight: "100vh" }}>
          <img
            className="pendaftaran-logo"
            src="/assets/logo-klinik.png"
            alt="Logo Klinik"
            style={{ marginTop: 32, marginBottom: 16, width: 150 }}
          />
          <h1 className="pendaftaran-title" style={{ fontSize: 42, fontWeight: 800 }}>
            Pendaftaran Mandiri Pasien Klinik Muhammadiyah Lamongan
          </h1>
          <div className="pendaftaran-instruksi" style={{ fontSize: 24, marginBottom: 30 }}>
            Silakan lanjutkan pendaftaran dengan <b>Nama</b> atau <b>Nomor Rekam Medis</b>
          </div>
          <div className="pendaftaran-pilihan-wrapper" style={{ display: "flex", justifyContent: "center" }}>
            <PilihanCard
              title="Nama"
              onClick={() => setStep(STEP.INPUT_NAME)}
              color={COLOR_NAME_METHOD}
            />
            <PilihanCard
              title="Nomor Rekam Medis"
              onClick={() => setStep(STEP.INPUT_REKMED)}
              color={COLOR_REKMED_METHOD}
            />
          </div>
        </div>
      );
    case STEP.INPUT_NAME:
      return (
        <div className="pendaftaran-bg">
          <BackButton onClick={goBack} />
          <h2 className="pendaftaran-subtitle">Masukkan Nama Anda</h2>
          <form onSubmit={submitNama} style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              value={namaCari}
              onChange={e => setNamaCari(e.target.value)}
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
          {msg && <div style={{ color: "red", marginTop: 12 }}>{msg}</div>}
          <PasienTable data={pasienList} onSelect={pilihPasien} />
        </div>
      );
    case STEP.INPUT_REKMED:
      return (
        <div className="pendaftaran-bg">
          <BackButton onClick={goBack} />
          <h2 className="pendaftaran-subtitle">Masukkan Nomor Rekam Medis Anda</h2>
          <form
            onSubmit={submitRekmed}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            <RekmedInputGroup
              values={rekmedParts}
              onChange={next => setRekmedParts(next)}
            />
            <button
              type="submit"
              disabled={loading || rekmedParts.some(rm => rm.length !== 2)}
              style={{
                padding: "12px 0",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                width: 180
              }}
            >
              {loading ? "Mencari..." : "Cari"}
            </button>
          </form>
          {msg && <div style={{ color: "red", marginTop: 12 }}>{msg}</div>}
        </div>
      );
    case STEP.CONFIRM:
      return (
        <KonfirmasiPasien
          pasien={selectedPasien}
          onBack={goBack}
          onConfirm={confirmPasien}
        />
      );
    default:
      return null;
  }
}
