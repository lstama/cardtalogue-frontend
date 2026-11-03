import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

export function useClickOutside<T extends HTMLDivElement>(
  onOutsideClick: () => void
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onOutsideClick]);

  return ref as RefObject<T>;
}
