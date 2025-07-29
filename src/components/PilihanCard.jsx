// src/components/PilihanCard.jsx
import React from "react";

export default function PilihanCard({ title, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: color,
        color: "#fff",
        border: "none",
        borderRadius: 12,
        margin: 16,
        width: 220,
        fontSize: 20,
        fontWeight: 700,
        cursor: "pointer",
        textAlign: "center",
        boxShadow: "0 2px 10px #0001",
        padding: 18,
        transition: "background 0.18s",
      }}
    >
      {title}
    </button>
  );
}
