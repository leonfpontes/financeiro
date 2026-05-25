"use client";

import TextField, { TextFieldProps } from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

/** Formats cents (integer) as "1.234,56" */
function formatCents(cents: number): string {
  if (cents === 0) return "";
  const str = String(cents).padStart(3, "0");
  const intRaw = str.slice(0, -2).replace(/^0+/, "") || "0";
  const intPart = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decPart = str.slice(-2);
  return `${intPart},${decPart}`;
}

export type CurrencyInputProps = Omit<TextFieldProps, "value" | "onChange" | "type"> & {
  /** Current value in cents (integer). E.g. R$15,00 = 1500 */
  valueCents: number;
  onValueChange: (cents: number) => void;
};

export function CurrencyInput({ valueCents, onValueChange, ...props }: CurrencyInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const next = valueCents * 10 + parseInt(e.key, 10);
      if (next <= 99_999_999_99) onValueChange(next); // max ~R$ 999.999,99
    } else if (e.key === "Backspace") {
      e.preventDefault();
      onValueChange(Math.floor(valueCents / 10));
    }
  };

  return (
    <TextField
      {...props}
      value={formatCents(valueCents)}
      onChange={() => {}}
      onKeyDown={handleKeyDown}
      placeholder="0,00"
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
        },
        htmlInput: {
          inputMode: "numeric",
          style: { textAlign: "right", fontVariantNumeric: "tabular-nums" },
        },
      }}
    />
  );
}
