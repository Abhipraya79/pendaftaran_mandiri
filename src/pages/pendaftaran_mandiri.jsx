import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { cariPasienByNama, cariPasienByRekmed } from "../api/pendaftaran";
import PilihanCard from "../components/pilihanCard";
import BackButton from "../components/BackButton";
import PasienTable from "../components/PasienTable";
import RekmedInputGroup from "../components/RekmedInputGroup";
import withReactContent from "sweetalert2-react-content";
import { FaUsers } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const MySwal = withReactContent(Swal);
const COLOR_NAME_METHOD = "#2ab36b";
const COLOR_REKMED_METHOD = "#2276c3";
const LABEL_JENIS_KELAMIN = { L: "Laki-laki", P: "Perempuan" };

const STEP = {
  CHOOSE_METHOD: 0,
  INPUT_NAME: 1,
  INPUT_REKMED: 2,
};

function hitungUmur(tglLahir) {
  const now = new Date();
  const lahir = new Date(tglLahir);
  let umur = now.getFullYear() - lahir.getFullYear();
  const m = now.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < lahir.getDate())) {
    umur--;
  }
  return umur;
}

export default function PendaftaranMandiri() {
  const nav = useNavigate();
  const [step, setStep] = useState(STEP.CHOOSE_METHOD);
  const [namaCari, setNamaCari] = useState("");
  const [rekmedParts, setRekmedParts] = useState(["", "", ""]);
  const [pasienList, setPasienList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Inisialisasi AOS sekali ketika komponen mount
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const resetAll = () => {
    setNamaCari("");
    setRekmedParts(["", "", ""]);
    setPasienList([]);
    setMsg("");
  };

  const goBack = () => {
    resetAll();
    setStep(STEP.CHOOSE_METHOD);
  };

  async function handlePilihPasien(pasien) {
    const umur = hitungUmur(pasien.pxBirthdate);

    const result = await MySwal.fire({
      title:
        '<span style="font-size: 1.25rem; font-weight: bold;">Konfirmasi Pasien Yang Akan Didaftarkan</span>',
      html: `
      <div style="text-align: left; font-size: 1rem; line-height: 1.8;">
        <div style="display: flex; margin-bottom: 8px;">
          <div style="width: 140px; flex-shrink: 0;"><strong>Nama Pasien</strong></div>
          <div style="margin-right: 10px;">:</div>
          <div style="flex: 1; word-break: break-word;">${pasien.pxName}</div>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <div style="width: 140px; flex-shrink: 0;"><strong>No RM</strong></div>
          <div style="margin-right: 10px;">:</div>
          <div style="flex: 1; word-break: break-word;">${pasien.id}</div>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <div style="width: 140px; flex-shrink: 0;"><strong>Alamat</strong></div>
          <div style="margin-right: 10px;">:</div>
          <div style="flex: 1; word-break: break-word;">${pasien.pxAddress}</div>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <div style="width: 140px; flex-shrink: 0;"><strong>Tanggal Lahir</strong></div>
          <div style="margin-right: 10px;">:</div>
          <div style="flex: 1; word-break: break-word;">${pasien.pxBirthdate}</div>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <div style="width: 140px; flex-shrink: 0;"><strong>Umur</strong></div>
          <div style="margin-right: 10px;">:</div>
          <div style="flex: 1; word-break: break-word;">${umur} tahun</div>
        </div>
        <div style="display: flex; margin-bottom: 8px;">
          <div style="width: 140px; flex-shrink: 0;"><strong>Jenis Kelamin</strong></div>
          <div style="margin-right: 10px;">:</div>
          <div style="flex: 1; word-break: break-word;">${
            LABEL_JENIS_KELAMIN[pasien.pxSex] || pasien.pxSex || "-"
          }</div>
        </div>
      </div>
    `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Lanjutkan",
      cancelButtonText: "Kembali",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      nav("/pilih-dokter", { state: { pasien } });
    }
  }

  async function submitNama(e) {
    e?.preventDefault();
    if (!namaCari.trim()) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await cariPasienByNama(namaCari.trim());
      if (res.response && Array.isArray(res.response) && res.response.length > 0) {
        setPasienList(res.response);
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
    if (rekmedParts.some((rm) => rm.length !== 2)) {
      setMsg("Semua kolom harus diisi 2 digit angka.");
      return;
    }
    setLoading(true);
    const rekmed = `${rekmedParts[0]}.${rekmedParts[1]}.${rekmedParts[2]}`;
    try {
      const res = await cariPasienByRekmed(rekmed);
      if (res.response && typeof res.response === "object" && res.response.id) {
        await handlePilihPasien(res.response);
      } else {
        setMsg("Nomor rekam medis tidak ditemukan.");
      }
    } catch {
      setMsg("Terjadi kesalahan koneksi.");
    }
    setLoading(false);
  }

  function pilihPasien(pasien) {
    handlePilihPasien(pasien);
  }

  switch (step) {
    case STEP.CHOOSE_METHOD:
      return (
        <div
          className="pendaftaran-bg"
          style={{ height: "100vh"}}
        
      >
          <button
            aria-label="Buka Aplikasi Antrian"
            onClick={() => nav("/antrian")}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "#2276c3",
              color: "white",
              padding: "10px 18px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
              transition: "background 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#0c1ec0ff")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#2276c3")
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.96)")
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            data-aos="zoom-in"
          >
            <FaUsers size={16} />
            Aplikasi Antrian
          </button>
          <img
            className="pendaftaran-logo"
            src="/assets/logo-klinik.png"
            alt="Logo Klinik"
            style={{ marginTop: 32, marginBottom: 16, width: 150 }}
            data-aos="fade-down"
          />
          <h1
            className="pendaftaran-title"
            style={{ fontSize: 42, fontWeight: 800 }}
            data-aos="fade-up"
          >
            Pendaftaran Mandiri Pasien Klinik Muhammadiyah Lamongan
          </h1>
          <div
            className="pendaftaran-instruksi"
            style={{ fontSize: 24, marginBottom: 30 }}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Silakan lanjutkan pendaftaran dengan <b>Nama</b> atau{" "}
            <b>Nomor Rekam Medis</b>
          </div>
          <div
            style={{ display: "flex", justifyContent: "center" }}
            data-aos="zoom-in"
            data-aos-delay="300"
          >
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
        <div className="pendaftaran-bg" data-aos="fade-right">
          <BackButton onClick={goBack} />
          <h2 className="pendaftaran-subtitle" data-aos="fade-down">
            Masukkan Nama Anda
          </h2>
          <form
            onSubmit={submitNama}
            style={{
              width: "100%",
              maxWidth: 420,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
            data-aos="zoom-in"
          >
            <input
              type="text"
              value={namaCari}
              onChange={(e) => setNamaCari(e.target.value)}
              placeholder="Masukkan nama anda disini (Contoh : Ahmad)"
              className="pendaftaran-input"
              required
              minLength={1}
            />
            <button
              type="submit"
              disabled={loading || namaCari.length < 1}
              style={{
                padding: "12px 0",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
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
        <div className="pendaftaran-bg" data-aos="fade-left">
          <BackButton onClick={goBack} />
          <h2 className="pendaftaran-subtitle" data-aos="fade-down">
            Masukkan Nomor Rekam Medis Anda
          </h2>
          <form
            onSubmit={submitRekmed}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
            data-aos="zoom-in"
          >
            <RekmedInputGroup values={rekmedParts} onChange={setRekmedParts} />
            <button
              type="submit"
              disabled={loading || rekmedParts.some((rm) => rm.length !== 2)}
              style={{
                padding: "12px 0",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                width: 180,
              }}
            >
              {loading ? "Mencari..." : "Cari"}
            </button>
          </form>
          {msg && <div style={{ color: "red", marginTop: 12 }}>{msg}</div>}
        </div>
      );
    default:
      return null;
  }
}
