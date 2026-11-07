type Tab<T extends string> = { value: T; label: string };

type TabsProps<T extends string> = {
  tabs: Tab<T>[];
  active: T;
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" className="mb-4 flex gap-1 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === active}
          onClick={() => onChange(tab.value)}
          className={`-mb-px border-b-2 px-3 py-2 text-sm ${
            tab.value === active
              ? "border-slate-800 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
