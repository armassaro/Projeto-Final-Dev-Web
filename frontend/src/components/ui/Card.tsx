"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

type CardProps = {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Card({ title, actions, children }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="rounded border border-slate-200 bg-white">
      <motion.div
        className="overflow-hidden"
        initial={false}
        animate={{ height }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div ref={ref} className="p-4">
          {(title || actions) && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              {title && <h2 className="font-semibold">{title}</h2>}
              {actions}
            </div>
          )}
          {children}
        </div>
      </motion.div>
    </section>
  );
}
