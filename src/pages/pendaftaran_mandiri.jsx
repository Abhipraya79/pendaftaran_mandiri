import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { cariPasienByNama, cariPasienByRekmed } from "../api/pendaftaran";
import PilihanCard from "../components/pilihanCard";
import BackButton from "../components/BackButton";
import PasienTable from "../components/PasienTable";
import RekmedInputGroup from "../components/RekmedInputGroup";
import { FaUsers, FaListUl } from "react-icons/fa";
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

// Helper Function
function hitungUmur(tglLahir) {
  const now = new Date();
  const lahir = new Date(tglLahir);
  let umur = now.getFullYear() - lahir.getFullYear();
  const m = now.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < lahir.getDate())) umur--;
  return umur;
}

// Helper Function (BARU DITAMBAHKAN)
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
  // Format jam agar selalu 2 digit
  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');
  const detik = String(now.getSeconds()).padStart(2, '0');
  
  return `${hari}, ${tgl} ${bulan} ${th} | ${jam}:${menit}:${detik} WIB`;
}


export default function PendaftaranMandiri() {
  const nav = useNavigate();
  const [step, setStep] = useState(STEP.CHOOSE_METHOD);
  const [namaCari, setNamaCari] = useState("");
  const [rekmedParts, setRekmedParts] = useState(["", "", ""]);
  const [pasienList, setPasienList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  
  // State untuk jam real-time (BARU DITAMBAHKAN)
  const [waktuSekarang, setWaktuSekarang] = useState(getWaktuSekarang());

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // useEffect untuk jam real-time (BARU DITAMBAHKAN)
  useEffect(() => {
    const timer = setInterval(() => {
      setWaktuSekarang(getWaktuSekarang());
    }, 1000);
    // Cleanup function untuk memberhentikan interval saat komponen dibongkar
    return () => clearInterval(timer);
  }, []); // [] berarti efek ini hanya berjalan sekali saat komponen dimuat

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
          <div><strong>Nama Pasien:</strong> ${pasien.pxName}</div>
          <div><strong>No RM:</strong> ${pasien.id}</div>
          <div><strong>Alamat:</strong> ${pasien.pxAddress}</div>
          <div><strong>Tanggal Lahir:</strong> ${pasien.pxBirthdate}</div>
          <div><strong>Umur:</strong> ${umur} tahun</div>
          <div><strong>Jenis Kelamin:</strong> ${LABEL_JENIS_KELAMIN[pasien.pxSex] || "-"}</div>
        </div>`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Lanjutkan",
      cancelButtonText: "Kembali",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
    });
    if (result.isConfirmed) nav("/pilih-dokter", { state: { pasien } });
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
        <div className="pendaftaran-bg" style={{ height: "100vh", position: "relative" }}>
          {/* Top Right Buttons Container */}
          <div style={styles.topButtonsContainer}>
            <button
              className="top-action-button"
              aria-label="Lihat Daftar Pasien"
              onClick={() => nav("/PasienList")}
              style={styles.greenButton}
              data-aos="fade-down"
              data-aos-delay="100"
            >
              <FaListUl size={18} />
              <span style={styles.buttonText}>Daftar Pasien</span>
            </button>

            <button
              className="top-action-button"
              aria-label="Buka Aplikasi Antrian"
              onClick={() => nav("/antrian")}
              style={styles.blueButton}
              data-aos="fade-down"
              data-aos-delay="200"
            >
              <FaUsers size={18} />
              <span style={styles.buttonText}>Aplikasi Antrian</span>
            </button>
          </div>

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

          {/* === JAM REAL-TIME (BARU DITAMBAHKAN) === */}
          <div 
            style={styles.waktuDisplay} 
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {waktuSekarang}
          </div>
          {/* ========================================= */}


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
            style={{ display: "flex", justifyContent: "center", gap: 30 }}
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            <div 
              className="method-card"
              onClick={() => setStep(STEP.INPUT_NAME)}
              style={styles.methodCardNM}
            >
              <h3 style={styles.methodTitle}>Nama</h3>
              <p style={styles.methodDesc}>Cari berdasarkan nama pasien</p>
            </div>

            <div 
              className="method-card"
              onClick={() => setStep(STEP.INPUT_REKMED)}
              style={{...styles.methodCardRM, borderColor: COLOR_REKMED_METHOD}}
            >
              <h3 style={styles.methodTitle}>Nomor Rekam Medis</h3>
              <p style={styles.methodDesc}>Cari berdasarkan nomor RM</p>
            </div>
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
          <form onSubmit={submitNama} style={styles.form} data-aos="zoom-in">
            <input
              type="text"
              value={namaCari}
              onChange={(e) => setNamaCari(e.target.value)}
              placeholder="Masukkan nama anda disini (Contoh : Ahmad)"
              className="pendaftaran-input"
              required
            />
            <button
              type="submit"
              disabled={loading || namaCari.length < 1}
              style={styles.button}
            >
              {loading ? "Mencari..." : "Cari"}
            </button>
          </form>
          <div style={styles.infoCardGreen} data-aos="fade-up" data-aos-delay="200">
            <h3 style={{ marginBottom: 8, color: "#059669" }}>
              💡 Tips Pencarian Nama
            </h3>
            <p style={{ margin: 0, color: "#065f46" }}>
              Masukkan nama lengkap atau sebagian nama Anda pada kolom di atas.
            </p>
            <p style={{ margin: "6px 0", color: "#065f46" }}>
              Contoh: <b>Ahmad</b> atau <b>Siti Badri</b>
            </p>
            <p style={{ margin: 0, color: "#065f46" }}>
              Jika data ditemukan, nama Anda akan muncul pada tabel di bawah.
            </p>
          </div>

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
          <form onSubmit={submitRekmed} style={styles.formCenter} data-aos="zoom-in">
            <RekmedInputGroup values={rekmedParts} onChange={setRekmedParts} />
            <button
              type="submit"
              disabled={loading || rekmedParts.some((rm) => rm.length !== 2)}
              style={styles.buttonCari}
            >
              {loading ? "Mencari..." : "Cari"}
            </button>
          </form>

          {/* Card informasi rekam medis */}
          <div style={styles.infoCard} data-aos="fade-up" data-aos-delay="200">
            <h3 style={{ marginBottom: 8, color: "#1e40af" }}>
              📘 Informasi Nomor Rekam Medis
            </h3>
            <p style={{ margin: 0 }}>
              Nomor Rekam Medis terdiri dari <b>3 bagian</b> dengan format:
            </p>
            <p style={{ margin: "6px 0" }}>
              <code style={styles.codeBox}>XX . XX . XX</code>
            </p>
            <p style={{ margin: 0 }}>
              Contoh: <b>01.23.45</b> → masukkan masing-masing <b>2 digit</b>{" "}
              pada setiap kolom.
            </p>
          </div>

          {msg && <div style={{ color: "red", marginTop: 12 }}>{msg}</div>}
        </div>
      );

    default:
      return null;
  }
}

const styles = {
  topButtonsContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    zIndex: 1000,
    alignItems: "flex-end",
  },
  greenButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    border: "none",
    borderRadius: 10,
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
    transition: "all 0.2s ease",
    color: "white",
    fontWeight: 600,
    fontSize: 14,
  },
  blueButton: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    border: "none",
    borderRadius: 10,
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
    transition: "all 0.2s ease",
    color: "white",
    fontWeight: 600,
    fontSize: 14,
  },
  buttonText: {
    whiteSpace: "nowrap",
  },
  // Style untuk jam (BARU DITAMBAHKAN)
  waktuDisplay: {
    fontSize: "2.25rem", // 36px
    fontWeight: 700,
    color: "#ffffff", // Warna putih
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.25)", // Bayangan teks agar terbaca
    marginTop: 8,
    marginBottom: 24,
    padding: "8px 24px",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Latar semi-transparan
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.2)",
    letterSpacing: "0.5px"
  },
  methodCardNM: {
    width: 280,
    minHeight: 240,
    background: "#2ab36b",
    borderRadius: 16,
    padding: "32px 24px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: `3px solid ${COLOR_NAME_METHOD}`,
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  methodCardRM: {
    width: 280,
    minHeight: 240,
    background: "#2276c3",
    borderRadius: 16,
    padding: "32px 24px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: `3px solid ${COLOR_NAME_METHOD}`,
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  methodIcon: {
    fontSize: 64,
    marginBottom: 16,
    transition: "transform 0.2s ease",
  },
  methodTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#e0e0e0ff",
    margin: "0 0 12px 0",
  },
  methodDesc: {
    fontSize: 14,
    color: "#ffffffff",
    margin: 0,
    lineHeight: 1.6,
  },
  form: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  formCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  button: {
    padding: "12px 0",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonCari: {
    marginTop: 8,
    width: 120,
    padding: "10px 0",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  infoCard: {
    marginTop: 24,
    backgroundColor: "#e0e7ff",
    borderRadius: 10,
    padding: "16px 20px",
    width: "fit-content",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  infoCardGreen: {
    marginTop: 24,
    backgroundColor: "#d1fae5",
    borderRadius: 10,
    padding: "16px 20px",
    width: "fit-content",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  codeBox: {
    background: "#1e40af",
    color: "white",
    padding: "2px 6px",
    borderRadius: 4,
    fontWeight: 600,
  },
};