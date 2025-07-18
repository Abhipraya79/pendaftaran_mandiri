import React from "react";

const PilihanCard = ({ title, onClick }) => (
  <div className="pilihan-card" onClick={onClick}>
    {title}
  </div>
);

export default PilihanCard;
