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
          className={`-mb-px px-3 py-2 text-sm relative`}>
          {tab.label}
          <div className={`transition-discrete ease-in-out duration-300 h-0.5 bg-primary ${tab.value === active ? "w-[100%]" : "w-0"}`}/>
        </button>
      ))}
    </div>
  );
}
