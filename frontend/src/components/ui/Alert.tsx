import type { ReactNode } from "react";

const TONES = {
  success: "border-green-300 bg-green-50 text-green-800",
  error: "border-red-300 bg-red-50 text-red-800",
};

export function Alert({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return (
    <div role="alert" className={`rounded border px-3 py-2 text-sm ${TONES[tone]}`}>
      {children}
    </div>
  );
}
