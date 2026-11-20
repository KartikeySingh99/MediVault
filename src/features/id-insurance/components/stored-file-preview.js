"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Eye, FileText } from "lucide-react";
import { getStoredFile } from "../services/id-insurance-service";

/**
 * Thumbnail for a stored file. Images stay blurred until the user taps to reveal,
 * so ID numbers aren't readable at a glance (e.g. over a shoulder).
 */
export function StoredFilePreview({ file }) {
  const [url, setUrl] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    let objectUrl;
    let cancelled = false;
    getStoredFile(file.id).then((blob) => {
      if (!blob || cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id]);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="relative flex h-24 items-center justify-center bg-slate-50">
        {isImage && url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- local blob URL, not optimizable */}
            <img
              src={url}
              alt={revealed ? file.name : ""}
              className={`h-full w-full object-cover transition ${revealed ? "" : "scale-110 blur-md"}`}
            />
            {!revealed && (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-900/20 text-xs font-medium text-white"
              >
                <Eye className="size-4" aria-hidden="true" /> Tap to view
              </button>
            )}
          </>
        ) : (
          <FileText className="size-8 text-slate-400" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="flex-1 truncate text-xs text-muted">{file.name}</span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1 text-primary hover:bg-primary-soft"
            aria-label={`Open ${file.name}`}
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
