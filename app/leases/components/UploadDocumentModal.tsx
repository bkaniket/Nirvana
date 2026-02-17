"use client";

import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
};

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onUpload,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!file) return;

    setSubmitting(true);
    await onUpload(file);
    setSubmitting(false);
    setFile(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Upload Document</h3>

        <input
          type="file"
          onChange={(e) =>
            setFile(e.target.files ? e.target.files[0] : null)
          }
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}