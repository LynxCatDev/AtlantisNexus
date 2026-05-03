"use client";

import { useState } from "react";

import { EyeIcon, EyeOffIcon, LockIcon } from "@/components/Icons/Icons";

type Props = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
};

export function PasswordField({
  name,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required,
  minLength,
  maxLength,
}: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="input-wrap">
      <LockIcon />
      <input
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="input-toggle"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </span>
  );
}
