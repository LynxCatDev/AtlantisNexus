"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { useAuth } from "@/components/Auth/AuthProvider";
import { ApiError, apiBaseUrl } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

import { getCroppedBlob } from "./getCroppedBlob";
import "./AvatarUploadDialog.scss";

type Props = {
  imageSrc: string;
  onClose: () => void;
  onUploaded: (user: AuthUser) => void;
};

export function AvatarUploadDialog({ imageSrc, onClose, onUploaded }: Props) {
  const { accessToken } = useAuth();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const onSave = async () => {
    if (!croppedArea) return;
    setBusy(true);
    setError(null);

    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea, 512, "image/jpeg", 0.92);
      const form = new FormData();
      form.append("file", blob, "avatar.jpg");

      const res = await fetch(`${apiBaseUrl}/users/me/avatar`, {
        method: "POST",
        body: form,
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message =
          (data && typeof data === "object" && "message" in data
            ? Array.isArray((data as { message: unknown }).message)
              ? ((data as { message: string[] }).message.join(", ") as string)
              : String((data as { message: unknown }).message)
            : res.statusText) || `Upload failed (${res.status})`;
        throw new ApiError(res.status, message, data);
      }

      const updated = (await res.json()) as AuthUser;
      onUploaded(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="avatar-upload" role="dialog" aria-modal="true" aria-labelledby="avatar-upload-title">
      <div className="avatar-upload__backdrop" onClick={busy ? undefined : onClose} />
      <div className="avatar-upload__panel">
        <header className="avatar-upload__head">
          <h2 id="avatar-upload-title">Crop avatar</h2>
          <p>Drag to position. Use the slider or scroll to zoom.</p>
        </header>

        <div className="avatar-upload__stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <label className="avatar-upload__zoom">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        {error ? (
          <p className="avatar-upload__error" role="alert">
            {error}
          </p>
        ) : null}

        <footer className="avatar-upload__actions">
          <button
            type="button"
            className="avatar-upload__cancel"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="avatar-upload__save"
            onClick={onSave}
            disabled={busy || !croppedArea}
          >
            {busy ? "Uploading…" : "Save avatar"}
          </button>
        </footer>
      </div>
    </div>
  );
}
