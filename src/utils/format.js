const LABEL_JENIS_KELAMIN = {
  L: "Laki-laki",
  P: "Perempuan",
};

export function formatJenisKelamin(kode) {
  return LABEL_JENIS_KELAMIN[kode] || "-";
}


export function joinRekmed(parts) {
  // parts: ["12","34","56"] → "12.34.56"
  return parts.filter(Boolean).join(".");
}
