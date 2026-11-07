import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Card({ title, actions, children }: CardProps) {
  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
