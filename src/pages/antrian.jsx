import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import jsPDF from "jspdf";
import NumberFlow from "@number-flow/react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  getBisnisTitle,
  getWaktuServer,
  getGates,
  getCurrentNumber,
  postNomorAntrianPx,
} from "../api/pendaftaran";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom"; // Corrected import
import { FaUserPlus, FaPrint, FaTicketAlt } from "react-icons/fa";

const MySwal = withReactContent(Swal);

const INSTANSI_NAMA = "KLINIK MUHAMMADIYAH LAMONGAN";
const INSTANSI_ALAMAT =
  "Jl. KH. Ahmad Dahlan No.26, Sidorukun, Sidoharjo, Kec. Lamongan";

export default function Antrian() {
  const [title, setTitle] = useState(INSTANSI_NAMA);
  const [alamat, setAlamat] = useState(INSTANSI_ALAMAT);
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [gates, setGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentNumber, setCurrentNumber] = useState(null);
  const [lastPrinted, setLastPrinted] = useState(null);
  const [gateLocked, setGateLocked] = useState(false);
  const [animateNumber, setAnimateNumber] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pulseTime, setPulseTime] = useState(false);
  const [numberAnimated, setNumberAnimated] = useState(true);
  const [showNumberCaret, setShowNumberCaret] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent global scroll
    const original = {
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      htmlHeight: document.documentElement.style.height,
      bodyHeight: document.body.style.height,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.position = "fixed";
    document.body.style.inset = "0";
    return () => {
      document.documentElement.style.overflow = original.htmlOverflow;
      document.body.style.overflow = original.bodyOverflow;
      document.documentElement.style.height = original.htmlHeight;
      document.body.style.height = original.bodyHeight;
      document.body.style.position = "";
      document.body.style.inset = "";
    };
  }, []);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: false, mirror: true, offset: 50 });
    const loadInitialData = async () => {
      try {
        const [_, gatesData, timeString] = await Promise.all([
          getBisnisTitle(),
          getGates(),
          getWaktuServer(),
        ]);
        setTitle(INSTANSI_NAMA);
        setAlamat(INSTANSI_ALAMAT);
        if (Array.isArray(gatesData) && gatesData.length > 0) {
          setGates(gatesData);
          setSelectedGate(gatesData[0].id);
        }
        if (timeString) updateTimeDisplay(timeString);
      } catch (err) {
        console.error(err);
        setErrorMessage("Tidak dapat memuat data dari server.");
      } finally {
        setIsLoading(false);
        setTimeout(() => AOS.refresh(), 100);
      }
    };
    const updateWaktu = async () => {
      try {
        const timeString = await getWaktuServer();
        if (timeString) updateTimeDisplay(timeString);
      } catch (err) {
        console.error(err);
      }
    };
    const updateTimeDisplay = (timeString) => {
      const now = new Date(timeString);
      setTanggal(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      setJam(now.toLocaleTimeString("id-ID", { hour12: false }));
    };
    loadInitialData();
    const interval = setInterval(updateWaktu, 1000);
    const pulseInterval = setInterval(() => {
      setPulseTime(true);
      setTimeout(() => setPulseTime(false), 100);
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(pulseInterval);
    };
  }, []);

  const cetakStrukPDF = (noAntrian) => {
    if (!noAntrian && noAntrian !== 0) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 327] });
    let y = 10;
    doc.setFont("Courier", "bold").setFontSize(14);
    doc.text(title, 40, y, { align: "center" });
    y += 5;
    const alamatStr = alamat || "-";
    const alamatLines = doc.splitTextToSize(alamatStr, 90);
    doc.setFont("Courier", "normal").setFontSize(9);
    doc.text(alamatLines, 40, y, { align: "center" });
    y += alamatLines.length * 4 + 3;
    doc.setLineWidth(0.3);
    doc.line(5, y, 75, y);
    y += 8;
    doc.setFont("Courier", "bold").setFontSize(11);
    doc.text("NOMOR ANTRIAN PENDAFTARAN", 40, y, { align: "center" });
    y += 20;
    doc.setFont("Courier", "bold").setFontSize(50);
    doc.text(String(noAntrian), 40, y, { align: "center" });
    y += 7;
    doc.setLineWidth(0.2);
    doc.line(15, y, 65, y);
    y += 5;
    doc.setFont("Courier", "normal").setFontSize(9);
    doc.text(tanggal, 40, y, { align: "center" });
    y += 8;
    doc.setFont("Courier", "italic").setFontSize(9);
    doc.text("Terima kasih telah bersabar menunggu", 40, y, { align: "center" });
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => setTimeout(() => iframe.contentWindow.print(), 1000);
  };

  const handlePilihGate = async () => {
    if (!selectedGate) {
      MySwal.fire("Perhatian", "Silakan pilih loket terlebih dahulu.", "warning");
      return;
    }
    try {
      setIsButtonLoading(true);
      const nomor = await getCurrentNumber(selectedGate);
      setCurrentNumber(nomor ?? 0);
      const saved = localStorage.getItem(`lastPrinted_${selectedGate}`);
      if (saved !== null) setLastPrinted(Number(saved));
      setGateLocked(true);
    } catch (err) {
      console.error(err);
      MySwal.fire("Error", "Gagal memuat nomor antrian saat ini", "error");
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleAmbilNomorDanCetak = async () => {
    try {
      setIsButtonLoading(true);
      const nextNo = (currentNumber ?? 0) + 1;
      await postNomorAntrianPx({ queNo: nextNo, atLocation: selectedGate });
      setNumberAnimated(true);
      setAnimateNumber(true);
      setTimeout(() => {
        setCurrentNumber(nextNo);
        setAnimateNumber(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }, 300);
      setLastPrinted(nextNo);
      localStorage.setItem(`lastPrinted_${selectedGate}`, String(nextNo));
      cetakStrukPDF(nextNo);
    } catch (err) {
      console.error(err);
      MySwal.fire("Gagal", "Terjadi kesalahan pada server.", "error");
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleReprint = () => {
    const last =
      lastPrinted ??
      (selectedGate ? Number(localStorage.getItem(`lastPrinted_${selectedGate}`)) : null);
    if (!last && last !== 0) {
      MySwal.fire("Perhatian", "Tidak ada nomor yang bisa dicetak ulang.", "info");
      return;
    }
    try {
      setIsButtonLoading(true);
      cetakStrukPDF(last);
    } catch (err) {
      console.error(err);
      MySwal.fire("Gagal", "Terjadi kesalahan saat mencetak ulang.", "error");
    } finally {
      setIsButtonLoading(false);
    }
  };

  const buttonStyle = {
    padding: "12px 20px",
    fontSize: 16,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontWeight: "500",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#fff",
  };
  const secondaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#fff",
  };

  if (isLoading || errorMessage) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          flexDirection: "column",
          background: "#f8fafc",
        }}
      >
        {isLoading ? (
          <div>Memuat data...</div>
        ) : (
          <div style={{ color: "red" }}>{errorMessage}</div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 20,
        background: "#f8fafc",
        overflow: "hidden",
      }}
    >
      {gateLocked && (
         <BackButton
            onClick={() => setGateLocked(false)}
            style={{
                position: 'fixed',
                top: 20,
                left: 20,
                zIndex: 1000,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
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
            }}
            data-aos="fade-right"
          >
            Kembali
          </BackButton>
      )}
      <button
        aria-label="Buka Aplikasi Antrian"
        onClick={() => navigate(-1)}
        disabled={gateLocked}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          background: "#2ab36b",
          color: "white",
          padding: "10px 18px",
          borderRadius: 12,
          border: "none",
          cursor: gateLocked ? "not-allowed" : "pointer",
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          transition: "background 0.3s ease, transform 0.2s ease, opacity 0.3s",
          zIndex: 1000,
          opacity: gateLocked ? 0.5 : 1,
        }}
        onMouseEnter={(e) => !gateLocked && (e.currentTarget.style.background = "#30c00cff")}
        onMouseLeave={(e) => !gateLocked && (e.currentTarget.style.background = "#2ab36b")}
        onMouseDown={(e) => !gateLocked && (e.currentTarget.style.transform = "scale(0.96)")}
        onMouseUp={(e) => !gateLocked && (e.currentTarget.style.transform = "scale(1)")}
        data-aos="fade-left"
        data-aos-delay="500"
      >
        <FaUserPlus size={16} />
        Aplikasi Pendaftaran Mandiri
      </button>

      <div data-aos="fade-down">
        <h1 style={{ color: "#2563eb", marginBottom: 10 }}>{title}</h1>
        <p style={{ 
            color: "white", 
            background: '#dc2626',
            fontWeight: 'bold',
            padding: '8px 12px',
            borderRadius: '8px',
            marginBottom: 20,
            display: 'inline-block'
        }}>{alamat}</p>
        <div style={{ fontWeight: "600", color: "#dc2626" }}>{tanggal}</div>
        <div style={{ fontSize: 32, fontWeight: "700", color: "#2563eb" }}>
          {jam}
        </div>
      </div>

      {!gateLocked ? (
        <div style={{ marginTop: 30, width: "100%", maxWidth: 400 }} data-aos="fade-up" data-aos-delay="200">
          <label style={{ fontWeight: "600", marginBottom: 10, display: "block" }}>
            Pilih Loket
          </label>
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            style={{ width: "100%", padding: 12, borderRadius: 8, marginBottom: 20, border: '1px solid #ccc' }}
          >
            {gates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.locaName}
              </option>
            ))}
          </select>
          <button
            onClick={handlePilihGate}
            disabled={isButtonLoading}
            style={{ ...primaryButtonStyle, width: "100%", fontWeight: "700" }}
          >
            <FaTicketAlt /> {isButtonLoading ? "Memuat..." : "Lanjut ke Ambil Nomor"}
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 30, width: "100%", maxWidth: 400 }} data-aos="fade-in">
          <h2 style={{ color: '#1e293b' }}>Nomor Antrian Saat Ini</h2>
          <div
            style={{
              fontSize: 64,
              fontWeight: "700",
              color: "#2563eb",
              margin: "20px 0",
            }}
          >
            <NumberFlow
              value={currentNumber || 0}
              locales="id-ID"
              format={{ useGrouping: false }}
              animated={numberAnimated}
            />
          </div>
          <button
            onClick={handleAmbilNomorDanCetak}
            disabled={isButtonLoading}
            style={{ ...primaryButtonStyle, width: "100%", marginBottom: 12 }}
          >
            <FaTicketAlt /> {isButtonLoading ? "Memproses..." : "Ambil Nomor & Cetak"}
          </button>
          <button
            onClick={handleReprint}
            disabled={
              isButtonLoading ||
              (lastPrinted === null && !localStorage.getItem(`lastPrinted_${selectedGate}`))
            }
            style={{ ...secondaryButtonStyle, width: "100%" }}
          >
            <FaPrint /> Cetak Ulang Nomor
          </button>
        </div>
      )}
    </div>
  );
}
