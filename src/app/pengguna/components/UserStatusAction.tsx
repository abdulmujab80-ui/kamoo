"use client";

import {
  Loader2,
  Power,
  PowerOff,
} from "lucide-react";

import { useRouter } from "next/navigation";
import {
  useState,
  useTransition,
} from "react";

import { toggleUserStatus } from "../actions";

export default function UserStatusAction({
  userId,
  nama,
  aktif,
  compact = false,
}: {
  userId: string;
  nama: string;
  aktif: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    const actionLabel = aktif
      ? "menonaktifkan"
      : "mengaktifkan";

    const confirmed = window.confirm(
      `Yakin ingin ${actionLabel} akun ${nama}?`
    );

    if (!confirmed) return;

    setError("");

    startTransition(async () => {
      const result = await toggleUserStatus(userId);

      if (!result.success) {
        setError(
          result.error ?? "Status akun gagal diubah."
        );
        return;
      }

      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        title={aktif ? "Nonaktifkan akun" : "Aktifkan akun"}
        className={`
          inline-flex items-center justify-center gap-2 rounded-xl
          border text-sm font-semibold transition
          disabled:cursor-not-allowed disabled:opacity-50
          ${compact ? "h-10 w-10" : "px-4 py-2.5"}
          ${
            aktif
              ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }
        `}
      >
        {pending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : aktif ? (
          <PowerOff size={16} />
        ) : (
          <Power size={16} />
        )}

        {!compact && (
          aktif ? "Nonaktifkan" : "Aktifkan"
        )}
      </button>

      {error && (
        <p className="mt-2 max-w-xs text-xs leading-5 text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
