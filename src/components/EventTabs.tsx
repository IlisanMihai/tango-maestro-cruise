import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export interface EventTab {
  value: string;
  label: string;
  href: string;
}

/** Text tabs with an orange underline that slides to the selected tab. */
const EventTabs = ({ tabs, selected, label }: { tabs: EventTab[]; selected: string; label: string }) => {
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  // Re-measure when the selection or the labels (language) change.
  const labels = tabs.map((tab) => tab.label).join("|");

  useLayoutEffect(() => {
    const measure = () => {
      const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active) return;
      const next = { left: active.offsetLeft, width: active.offsetWidth };
      setIndicator((prev) => (prev?.left === next.left && prev.width === next.width ? prev : next));
    };
    measure();
    // Labels change width with the language and font loading.
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [selected, labels]);

  return (
    <nav ref={navRef} aria-label={label} className="relative flex gap-6">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          to={tab.href}
          replace
          aria-current={tab.value === selected ? "page" : undefined}
          className={`border-b-2 border-transparent pb-1 font-body text-base transition-colors ${
            tab.value === selected ? "text-parchment" : "text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
      {indicator && (
        <span
          data-testid="tab-indicator"
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </nav>
  );
};

export default EventTabs;
