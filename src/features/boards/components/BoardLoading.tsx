// Libraries
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function BoardLoading() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const dots = dotRefs.current.filter(Boolean);
    if (!dots.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
      );

      gsap.to(dots, {
        y: -12,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-60 flex-col items-center justify-center gap-6"
    >
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dotRefs.current[i] = el;
            }}
            className="size-4 rounded-full bg-primary"
          />
        ))}
      </div>
      <p className="text-lg text-neutral-dark/70">Cargando tablero&hellip;</p>
    </div>
  );
}
