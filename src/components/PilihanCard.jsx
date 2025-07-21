import React from "react";

const PilihanCard = ({ title, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "#fff",
      border: "2px solid #3b82f6",
      borderRadius: 12,
      boxShadow: "0 2px 10px #0001",
      padding: 30,
      minWidth: 180,
      margin: 20,
      fontWeight: 600,
      color: "#1e293b",
      fontSize: 20,
      cursor: "pointer",
      textAlign: "center",
      transition: "all 0.2s"
    }}
    onMouseDown={e => (e.target.style.background = "#f1f5f9")}
    onMouseUp={e => (e.target.style.background = "#fff")}
  >
    {title}
  </div>
);

export default PilihanCard;
