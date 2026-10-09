import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useShowOnScrollUp } from "@/hooks/use-hide-on-scroll";
import { useLocalizedPath } from "@/i18n/useLocalizedPath";

/**
 * Top bar for inner pages: home link on the left, languages on the right.
 * Like the homepage language selector, it hides while scrolling down and comes
 * back when scrolling up. Its visible height is published as the CSS variable
 * --page-header-offset, so sticky elements below it (the event tabs) can sit under it.
 */
const PageHeader = () => {
  const { t } = useTranslation();
  const localize = useLocalizedPath();
  const visible = useShowOnScrollUp();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const height = ref.current?.offsetHeight ?? 0;
    root.style.setProperty("--page-header-offset", visible ? `${height}px` : "0px");
    return () => {
      root.style.removeProperty("--page-header-offset");
    };
  }, [visible]);

  return (
    <header
      ref={ref}
      className={`sticky top-0 z-40 border-b border-gold/10 bg-background/95 backdrop-blur-sm transition-all duration-300 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-content mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <Link
          to={localize("/")}
          className="flex items-center gap-2 font-display text-lg text-parchment hover:text-gold transition-colors"
        >
          <Home className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{t("nav.home")}</span>
          <span className="sr-only sm:hidden">{t("nav.home")}</span>
        </Link>
        <LanguageSelector floating={false} />
      </div>
    </header>
  );
};

export default PageHeader;
