"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Link2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getStoredFile } from "../services/id-insurance-service";
import { identityTitle, maskedNumber } from "../utils";
import type { IdentityDocument, InsurancePolicy, StoredFileMeta } from "../schema";

interface KitProps {
  profileName: string;
  identityDocs: IdentityDocument[];
  policies: InsurancePolicy[];
}

interface KitItem {
  key: string;
  title: string;
  subtitle: string | null;
  files: StoredFileMeta[];
  identity: boolean;
}

interface Status {
  tone: "" | "success" | "error";
  message: string;
}

export function HospitalKitDialog({
  open,
  onClose,
  profileName,
  identityDocs,
  policies,
}: KitProps & { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={`Hospital Kit for ${profileName}`}
      description="Choose the documents to share with the hospital."
    >
      <HospitalKit
        profileName={profileName}
        identityDocs={identityDocs}
        policies={policies}
        onDone={onClose}
      />
    </Dialog>
  );
}

function HospitalKit({ profileName, identityDocs, policies, onDone }: KitProps & { onDone: () => void }) {
  const items: KitItem[] = [
    ...policies.map((p) => ({
      key: `ins-${p.id}`,
      title: `${p.insurer} insurance`,
      subtitle: `Policy ${p.policyNumber}`,
      files: p.files,
      identity: false,
    })),
    ...identityDocs.map((d) => ({
      key: `id-${d.id}`,
      title: identityTitle(d),
      subtitle: maskedNumber(d),
      files: d.files,
      identity: true,
    })),
  ].filter((item) => item.files.length > 0);

  // Insurance is pre-selected; identity documents are never included automatically.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(items.filter((i) => !i.identity).map((i) => i.key))
  );
  const [loadedFiles, setLoadedFiles] = useState<Record<string, File> | null>(null);
  const [status, setStatus] = useState<Status>({ tone: "", message: "" });

  // Load files up front: navigator.share() must run right after the click,
  // and waiting for IndexedDB inside the click handler can lose that permission.
  useEffect(() => {
    const allFiles = items.flatMap((i) => i.files);
    Promise.all(allFiles.map((f) => getStoredFile(f.id))).then((blobs) => {
      const map: Record<string, File> = {};
      allFiles.forEach((meta, index) => {
        const blob = blobs[index];
        if (blob) map[meta.id] = new File([blob], meta.name, { type: meta.type });
      });
      setLoadedFiles(map);
    });
    // items are derived from props that don't change while the dialog is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const selectedFiles = loadedFiles
    ? items
        .filter((i) => selected.has(i.key))
        .flatMap((i) => i.files.map((f) => loadedFiles[f.id]))
        .filter((file): file is File => file !== undefined)
    : [];

  async function handleSend() {
    if (navigator.canShare?.({ files: selectedFiles })) {
      try {
        await navigator.share({ files: selectedFiles, title: `Hospital documents – ${profileName}` });
        setStatus({ tone: "success", message: "Shared." });
      } catch (error) {
        // AbortError = the user closed the share sheet; that's not a failure.
        if (!(error instanceof Error && error.name === "AbortError")) {
          setStatus({ tone: "error", message: "Sharing failed. Try downloading instead." });
        }
      }
      return;
    }
    // Fallback (most desktop browsers): download the files.
    for (const file of selectedFiles) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }
    setStatus({
      tone: "success",
      message: "This browser can't share files directly, so they were downloaded instead.",
    });
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Add an ID document or an insurance policy with files to build a Hospital Kit.
        </p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onDone}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ul className="space-y-2">
        <li className="flex min-h-11 items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted">
          <input type="checkbox" disabled className="size-4" aria-label="Emergency card" />
          <span className="flex-1">Emergency card</span>
          <span className="text-xs">Coming with Emergency Center</span>
        </li>
        {items.map((item) => (
          <li key={item.key}>
            <label
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2",
                selected.has(item.key) ? "border-primary bg-primary-soft" : "border-border"
              )}
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={selected.has(item.key)}
                onChange={() => toggle(item.key)}
              />
              <span className="flex-1">
                <span className="block text-sm font-medium">{item.title}</span>
                {item.subtitle && <span className="block text-xs text-muted">{item.subtitle}</span>}
              </span>
              <span className="text-xs text-muted">
                {item.files.length} {item.files.length === 1 ? "file" : "files"}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4 opacity-60">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Link2 className="size-4" aria-hidden="true" /> Secure link &amp; QR
          </p>
          <p className="mt-1 text-xs text-muted">
            Expiring, view-only, revocable, every opening logged. Available once cloud storage is
            set up.
          </p>
          <Button variant="secondary" disabled className="mt-3 w-full">
            Create link
          </Button>
        </div>

        <div className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Send className="size-4" aria-hidden="true" /> Send files directly
          </p>
          <p className="mt-1 flex gap-1.5 text-xs text-amber-700">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
            Files sent this way (e.g. on WhatsApp) can&apos;t be revoked.
          </p>
          <Button
            className="mt-3 w-full"
            onClick={handleSend}
            disabled={!loadedFiles || selectedFiles.length === 0}
          >
            {loadedFiles
              ? `Send ${selectedFiles.length} ${selectedFiles.length === 1 ? "file" : "files"}`
              : "Preparing…"}
          </Button>
        </div>
      </div>

      {status.message && (
        <p
          role="status"
          className={status.tone === "error" ? "text-sm text-danger" : "text-sm text-primary"}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
