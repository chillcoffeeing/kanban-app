import { useRef, useCallback, useEffect } from "react";

function isInteractiveElement(element: HTMLElement): boolean {
  return !!element.closest(
    [
      "button",
      "input",
      "textarea",
      "select",
      "a[href]",
      '[role="button"]',
      "[data-dnd-draggable]",
      "[data-no-drag-scroll]",
    ].join(","),
  );
}

export function useDragScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDragging: false,
    startMouseX: 0,
    initialScrollLeft: 0,
  });

  const handleMouseDown = useCallback((mouseDownEvent: MouseEvent) => {
    if (isInteractiveElement(mouseDownEvent.target as HTMLElement)) return;

    const container = containerRef.current;
    if (!container) return;

    dragState.current = {
      isDragging: true,
      startMouseX: mouseDownEvent.pageX - container.offsetLeft,
      initialScrollLeft: container.scrollLeft,
    };

    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((mouseMoveEvent: MouseEvent) => {
    if (!dragState.current.isDragging) return;
    mouseMoveEvent.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const currentMouseX =
      mouseMoveEvent.pageX - container.offsetLeft;
    const pixelsScrolled =
      (currentMouseX - dragState.current.startMouseX) * 1.5;

    container.scrollLeft =
      dragState.current.initialScrollLeft - pixelsScrolled;
  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;

    const container = containerRef.current;
    if (!container) return;

    container.style.cursor = "";
    container.style.userSelect = "";
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return containerRef;
}
