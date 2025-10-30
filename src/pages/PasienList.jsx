import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { getApmToday } from "../api/pendaftaran";
import AOS from "aos"; // <-- TAMBAHKAN
import "aos/dist/aos.css"; // <-- TAMBAHKAN

// Komponen BackButton
const BackButton = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="btn btn-danger position-fixed shadow-sm"
    style={{
      top: "40px",
      left: "70px",
      zIndex: 1000,
      fontWeight: 600,
      fontSize: "1rem",
    }}
  >
    <i className="bi bi-arrow-left me-2"></i>
    {children || "Kembali"}
  </button>
);

const PasienList = () => {
  const [pasienList, setPasienList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  // Data Dokter
  const dokterData = {
    3: "Mira Belladonna Agriyanti, dr.",
    2: "Anisa Wahyuniarti, dr.",
    1: "Lena Wahyu Setianingsih, dr.",
    4: "Yudhistiro Andri Nugroho, dr. Sp. An",
    5: "Abdurrahman Yusuf Habibie, dr. Sp. OT",
    6: "Lakhsmi Pramushinta, dr. Sp. JP",
    7: "Razzaqvi, dr. Sp. M, M.Ked.Klin",
    8: "Dewi Masitha, dr. Sp. GK",
    9: "Ainun Zakiyah, dr. Sp. An",
    10: "Candra Dewi K., dr. Sp. PK",
    11: "Dalila Rahma Leputri, dr.",
    12: "Fais Dina Artika, dr.",
    13: "Shiko Indrawan Mahardani, dr.",
    14: "Lina Rohmawati, drg. Sp. Perio",
    15: "Diyah Nofita Ofaningtyas, dr. Sp. OG",
    16: "Albar Rahman Hakim, dr.",
    17: "Muhammad Iqbal Mubarok, dr.",
    18: "Romy Hari Pujanto, dr. Sp. B",
    19: "Fajar Admayana, dr. Sp.PD",
    20: "Eni Fatmawati, dr. Sp. OG",
    21: "Bayu Kurniawan, dr. Sp. A",
    22: "Dimas Hantoko, dr. Sp. S",
    23: "Qurrotun Ayun Mawadatur, dr.",
    24: "Imama Khalis Nur Arifah, dr.",
    25: "Agus Syaifuddin Setiawan, drg.",
    26: "Thanthawy Jauhary, dr. Sp. Rad",
    84: "Orizanov Mahisa, dr. Sp. An",
    85: "Hajar Refika, dr. Sp. An.",
    61: "Anas Mahfud, dr. Sp. An",
    92: "Safira Nur Ramadhani, dr.",
    89: "Meianti Harjani, dr, SpPA"
  };

  // useEffect untuk resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect untuk fetch data
  useEffect(() => {
    fetchPasienData();
  }, []);

  // <-- TAMBAHKAN: useEffect untuk inisialisasi AOS
  useEffect(() => {
    AOS.init({
      duration: 800, // Durasi animasi
      once: true, // Animasi hanya terjadi sekali
    });
  }, []);


  // Fungsi getDokterName
  const getDokterName = (dokterId) => {
    return dokterData[dokterId] || `Dokter ID: ${dokterId}`;
  };

  // Fungsi fetchPasienData
  const fetchPasienData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching patient data...");
      const result = await getApmToday();
      console.log("API Result:", result);

      if (result.success && result.appointments) {
        const appointmentsArray = Array.isArray(result.appointments) 
          ? result.appointments 
          : [];

        if (appointmentsArray.length === 0) {
          console.log("No appointments found");
          setPasienList([]);
          setLoading(false);
          return;
        }

        const formatted = appointmentsArray.map((item) => ({
      id: item.id || "-",
      rekmedNo: item.rekmedNo || "-",
      tglApm: formatDateTime(item.tglApm),
      dokterId: item.dokterId || "-",
      dokterName: getDokterName(item.dokterId),
      jamPraktek: item.jamPraktek || "-",
      noRef: item.noRef || "-",
      jnsKun: item.jnsKun == 0 ? "UMUM" : "BPJS",
    }));

        console.log("Formatted data:", formatted);
        setPasienList(formatted);
      } else {
        const errorMsg = result.error || "Gagal mengambil data dari server";
        console.error("API Error:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(`Gagal terhubung ke server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi formatDateTime
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      console.error("Date formatting error:", e);
      return "-";
    }
  };

  // Render state Loading
  if (loading) {
    return (
      <div className="pasien-list-page">
        <BackButton onClick={() => navigate("/")} />
        <div className="container mt-5">
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fs-5">Memuat data pasien...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render state Error
  if (error) {
    return (
      <div className="pasien-list-page">
        <BackButton onClick={() => navigate("/")} />
        <div className="container mt-5">
          <div className="card shadow-sm border-danger">
            <div className="card-body text-center py-5">
              <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
              <h3 className="mt-3 text-danger">Error</h3>
              <p className="text-muted">{error}</p>
              <button
                onClick={fetchPasienData}
                className="btn btn-primary mt-3"
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Tampilan Utama
  return (
    <div className="pasien-list-page" style={{ minHeight: "100vh", paddingTop: "100px", paddingBottom: "50px" }}>
      <BackButton onClick={() => navigate("/")} />

      <div className="container">
        {/* <-- TAMBAHKAN: data-aos untuk kartu utama */}
        <div className="card shadow-lg border-0 rounded-4" data-aos="fade-up">
          {/* Header gradasi hijau */}
          <div className="card-header text-white py-4" style={{ background: "linear-gradient(135deg, #4ade80 0%, #2ab36b 100%)" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h3 className="mb-0 fw-bold">
                <i className="bi bi-people-fill me-2"></i>
                Daftar Pendaftaran Pasien Hari Ini
              </h3>
              <button
                onClick={fetchPasienData}
                className="btn btn-light btn-sm shadow-sm"
                style={{ fontWeight: 600 }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </button>
            </div>
          </div>

          <div className="card-body p-0">
            {pasienList.length === 0 ? (
              // Tampilan jika data kosong
              // <-- TAMBAHKAN: data-aos untuk pesan "data kosong"
              <div className="text-center py-5 bg-light" data-aos="fade-in">
                <i className="bi bi-calendar-x fs-1 text-muted"></i>
                <p className="mt-3 text-muted fs-5">
                  Tidak ada pendaftaran pasien hari ini
                </p>
              </div>
            ) : !isMobile ? (
              // Tampilan Desktop (Tabel)
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  {/* Header tabel dengan warna kustom #2276c3 */}
                  <thead style={{ backgroundColor: "#2276c3", color: "white" }}>
                    <tr>
                      <th className="text-center" style={{ width: "50px" }}>No</th>
                      <th>ID Pendaftaran</th>
                      <th>No. Rekam Medis</th>
                      <th>Tanggal & Waktu</th>
                      <th>Nama Dokter</th>
                      <th className="text-center">Jam Praktek</th>
                      <th>No. Rujukan</th>
                      <th className="text-center">Jenis Kunjungan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pasienList.map((pasien, index) => (
                      // <-- TAMBAHKAN: data-aos dan data-aos-delay untuk list item
                      <tr 
                        key={pasien.id} 
                        data-aos="fade-up"
                        data-aos-delay={index * 50}
                      >
                        <td className="text-center fw-medium text-muted">{index + 1}</td>
                        <td>
                          <span className="badge bg-secondary">{pasien.id}</span>
                        </td>
                        <td>
                          <span className="fw-semibold text-primary">{pasien.rekmedNo}</span>
                        </td>
                        <td>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {pasien.tglApm}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person-badge me-2 text-success"></i>
                            <span className="fw-medium">{pasien.dokterName}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info text-dark">
                            {pasien.jamPraktek}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">{pasien.noRef}</small>
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              pasien.jnsKun === "BPJS" 
                                ? "bg-primary" 
                                : "bg-purple"
                            }`}
                            style={
                              pasien.jnsKun !== "BPJS" 
                                ? { backgroundColor: "#6f42c1" }
                                : {}
                            }
                          >
                            {pasien.jnsKun}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Tampilan Mobile (Kartu)
              <div className="p-3">
                {pasienList.map((pasien, index) => (
                  // <-- TAMBAHKAN: data-aos dan data-aos-delay untuk list item
                  <div 
                    key={pasien.id} 
                    className="card mb-3 shadow-sm border"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <span className="badge bg-dark fs-6">#{index + 1}</span>
                      <span
                        className={`badge ${
                          pasien.jnsKun === "BPJS" 
                            ? "bg-primary" 
                            : "bg-purple"
                        }`}
                        style={
                          pasien.jnsKun !== "BPJS" 
                            ? { backgroundColor: "#6f42c1" }
                            : {}
                        }
                      >
                        {pasien.jnsKun}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="row g-2">
                        <div className="col-12">
                          <small className="text-muted d-block">ID Pendaftaran</small>
                          <span className="badge bg-secondary">{pasien.id}</span>
                        </div>
                        <div className="col-12">
                          <small className="text-muted d-block">No. Rekam Medis</small>
                          <strong className="text-primary fs-6">{pasien.rekmedNo}</strong>
                        </div>
                        <div className="col-12">
                          <small className="text-muted d-block">
                            <i className="bi bi-clock me-1"></i>
                            Tanggal & Waktu
                          </small>
                          <span className="fw-medium">{pasien.tglApm}</span>
                        </div>
                        <div className="col-12">
                          <small className="text-muted d-block">
                            <i className="bi bi-person-badge me-1"></i>
                            Nama Dokter
                          </small>
                          <span className="fw-medium text-success">{pasien.dokterName}</span>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Jam Praktek</small>
                          <span className="badge bg-info text-dark">{pasien.jamPraktek}</span>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">No. Rujukan</small>
                          <span className="text-muted">{pasien.noRef}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="card-footer bg-light text-center py-3">
            <span className="text-muted">
              Total: <strong className="text-primary fs-5">{pasienList.length}</strong> pasien terdaftar hari ini
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasienList;