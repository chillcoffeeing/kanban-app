import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AnimationDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealOptions {
  y?: number;
  x?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  toggleActions?: string;
  once?: boolean;
}

interface MountOptions {
  duration?: number;
  delay?: number;
  direction?: AnimationDirection;
  distance?: number;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {},
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 60,
      opacity = 0,
      duration = 0.8,
      delay = 0,
      stagger = 0,
      start = "top 85%",
      once = true,
    } = options;

    gsap.set(el, { y, opacity, visibility: "visible" });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start,
        once,
        onEnter: () => {
          setIsVisible(true);
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration,
            delay,
            ease: "power3.out",
          });
        },
        onLeave: () => {
          if (!once) {
            gsap.to(el, { y, opacity, duration: 0.3 });
          }
        },
        onEnterBack: () => {
          if (!once) {
            gsap.to(el, { y: 0, opacity: 1, duration, ease: "power3.out" });
          }
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

export function useStaggerFade<T extends HTMLElement>(
  options: ScrollRevealOptions = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      y = 30,
      opacity = 0,
      duration = 0.6,
      stagger = 0.08,
      delay = 0,
      start = "top 85%",
      once = true,
    } = options;

    const children = Array.from(el.children) as HTMLElement[];
    gsap.set(children, { y, opacity, visibility: "visible" });

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start,
        once,
        onEnter: () => {
          gsap.to(children, {
            y: 0,
            opacity: 1,
            duration,
            delay,
            stagger,
            ease: "power2.out",
          });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

export function useMountFade<T extends HTMLElement>(
  options: MountOptions = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      duration = 0.7,
      delay = 0,
      direction = "up",
      distance = 40,
    } = options;

    const vars: gsap.TweenVars = {
      opacity: 1,
      duration,
      delay,
      ease: "power2.out",
    };

    if (direction === "up") vars.y = 0;
    if (direction === "down") vars.y = 0;
    if (direction === "left") vars.x = 0;
    if (direction === "right") vars.x = 0;

    gsap.set(el, {
      opacity: 0,
      ...(direction === "up" && { y: distance }),
      ...(direction === "down" && { y: -distance }),
      ...(direction === "left" && { x: distance }),
      ...(direction === "right" && { x: -distance }),
      visibility: "visible",
    });

    const ctx = gsap.context(() => {
      gsap.to(el, vars);
    });

    return () => ctx.revert();
  }, []);

  return ref;
}

export function useCountUp(
  target: number,
  options: { duration?: number; suffix?: string } = {},
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { duration = 2, suffix = "" } = options;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            el,
            { textContent: 0 },
            {
              textContent: target,
              duration,
              ease: "power2.out",
              snap: { textContent: 1 },
              onUpdate: () => {
                el!.textContent = `${Math.round(Number(el!.textContent))}${suffix}`;
              },
            },
          );
        },
      });
    });

    return () => ctx.revert();
  }, [target]);

  return ref;
}

export function useScaleIn<T extends HTMLElement>(options: { delay?: number; duration?: number } = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { delay = 0, duration = 0.5 } = options;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: 0.9, opacity: 0, visibility: "visible" },
        { scale: 1, opacity: 1, duration, delay, ease: "back.out(1.7)" },
      );
    });

    return () => ctx.revert();
  }, []);

  return ref;
}
