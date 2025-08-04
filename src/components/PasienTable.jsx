import React, { useState } from "react";

export default function PasienTable({ data, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("pxName");
  const [sortOrder, setSortOrder] = useState("asc");

  if (!data || data.length === 0) {
    return null;
  }

  const filteredData = data.filter((pasien) =>
    String(pasien.pxName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;

    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (aValue == null) return 1;
    if (bValue == null) return -1;

    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 16,
    tableLayout: "fixed",
  };

  const thStyles = {
    padding: "16px 12px",
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
    background: "#f9fafb",
    fontWeight: 600,
    color: "#374151",
    userSelect: "none",
    transition: "background-color 0.2s",
  };

  const tdStyles = {
    padding: "16px 12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#374151",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const buttonStyles = {
    padding: "8px 20px",
    borderRadius: 8,
    border: "none",
    background: "#10b981",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s",
    minWidth: 80,
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 900,
        background: "#fff",
        borderRadius: 16,
        marginTop: 28,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto", padding: "0 24px 24px 24px" }}>
        {sortedData.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#6b7280",
              fontSize: 16,
            }}
          >
            <p>
              Tidak ada pasien yang cocok dengan pencarian "{searchTerm}"
            </p>
          </div>
        ) : (
          <table style={tableStyles}>
            <thead>
              <tr>
                <th
                  style={{
                    ...thStyles,
                    width: "25%",
                    cursor: "default",
                    backgroundColor: "#f9fafb",
                    textAlign: "center",
                  }}
                >
                  No. Rekam Medis
                </th>
                <th
                  style={{
                    ...thStyles,
                    width: "30%",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={() => handleSort("pxName")}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                >
                  Nama Pasien {getSortIcon("pxName")}
                </th>
                <th
                  style={{
                    ...thStyles,
                    width: "30%",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={() => handleSort("pxAddress")}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f3f4f6")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                >
                  Alamat {getSortIcon("pxAddress")}
                </th>
                <th
                  style={{
                    ...thStyles,
                    width: "15%",
                    cursor: "default",
                    textAlign: "center",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((pasien) => (
                <tr
                  key={pasien.id}
                  style={{ transition: "background-color 0.2s" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={{ ...tdStyles, fontWeight: 600, color: "#1f2937" }}>
                    {pasien.id}
                  </td>
                  <td style={{ ...tdStyles, fontWeight: 500 }}>
                    {pasien.pxName}
                  </td>
                  <td style={tdStyles} title={pasien.pxAddress}>
                    {pasien.pxAddress}
                  </td>
                  <td style={{ ...tdStyles, textAlign: "center" }}>
                    <button
                      style={buttonStyles}
                      onClick={() => onSelect && onSelect(pasien)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#059669";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 4px 12px rgba(16, 185, 129, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#10b981";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      Pilih
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        style={{
          padding: "12px 24px",
          borderTop: "1px solid #e5e7eb",
          background: "#f9fafb",
          fontSize: 14,
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        Menampilkan {sortedData.length} dari {data.length} total hasil
        {filteredData.length !== data.length && (
          <button
            style={{
              marginLeft: 12,
              padding: "4px 12px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
            }}
            onClick={() => setSearchTerm("")}
          >
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
