import React from "react";

export default function BackButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        top: "40px",       
        left: "70px",      
        zIndex: 1000,
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "8px 20px",
        fontWeight: 600,
        fontSize: "1rem",
        cursor: "pointer",
        boxShadow: "0 1px 6px #0002",
      }}
    >
      {children || "Kembali"}
    </button>
  );
}