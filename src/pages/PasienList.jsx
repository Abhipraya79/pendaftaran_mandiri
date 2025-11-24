import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { getApmToday } from "../api/pendaftaran";
import AOS from "aos";
import "aos/dist/aos.css";

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

  // useEffect untuk resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  useEffect(() => {
    fetchPasienData();
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const fetchPasienData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching track record data...");
      const result = await getApmToday();
      console.log("API Result:", result);

      if (result.success && result.appointments) {
        const appointmentsArray = Array.isArray(result.appointments) 
          ? result.appointments 
          : [];

        if (appointmentsArray.length === 0) {
          console.log("No track records found for today");
          setPasienList([]);
          setLoading(false);
          return;
        }

        // Format data sesuai dengan entity TrackRecordApmPx
        const formatted = appointmentsArray.map((item) => ({
          id: item.id || "-",
          apmId: item.apmId || "-",
          namaPx: item.namaPx || "-",
          rekmedNo: item.rekmedNo || "-",
          tglPeriksa: formatDate(item.tglPeriksa),
          nakes: item.nakes || "-",
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

  // Fungsi formatDate untuk tanggal periksa
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
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
        <div className="card shadow-lg border-0 rounded-4" data-aos="fade-up">
          {/* Header gradasi hijau */}
          <div className="card-header text-white py-4" style={{ background: "linear-gradient(135deg, #4ade80 0%, #2ab36b 100%)" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h3 className="mb-0 fw-bold">
                <i className="bi bi-people-fill me-2"></i>
                Daftar Pasien Hari Ini
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
              <div className="text-center py-5 bg-light" data-aos="fade-in">
                <i className="bi bi-calendar-x fs-1 text-muted"></i>
                <p className="mt-3 text-muted fs-5">
                  Tidak ada data pasien hari ini
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
                      <th>Nama Pasien</th>
                      <th>No. Rekam Medis</th>
                      <th>Tanggal Periksa</th>
                      <th>Dokter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pasienList.map((pasien, index) => (
                      <tr 
                        key={pasien.id} 
                        data-aos="fade-up"
                        data-aos-delay={index * 50}
                      >
                        <td className="text-center fw-medium text-muted">{index + 1}</td>
                        <td>
                          <span className="badge bg-secondary">{pasien.apmId}</span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person-circle me-2 text-primary"></i>
                            <span className="fw-semibold">{pasien.namaPx}</span>
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium text-info">{pasien.rekmedNo}</span>
                        </td>
                        <td>
                          <small className="text-muted">
                            <i className="bi bi-calendar-check me-1"></i>
                            {pasien.tglPeriksa}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-person-badge me-2 text-success"></i>
                            <span className="fw-medium">{pasien.nakes}</span>
                          </div>
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
                  <div 
                    key={pasien.id} 
                    className="card mb-3 shadow-sm border"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                      <span className="badge bg-dark fs-6">#{index + 1}</span>
                      <span className="badge bg-secondary">ID: {pasien.apmId}</span>
                    </div>
                    <div className="card-body">
                      <div className="row g-2">
                        <div className="col-12">
                          <small className="text-muted d-block">
                            <i className="bi bi-person-circle me-1"></i>
                            Nama Pasien
                          </small>
                          <strong className="text-primary fs-6">{pasien.namaPx}</strong>
                        </div>
                        <div className="col-12">
                          <small className="text-muted d-block">No. Rekam Medis</small>
                          <span className="fw-medium text-info">{pasien.rekmedNo}</span>
                        </div>
                        <div className="col-12">
                          <small className="text-muted d-block">
                            <i className="bi bi-calendar-check me-1"></i>
                            Tanggal Periksa
                          </small>
                          <span className="fw-medium">{pasien.tglPeriksa}</span>
                        </div>
                        <div className="col-12">
                          <small className="text-muted d-block">
                            <i className="bi bi-person-badge me-1"></i>
                            Dokter
                          </small>
                          <span className="fw-medium text-success">{pasien.nakes}</span>
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
              Total: <strong className="text-primary fs-5">{pasienList.length}</strong> pasien hari ini
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasienList;