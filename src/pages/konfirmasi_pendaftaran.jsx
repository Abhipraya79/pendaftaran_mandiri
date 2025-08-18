import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { savePendaftaranApm } from "../api/pendaftaran";
import BackButton from "../components/BackButton";
import AOS from 'aos';
import 'aos/dist/aos.css';

const tujuanList = [
  { value: "1", label: "Kunjungan Pertama" },
  { value: "2", label: "Kontrol" },
  { value: "3", label: "Rujukan Internal" },
  { value: "4", label: "Rujukan Eksternal" },
];

function hitungUmurDetail(tanggalLahir) {
  if (!tanggalLahir) return "";
  const lahir = new Date(tanggalLahir);
  const hariIni = new Date();

  let tahun = hariIni.getFullYear() - lahir.getFullYear();
  let bulan = hariIni.getMonth() - lahir.getMonth();
  let hari = hariIni.getDate() - lahir.getDate();

  if (hari < 0) {
    bulan -= 1;
    hari += new Date(hariIni.getFullYear(), hariIni.getMonth(), 0).getDate();
  }

  if (bulan < 0) {
    tahun -= 1;
    bulan += 12;
  }

  return `(${tahun} th, ${bulan} bln, ${hari} hr)`;
}

const greenBtn = {
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "16px 0",
  fontWeight: 700,
  fontSize: 18,
  width: "100%",
  cursor: "pointer",
  marginTop: 10,
  marginBottom: 8,
  transition: "background 0.15s",
};

const blueBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "16px 0",
  fontWeight: 700,
  fontSize: 18,
  width: "100%",
  cursor: "pointer",
  marginTop: 10,
  marginBottom: 8,
  transition: "background 0.15s",
};

export default function KonfirmasiPendaftaran() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const pasien = state?.pasien;
  const dokter = state?.dokter;

  const [mode, setMode] = useState("");
  const [noRujukan, setNoRujukan] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isBPJSBtnActive = noRujukan.length === 19 && !!tujuan && !loading;

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100,
    });
  }, []);

  const handleGoBack = () => {
    setMode("");       
    setNoRujukan("");  
    setTujuan("");     
    setError("");      
  };
  
  const handleCetak = async () => {
    setLoading(true);
    setError("");

    if (!pasien?.id || !dokter?.id || !dokter?.jamPraktek) {
      setError("Data pasien atau dokter tidak lengkap. Harap ulangi proses.");
      setLoading(false);
      return;
    }

    const payload = {
      request: {
        pxId: pasien.id,
        dokterId: dokter.id,
        timestamps: new Date().toISOString(),
        jamPraktek: dokter.jamPraktek,
        noRef: mode === "bpjs" ? noRujukan : null,
        jnsKun: mode === "bpjs" ? parseInt(tujuan) : 0,
      },
    };

    try {
      const response = await savePendaftaranApm(payload);
      
      const responseData = response?.response || {};
      const nomorAntrian = responseData.nomorAntrian || 'N/A';
      const nomorRegistrasi = responseData.nomorRegistrasi || 'N/A'; 

          const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 327],
      });

      const MARGIN_LEFT = 5;
      const MARGIN_RIGHT = 75;
      doc.setFont("Courier", "normal");
      doc.setLineHeightFactor(1.2);
      const HEADER_TOP = 10;

      doc.setFontSize(12);
      doc.text("KLINIK MUHAMMADIYAH LAMONGAN", 40, HEADER_TOP, { align: "center" });
      doc.setFontSize(10);
      doc.text("(0322) 321056", 40, HEADER_TOP + 5, { align: "center" });
      doc.line(MARGIN_LEFT, HEADER_TOP + 8, MARGIN_RIGHT, HEADER_TOP + 8);

      doc.setFont("Courier", "bold");
      doc.setFontSize(14);
      doc.text(mode === "bpjs" ? "BPJS" : "UMUM", MARGIN_LEFT, 25);
      doc.rect(MARGIN_RIGHT - 20, 20, 15, 8);
      doc.text(String(nomorAntrian), MARGIN_RIGHT - 12.5, 25.5, { align: "center" });

      doc.setFontSize(10);
      doc.text("NO", 5, 32);
      doc.setFontSize(14);
      doc.text(`: ${String(nomorRegistrasi)}`, 25, 32);

      doc.setFont("Courier", "normal");
      doc.setFontSize(9);

      let y = 40;
      const printRow = (label, value, valueBold = false) => {
        doc.setFont("Courier", "normal");
        doc.text(label, 5, y);
        if (valueBold) {
          doc.setFont("Courier", "bold");
        } else {
          doc.setFont("Courier", "normal");
        }
        doc.text(`: ${String(value || '-')}`, 25, y);
        y += 4;
      };

      const tanggalSekarang = new Date();
      printRow("REGISTER", pasien.id);
      printRow("TANGGAL", tanggalSekarang.toLocaleDateString("id-ID"));
      doc.text("NAMA", 5, y);
      doc.text(":", 25, y);
      const nama1 = doc.splitTextToSize(pasien.pxName || "-", 48);
      doc.text(nama1, 29, y);
      y += (nama1.length * 4) + 1;

      doc.text("ALAMAT", 5, y);
      doc.text(":", 25, y);
      const alamat = doc.splitTextToSize(pasien.pxAddress || "-", 48);
      doc.text(alamat, 29, y);
      y += (alamat.length * 4) + 1;

      doc.text("ORTU", 5, y);
      doc.text(":", 25, y);
      doc.text("-", 27, y);
      y += 4;

      printRow("JAM", tanggalSekarang.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }));

      const tanggalLahir = pasien.pxBirthdate ? new Date(pasien.pxBirthdate).toLocaleDateString("id-ID") : "-";
      const umurDetail = hitungUmurDetail(pasien.pxBirthdate);

      doc.text("T. LAHIR", 5, y);
      doc.text(`: ${tanggalLahir}`, 25, y);
      y += 4;

      if (pasien.pxBirthdate) {
        doc.text(umurDetail, 27, y);
        y += 4;
      }

      printRow("LAYANAN", "Klinik");
      printRow("SPESIALIS", "Umum");
      printRow("DOKTER", dokter.dokterName);
      y += 2;
      doc.setFont("Courier", "bold");
      doc.text("BIAYA KARCIS", 5, y);
      doc.text("15.000,00", MARGIN_RIGHT - 15, y, { align: "right" });
      y += 6;

      y += 2;
      doc.setFont("Courier", "bold");
      doc.text("JASA PERIKSA", 5, y);
      doc.text("15.000,00", MARGIN_RIGHT - 15, y, { align: "right" });
      y += 6;

      doc.setFont("Courier", "normal");
      doc.text("Layanan Tindakan Dan Penunjang Medis", MARGIN_LEFT, y); y += 4;
      doc.text("[ ] TINDAKAN", MARGIN_LEFT, y); y += 4;
      doc.text("[ ] LABORAT", MARGIN_LEFT, y); y += 4;
      doc.text("[ ] RADIOLOGI/USG", MARGIN_LEFT, y); y += 4;
      doc.text("[ ] INSTALASI FARMASI", MARGIN_LEFT, y); y += 6;

      printRow("REG", pasien.id);
      printRow("NO", nomorRegistrasi);
      printRow("TGL", tanggalSekarang.toLocaleDateString("id-ID"));
      doc.text("NAMA", 5, y);
      doc.text(":", 25, y);
      const nama = doc.splitTextToSize(pasien.pxName || "-", 48);
      doc.text(nama, 29, y);
      y += (nama.length * 4) + 1;
      y += 2;
      doc.setFont("Courier", "bold");
      doc.text("BIAYA KARCIS", 5, y);
      doc.text("15.000,00", MARGIN_RIGHT - 15, y, { align: "right" });
      y += 19;

      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = function () {
        setTimeout(() => {
          iframe.contentWindow.print();
        }, 600);
      };
    
    setTimeout(() => {
     navigate("/");
    }, 3000);

    } catch (err) {
      console.error("error", err);
      let displayMessage = "Terjadi kesalahan";
      if (err instanceof Error) {
        displayMessage = err.message;
      } else if (err && err.response) {
        const status = err.response.status;
        const data = err.response.data;
        const backendMessage = data?.message || data?.error || JSON.stringify(data);
        displayMessage = `Error dari Server (${status}): ${backendMessage}`;
      } else if (typeof err === 'string') {
        displayMessage = err;
      } else {
        try {
          displayMessage = JSON.stringify(err);
        } catch {
          displayMessage = "Objek error tidak dapat ditampilkan.";
        }
      }
      setError(`Terjadi error: ${displayMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!pasien || !dokter) {
    return (
      <div className="pendaftaran-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="box-validasi" data-aos="fade-up" data-aos-duration="600">
          <h2>Data tidak lengkap</h2>
          <div>Silahkan ulangi proses pendaftaran.</div>
          <button
            className="pendaftaran-back-btn"
            style={{
              marginTop: 20, background: "#dc2626", color: "#fff",
              border: "none", borderRadius: 8, padding: "8px 20px",
              fontWeight: 600, fontSize: "1rem", cursor: "pointer",
              boxShadow: "0 1px 6px #0001",
            }}
            onClick={() => navigate("/")}
            data-aos="zoom-in" data-aos-delay="200"
          >
            Kembali ke Awal
          </button>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="pendaftaran-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BackButton onClick={() => navigate(-1)} data-aos="fade-right" data-aos-duration="500">Kembali</BackButton>
        <div style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 2px 16px #0002",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: 24,
          maxWidth: 900,
          width: "100%",
          justifyContent: "center",
          marginTop: 40,
       }} data-aos="fade-up" data-aos-duration="800">

  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 30, textAlign: "center" }} data-aos="fade-down" data-aos-delay="200">
      Silahkan Pilih Jenis Pasien
    </h2>
    <button
      style={{ ...greenBtn, fontSize: 20, marginBottom: 16 }}
      onClick={() => setMode("umum")}
      data-aos="fade-right" data-aos-delay="400"
    >
      Pasien Umum
    </button>
    <button
      style={{ ...blueBtn, fontSize: 20, marginBottom: 16 }}
      onClick={() => setMode("bpjs")}
      data-aos="fade-right" data-aos-delay="500"
    >
      Pasien BPJS
    </button>
  </div>
 
    <div style={{
      flex: 1,
      background: "#f9fafb",
      border: "1px solid #d0d0d0ff",
      borderRadius: 12,
      padding: "24px 24px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }} data-aos="fade-left" data-aos-delay="300">

  <div>
    <h3 style={{
      marginBottom: 14,
      fontSize: 20,
      fontWeight: 700,
      color: "#2563eb",
      borderBottom: "2px solid #cbd5e1",
      paddingBottom: 8,
    }} data-aos="fade-down" data-aos-delay="600">
      Informasi Pendaftaran
    </h3>

    <div style={{ marginBottom: 16 }} data-aos="fade-up" data-aos-delay="700">
      <h4 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
        Pasien Umum
      </h4>
      <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
        Pasien Umum tidak memerlukan rujukan dan biaya pelayanan ditanggung secara pribadi. 
      </p>
    </div>

    <div style={{ marginBottom: 16 }} data-aos="fade-up" data-aos-delay="800">
      <h4 style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>
        Pasien BPJS
      </h4>
      <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
        Wajib membawa <strong>nomor rujukan aktif</strong> dari faskes 1 atau rumah sakit rujukan. Juga diwajibkan memilih tujuan pendaftaran.
      </p>
    </div>
  </div>

        <div style={{
          background: "#ecfdf5",
          border: "1px solid #34d399",
          padding: 14,
          borderRadius: 8,
          color: "#065f46",
          fontSize: 14,
          fontWeight: 500,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }} data-aos="zoom-in" data-aos-delay="900">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="20" viewBox="0 0 24 24" width="20" stroke="#10b981">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"/>
    </svg>
    <span>
      Pilih jenis pasien sesuai dengan hak pelayanan Anda untuk menghindari kendala pada proses pemeriksaan atau penagihan.
    </span>
  </div>
</div>
</div>
      </div>
    );
  }

  if (mode === "umum") {
    return (
      <div className="pendaftaran-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BackButton onClick={handleGoBack} data-aos="fade-right" data-aos-duration="500">Kembali</BackButton>
        <div
          style={{
            display: "flex", gap: 32, width: "100%", maxWidth: 900,
            background: "#fff", borderRadius: 18, boxShadow: "0 2px 16px #0002",
            padding: "32px 24px", alignItems: "stretch",
          }}
          data-aos="fade-up" data-aos-duration="800"
        >
          <div style={{ flex: 1, minWidth: 260, borderRight: "1.5px solid #e0e7ef", paddingRight: 24, display: "flex", flexDirection: "column", justifyContent: "center" }} data-aos="fade-right" data-aos-delay="200">
            <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 18, color: "#3b3b3b" }}>Data Pendaftaran</h2>
            <table style={{ width: "100%", marginBottom: 20 }} data-aos="fade-up" data-aos-delay="400">
              <tbody>
                <tr><td><b>Nomor RM</b></td><td>: {pasien.id}</td></tr>
                <tr><td><b>Nama</b></td><td>: {pasien.pxName}</td></tr>
                <tr><td><b>Dokter</b></td><td>: {dokter.dokterName}</td></tr>
                <tr><td><b>Jenis Pasien</b></td><td>: Umum</td></tr>
              </tbody>
            </table>
            <div style={{ fontSize: 13, color: "#64748b" }} data-aos="fade-up" data-aos-delay="500">
              Pastikan data sudah benar sebelum melanjutkan ke proses berikutnya.
            </div>
          </div>
          <div style={{ flex: 1.2, minWidth: 280, paddingLeft: 16, display: "flex", flexDirection: "column", justifyContent: "center" }} data-aos="fade-left" data-aos-delay="300">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, color: "#3856b0", textAlign: "center" }} data-aos="fade-down" data-aos-delay="400">
              Proses Pendaftaran Pasien Umum
            </h3>
            <div style={{ fontSize: 15, color: "#373737", marginBottom: 20, textAlign: "center" }} data-aos="fade-up" data-aos-delay="500">
              Tekan tombol berikut untuk mencetak struk pendaftaran.<br />
              <b>Struk wajib dibawa  setelah dicetak</b>
            </div>
            <button onClick={handleCetak} style={{ ...greenBtn, fontSize: 20, width: "100%", maxWidth: 340, margin: "0 auto" }} disabled={loading} data-aos="zoom-in" data-aos-delay="600">
              {loading ? "Memproses..." : "Cetak Struk"}
            </button>
            {error && <div style={{ color: "#b91c1c", marginTop: 10, textAlign: "center", fontWeight: 500, background: "#fee2e2", padding: "8px", borderRadius: "8px", border: "1px solid #fecaca" }} data-aos="shake" data-aos-duration="500">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pendaftaran-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <BackButton onClick={handleGoBack} data-aos="fade-right" data-aos-duration="500">Kembali</BackButton>
      <div
        style={{
          display: "flex", gap: 32, width: "100%", maxWidth: 900,
          background: "#fff", borderRadius: 18, boxShadow: "0 2px 16px #0002",
          padding: "32px 24px", alignItems: "stretch", marginTop : 20
        }}
        data-aos="fade-up" data-aos-duration="800"
      >
        <div style={{ flex: 1, minWidth: 260, borderRight: "1.5px solid #e0e7ef", paddingRight: 24, display: "flex", flexDirection: "column", justifyContent: "center" }} data-aos="fade-right" data-aos-delay="200">
          <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 18, color: "#3b3b3b" }}>Data Pendaftaran</h2>
          <table style={{ width: "100%", marginBottom: 20 }} data-aos="fade-up" data-aos-delay="400">
            <tbody>
              <tr><td><b>Nomor RM</b></td><td>: {pasien.id}</td></tr>
              <tr><td><b>Nama</b></td><td>: {pasien.pxName}</td></tr>
              <tr><td><b>Dokter</b></td><td>: {dokter.dokterName}</td></tr>
              <tr><td><b>Jenis Pasien</b></td><td>: BPJS</td></tr>
            </tbody>
          </table>
          <div style={{ fontSize: 13, color: "#64748b" }} data-aos="fade-up" data-aos-delay="500">
            Pastikan data sudah benar sebelum melanjutkan ke proses berikutnya.
          </div>
        </div>
        <div style={{ flex: 1.2, minWidth: 280, paddingLeft: 16, display: "flex", flexDirection: "column", justifyContent: "center" }} data-aos="fade-left" data-aos-delay="300">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 13, color: "#3856b0", textAlign: "center" }} data-aos="fade-down" data-aos-delay="400">
            Proses Pendaftaran Pasien BPJS
          </h3>
          <div style={{ fontSize: 15, color: "#373737", marginBottom: 10, textAlign: "center" }} data-aos="fade-up" data-aos-delay="500">
            <b>Scan Barcode Rujukan BPJS</b> Anda atau Input Manual <b>Nomor Rujukan BPJS</b> di bawah ini, kemudian pilih tujuan pendaftaran:
          </div>
          <input
            type="text"
            value={noRujukan}
            onChange={e => {
              const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 19);
              setNoRujukan(val);
              if (tujuan && val.length < 19) setTujuan("");
            }}
            placeholder="Input No. Rujukan BPJS"
            className="pendaftaran-input"
            style={{
              width: "100%", maxWidth: 320, fontSize: 17,
              margin: "0 auto 12px auto", display: "block",
              textAlign: "center", letterSpacing: "2px",
              textTransform: "uppercase",
            }}
            maxLength={19}
            autoFocus
            data-aos="zoom-in" data-aos-delay="600"
          />
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14, textAlign: "center" }} data-aos="fade-up" data-aos-delay="650">
            *Hanya angka/huruf, wajib diisi !
          </div>
          <div style={{
            marginBottom: 20, display: "flex", flexDirection: "column",
            gap: 7, alignItems: "center"
          }} data-aos="fade-up" data-aos-delay="700">
            {tujuanList.map((jk, index) => (
              <label key={jk.value} style={{
                fontWeight: 500, display: "flex", alignItems: "center",
                color: noRujukan.length === 19 ? "#2a3450" : "#aaa",
                fontSize: 15, gap: 8
              }} data-aos="fade-left" data-aos-delay={750 + index * 100}>
                <input
                  type="radio" name="tujuan"
                  disabled={noRujukan.length !== 19}
                  checked={tujuan === jk.value}
                  onChange={() => setTujuan(jk.value)}
                  style={{ accentColor: "#2563eb", marginRight: 6 }}
                />
                {jk.label}
              </label>
            ))}
          </div>
          <button
            onClick={handleCetak}
            disabled={!isBPJSBtnActive}
            style={{
              ...blueBtn, fontSize: 20, width: "100%", maxWidth: 340,
              margin: "0 auto", opacity: isBPJSBtnActive ? 1 : 0.7,
              cursor: isBPJSBtnActive ? "pointer" : "not-allowed",
            }}
            data-aos="zoom-in" data-aos-delay="800"
          >
            {loading ? "Memproses..." : "Cetak Struk"}
          </button>
          {error && <div style={{ color: "#b91c1c", marginTop: 10, textAlign: "center", fontWeight: 500, background: "#fee2e2", padding: "8px", borderRadius: "8px", border: "1px solid #fecaca" }} data-aos="shake" data-aos-duration="500">{error}</div>}
        </div>
      </div>
    </div>
  );
}