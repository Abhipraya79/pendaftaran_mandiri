import React from "react";

export default function RekmedInputGroup({ values, onChange }) {
  const handleChange = (idx, val) => {
    if (!/^\d{0,2}$/.test(val)) return;
    const next = [...values];
    next[idx] = val.slice(0, 2);
    onChange(next);
    if (val.length === 2 && idx < 2) {
      const nextInput = document.getElementById(`rekmed-field-${idx + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <React.Fragment key={i}>
          <input
            id={`rekmed-field-${i}`}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={values[i]}
            onChange={e => {
              const onlyNum = e.target.value.replace(/[^0-9]/g, '');
              handleChange(i, onlyNum);
            }}
            className="pendaftaran-input"
            style={{
              width: 60,
              textAlign: "center",
              borderTopRightRadius: i === 2 ? 8 : 0,
              borderBottomRightRadius: i === 2 ? 8 : 0,
              borderTopLeftRadius: i === 0 ? 8 : 0,
              borderBottomLeftRadius: i === 0 ? 8 : 0,
              marginRight: 0,
              marginLeft: 0,
              borderRight: i !== 2 ? "none" : undefined,
            }}
            placeholder="00"
            maxLength={2}
            required
          />
          {i < 2 && (
            <span style={{
              fontWeight: 800,
              fontSize: 18,
              color: "#64748b",
              margin: "0 4px",
              userSelect: "none",
            }}>
              .
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
