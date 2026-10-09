import { useEffect, useRef, useState } from "react";

/** True while the page is at the top or scrolling up; false while scrolling down. */
export function useShowOnScrollUp(enabled = true) {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const onScroll = () => {
      const y = window.scrollY;
      // Ignore tiny moves (and iOS bounce) so the bar does not flicker.
      if (Math.abs(y - lastY.current) < 4 && y > 0) return;
      setVisible(y < lastY.current || y <= 0);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);

  return visible;
}
