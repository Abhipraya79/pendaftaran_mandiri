import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import jsPDF from "jspdf";
import {
  getBisnisTitle,
  getWaktuServer,
  getGates,
  getCurrentNumber,
  postNomorAntrianPx,
} from "../api/pendaftaran";
import BackButton from "../components/BackButton";
import { useLocation, useNavigate } from "react-router-dom";

const MySwal = withReactContent(Swal);

export default function Antrian() {
  const [title, setTitle] = useState("");
  const [alamat, setAlamat] = useState("");
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
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [klinikData, gatesData, timeString] = await Promise.all([
          getBisnisTitle(),
          getGates(),
          getWaktuServer(),
        ]);

        setTitle(klinikData?.nama ?? "KLINIK");
        setAlamat(klinikData?.addr ?? "");

        if (Array.isArray(gatesData) && gatesData.length > 0) {
          setGates(gatesData);
          setSelectedGate(gatesData[0].id);
        }

        if (timeString) updateTimeDisplay(timeString);
      } catch (err) {
        console.error("Gagal memuat data awal:", err);
        setErrorMessage("Tidak dapat memuat data dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    const updateWaktu = async () => {
      try {
        const timeString = await getWaktuServer();
        if (timeString) updateTimeDisplay(timeString);
      } catch (err) {
        console.error("Gagal update waktu server:", err);
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
    return () => clearInterval(interval);
  }, []);

  const cetakStrukPDF = (noAntrian) => {
    if (!noAntrian && noAntrian !== 0) return;
    const doc = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: [80, 327],
});

let y = 10;


doc.setFont("Courier", "bold").setFontSize(14);
doc.text(title, 40, y, { align: "center" });
y += 5;

const alamatStr = alamat || "-";
const alamatLines = doc.splitTextToSize(alamatStr, 90);
doc.setFont("Courier", "normal").setFontSize(9);
doc.text(alamatLines, 40, y, { align: "center" });
y += (alamatLines.length * 4) + 3;

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

iframe.onload = function () {
  setTimeout(() => {
    iframe.contentWindow.print();
  }, 100);
  };
}
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
      setCurrentNumber(nextNo);
      setLastPrinted(nextNo);

      localStorage.setItem(`lastPrinted_${selectedGate}`, String(nextNo));

      cetakStrukPDF(nextNo);
    } catch (err) {
      console.error("Gagal mengambil nomor antrian:", err);
      MySwal.fire(
        "Gagal",
        err.response?.data?.message || "Terjadi kesalahan pada server.",
        "error"
      );
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleReprint = async () => {
    const last = lastPrinted ?? (selectedGate ? Number(localStorage.getItem(`lastPrinted_${selectedGate}`)) : null);
    if (!last && last !== 0) {
      MySwal.fire("Perhatian", "Tidak ada nomor yang bisa dicetak ulang.", "info");
      return;
    }

    const confirm = await MySwal.fire({
      title: "Cetak Ulang?",
      text: `Cetak ulang nomor ${last}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, cetak ulang",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      setIsButtonLoading(true);
      cetakStrukPDF(last);
    } catch (err) {
      console.error("Gagal reprint:", err);
      MySwal.fire("Gagal", "Terjadi kesalahan saat mencetak ulang.", "error");
    } finally {
      setIsButtonLoading(false);
    }
  };

  if (isLoading || errorMessage) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        {isLoading ? "Memuat data..." : errorMessage}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{title}</h2>
      <p style={styles.address}>{alamat}</p>
      <div style={styles.timeContainer}>{tanggal}</div>
      <div style={styles.clock}>{jam}</div>

      {!gateLocked ? (
        <>
          <label style={styles.label}>Pilih Loket:</label>
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            style={styles.select}
          >
            {gates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.locaName}
              </option>
            ))}
          </select>
          <BackButton onClick={() => navigate(-1)}>Kembali</BackButton>
          <button
            onClick={handlePilihGate}
            style={styles.button}
            disabled={isButtonLoading}
          >
            {isButtonLoading ? "Memuat..." : "Lanjut ke Ambil Nomor"}
          </button>
        </>
      ) : (
        <>
        <BackButton onClick={() => setGateLocked(false)}>Kembali</BackButton>
          <h3>Nomor Antrian Saat Ini</h3>
          <div style={{ fontSize: 50, fontWeight: "bold" }}>
            {currentNumber || "-"}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <button
              onClick={handleAmbilNomorDanCetak}
              style={styles.button}
              disabled={isButtonLoading}
            >
              {isButtonLoading ? "Memproses..." : "Ambil Nomor & Cetak"}
            </button>

            <button
              onClick={handleReprint}
              style={{ ...styles.button, backgroundColor: "#6c757d" }}
              disabled={isButtonLoading || (lastPrinted === null && !localStorage.getItem(`lastPrinted_${selectedGate}`))}
              title={lastPrinted ? `Re-print: ${lastPrinted}` : "Tidak ada nomor untuk re-print"}
            >
              {isButtonLoading ? "Memproses..." : "Re-print (Cetak Ulang)"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: 20,
    fontFamily: "sans-serif",
    textAlign: "center",
    maxWidth: 400,
    margin: "20px auto",
    border: "1px solid #ccc",
    borderRadius: 10,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  title: { color: "#0056b3", marginBottom: 5 },
  address: { margin: 0, fontSize: "14px", color: "#555" },
  timeContainer: {
    backgroundColor: "#d9534f",
    color: "#fff",
    padding: "8px 10px",
    margin: "15px 0 5px 0",
    borderRadius: 5,
    fontWeight: "bold",
  },
  clock: {
    color: "#0056b3",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: { display: "block", marginBottom: 5, fontWeight: "bold" },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: 20,
    fontSize: "16px",
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px 24px",
    fontSize: "18px",
    backgroundColor: "#0088cc",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
    marginTop: 10,
  },
};
