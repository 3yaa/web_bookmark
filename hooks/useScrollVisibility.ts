import { useState, useEffect, useRef } from "react";

export function useScrollVisibility(threshold = 10) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Show buttons when scrolling up or at the top
          if (
            currentScrollY < lastScrollY.current ||
            currentScrollY < threshold
          ) {
            setIsVisible(true);
          }
          // Hide buttons when scrolling down
          else if (
            currentScrollY > lastScrollY.current &&
            currentScrollY > threshold
          ) {
            setIsVisible(false);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isVisible;
}
