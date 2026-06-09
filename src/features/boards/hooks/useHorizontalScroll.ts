import { useRef, useEffect, useState, useCallback } from "react";

interface UseHorizontalScrollOptions {
  wheelSensitivity?: number;
  enableDragScroll?: boolean;
  enableTouchSwipe?: boolean;
  preventDragSelector?: string;
}

interface UseHorizontalScrollReturn {
  scrollRef: (node: HTMLDivElement | null) => void;
}

export function useHorizontalScroll(
  options: UseHorizontalScrollOptions = {},
): UseHorizontalScrollReturn {
  const {
    wheelSensitivity = 1,
    enableDragScroll = true,
    enableTouchSwipe = true,
    preventDragSelector = "[data-no-drag], [data-dnd-draggable], button, a, input, select, textarea, [role=button]",
  } = options;

  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const scrollRef = useCallback((node: HTMLDivElement | null) => {
    setEl(node);
  }, []);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const touchStartX = useRef(0);
  const touchScrollLeft = useRef(0);
  const isTouchActive = useRef(false);

  useEffect(() => {
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (
        (e.deltaY < 0 && el.scrollLeft <= 0) ||
        (e.deltaY > 0 && el.scrollLeft >= maxScroll)
      )
        return;

      e.preventDefault();
      const delta = e.deltaMode === 0 ? e.deltaY : e.deltaY * 16;
      el.scrollLeft += delta * wheelSensitivity;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheelSensitivity, el]);

  useEffect(() => {
    if (!enableDragScroll || !el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (
        e.target instanceof HTMLElement &&
        e.target.closest(preventDragSelector)
      )
        return;
      e.preventDefault();
      isDragging.current = true;
      const rect = el.getBoundingClientRect();
      dragStartX.current = e.clientX - rect.left;
      dragScrollLeft.current = el.scrollLeft;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      el.scrollLeft = dragScrollLeft.current + (dragStartX.current - x);
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("blur", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("blur", onMouseUp);
    };
  }, [enableDragScroll, preventDragSelector, el]);

  useEffect(() => {
    if (!enableTouchSwipe || !el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest(preventDragSelector)
      ) {
        isTouchActive.current = false;
        return;
      }
      isTouchActive.current = true;
      touchStartX.current = e.touches[0].pageX;
      touchScrollLeft.current = el.scrollLeft;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchActive.current) return;
      el.scrollLeft =
        touchScrollLeft.current + (touchStartX.current - e.touches[0].pageX);
    };

    const onTouchEnd = () => {
      isTouchActive.current = false;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [enableTouchSwipe, preventDragSelector, el]);

  return { scrollRef };
}
