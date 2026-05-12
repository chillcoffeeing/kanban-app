import { useRef, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Modal } from "@/shared/components/Modal";
import {
  KanbanIcon,
  SquaresFour,
  Cards,
  ArrowsLeftRight,
  UsersThree,
  GearSix,
  Bell,
  MagnifyingGlass,
  Tag,
  ListChecks,
  Sparkle,
  ArrowDown,
  PlusCircle,
  Handshake,
  CheckCircle,
  MagnifyingGlassPlus,
} from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

/* ─── Reusable scroll-reveal hook ─── */
function useScrollReveal(
  selector: string,
  options?: {
    y?: number;
    x?: number;
    scale?: number;
    rotate?: number;
    stagger?: number;
    start?: string;
    duration?: number;
    ease?: string;
  },
) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = selector
      ? el.querySelectorAll<HTMLElement>(selector)
      : [el];
    if (!items.length) return;

    const fromVars: gsap.TweenVars = { opacity: 0 };
    if (options?.y !== undefined) fromVars.y = options.y;
    if (options?.x !== undefined) fromVars.x = options.x;
    if (options?.scale !== undefined) fromVars.scale = options.scale;
    if (options?.rotate !== undefined) fromVars.rotate = options.rotate;

    const ctx = gsap.context(() => {
      gsap.fromTo(items, fromVars, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotate: 0,
        duration: options?.duration ?? 0.9,
        ease: options?.ease ?? "power3.out",
        stagger: options?.stagger ?? 0,
        scrollTrigger: {
          trigger: el,
          start: options?.start ?? "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [selector, options?.y, options?.x, options?.scale, options?.rotate, options?.stagger, options?.start, options?.duration, options?.ease]);

  return ref;
}

/* ─── Section title component ─── */
function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const ref = useScrollReveal("", { y: 30, start: "top 85%" });
  return (
    <div ref={ref} className="mb-16 text-center">
      <h2 className="mb-4 text-5xl font-bold text-neutral-dark">{title}</h2>
      {subtitle && (
        <p className="mx-auto max-w-2xl text-xl text-neutral-dark/60">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      el.addEventListener("mouseenter", () => {
        gsap.to(el.querySelector(".feature-icon"), {
          scale: 1.15,
          rotate: 5,
          duration: 0.3,
          ease: "power2.out",
        });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el.querySelector(".feature-icon"), {
          scale: 1,
          rotate: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="group rounded-2xl border border-neutral-light bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="feature-icon mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-dark">{title}</h3>
      <p className="text-base leading-relaxed text-neutral-dark/70">{desc}</p>
    </div>
  );
}

/* ─── Mockup frame ─── */
function Mockup({ src, label, onZoom }: { src: string; label: string; onZoom: () => void }) {
  return (
    <div className="group relative cursor-pointer" onClick={onZoom}>
      <div className="relative overflow-hidden rounded-2xl border border-neutral-light bg-surface shadow-lg transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-xl">
        <img
          src={src}
          alt={label}
          className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-dark/0 transition-all duration-300 group-hover:bg-neutral-dark/30">
          <div className="scale-50 rounded-full bg-surface/90 p-3 text-primary opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <MagnifyingGlassPlus size={22} weight="bold" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-base font-medium text-neutral-dark/60">
        {label}
      </p>
    </div>
  );
}

/* ─── Animated lines background ─── */
function LinesBg({ count = 4 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const lines = Array.from({ length: count }).map((_, i) => ({
      amplitude: 16 + Math.random() * 36,
      frequency: 0.004 + Math.random() * 0.012,
      speed: (0.2 + Math.random() * 0.4) * (i % 2 === 0 ? 1 : -1),
      yOffset: (canvas.height / devicePixelRatio / (count + 1)) * (i + 1),
      thickness: 1.5 + Math.random() * 2,
      alpha: 0.06 + Math.random() * 0.08,
      hue: i % 2 === 0 ? 239 : 217,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;
    const draw = () => {
      time += 0.015;
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      ctx.lineCap = "round";

      for (const line of lines) {
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, `hsla(${line.hue}, 65%, 60%, 0)`);
        gradient.addColorStop(0.08, `hsla(${line.hue}, 65%, 60%, ${line.alpha})`);
        gradient.addColorStop(0.92, `hsla(${line.hue}, 65%, 60%, ${line.alpha})`);
        gradient.addColorStop(1, `hsla(${line.hue}, 65%, 60%, 0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = line.thickness;

        ctx.beginPath();
        const startY = line.yOffset + Math.sin(line.phase) * line.amplitude;
        ctx.moveTo(-80, startY);

        for (let x = -80; x <= w + 80; x += 2) {
          const y =
            line.yOffset +
            Math.sin(x * line.frequency + time * line.speed + line.phase) *
              line.amplitude;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/* ─── Scroll-triggered counter ─── */
function GsapCounter({
  target,
  suffix = "",
  label,
}: {
  target: number;
  suffix?: string;
  label: string;
}) {
  const numRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = numRef.current;
    const trigger = triggerRef.current;
    if (!el || !trigger) return;

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: target,
      duration: 2.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
      onUpdate: () => {
        el.textContent = Math.floor(obj.val) + suffix;
      },
    });

    return () => { tween.kill(); };
  }, [target, suffix]);

  return (
    <div ref={triggerRef} className="text-center">
      <div ref={numRef} className="text-6xl font-bold text-primary md:text-7xl lg:text-8xl">
        0{suffix}
      </div>
      <div className="mt-2 text-base text-neutral-dark/60">{label}</div>
    </div>
  );
}

/* ─── Hero particles canvas ─── */
function ParticlesBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number; r: number; alpha: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.25 + 0.03,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/* ─── LANDING PAGE ─── */
export function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [selectedImage, setSelectedImage] = useState<{ src: string; label: string } | null>(null);

  /* ── Hero entrance (mount, no ScrollTrigger) ── */
  const heroRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-hero]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  /* ── Section reveal refs ── */
  const featuresRef = useScrollReveal("[data-card]", {
    y: 40,
    scale: 0.92,
    stagger: 0.07,
    start: "top 80%",
  });
  const mockupsRef = useScrollReveal("[data-mockup]", {
    y: 50,
    scale: 0.95,
    stagger: 0.1,
    start: "top 80%",
  });
  const stepsRef = useScrollReveal("[data-step]", {
    y: 40,
    stagger: 0.15,
    start: "top 80%",
  });
  const techRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = techRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-tech]");
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      cards.forEach((card, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        const items = card.querySelectorAll("li");

        tl.fromTo(
          card,
          {
            opacity: 0,
            y: 60,
            x: dir * 40,
            scale: 0.85,
          },
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            duration: 0.7,
            ease: "none",
          },
          "-=0.15",
        );

        if (items.length) {
          tl.fromTo(
            items,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.05,
              ease: "power2.out",
            },
            "-=0.3",
          );
        }
      });
    }, el);

    return () => ctx.revert();
  }, []);

  /* ── Refresh ScrollTrigger after all layout effects ── */
  useLayoutEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  const features = [
    {
      icon: <SquaresFour size={24} weight="duotone" />,
      title: "Tableros Visuales",
      desc: "Crea múltiples tableros con fondos personalizables. Organiza proyectos personales o de equipo con una vista clara y ordenada.",
    },
    {
      icon: <Cards size={24} weight="duotone" />,
      title: "Tarjetas enriquecidas",
      desc: "Añade descripciones, checklist con progreso, etiquetas de colores, fechas de inicio y vencimiento, y miembros asignados.",
    },
    {
      icon: <ArrowsLeftRight size={24} weight="duotone" />,
      title: "Drag & Drop fluido",
      desc: "Arrastra tarjetas entre etapas o reordena dentro de la misma columna. La posición se guarda automáticamente en el servidor.",
    },
    {
      icon: <UsersThree size={24} weight="duotone" />,
      title: "Colaboración en equipo",
      desc: "Invita miembros por email, asigna roles y configura permisos granulares para cada acción del tablero.",
    },
    {
      icon: <GearSix size={24} weight="duotone" />,
      title: "Personalización total",
      desc: "Temas claro, oscuro, midnight y solarized. Densidad compacta o cómoda. Fondos con patrones configurables.",
    },
    {
      icon: <Bell size={24} weight="duotone" />,
      title: "Actividad en tiempo real",
      desc: "Feed de actividad en vivo con Socket.IO. Ve quién creó, movió o actualizó qué, y cuándo, al instante.",
    },
    {
      icon: <MagnifyingGlass size={24} weight="duotone" />,
      title: "Búsqueda global",
      desc: "Encuentra cualquier tarjeta por título, descripción, etiquetas, miembros o contenido del checklist.",
    },
    {
      icon: <Tag size={24} weight="duotone" />,
      title: "Etiquetas y filtros",
      desc: "Crea etiquetas con nombre y color para categorizar tarjetas. Filtra visualmente por tipo o prioridad.",
    },
    {
      icon: <ListChecks size={24} weight="duotone" />,
      title: "Checklists inteligentes",
      desc: "Checklists con progreso visual, items reordenables y marcado completado. El progreso se muestra en la tarjeta.",
    },
  ];

  const mockups = [
    { src: "/assets/images/kanban-app-login.png", label: "Pantalla de inicio de sesión y registro" },
    { src: "/assets/images/kanban-app-boards.png", label: "Galería de tableros" },
    { src: "/assets/images/kanban-app-board.png", label: "Tablero Kanban con columnas y tarjetas" },
    { src: "/assets/images/kanban-app-card.png", label: "Detalle de tarjeta con checklist y etiquetas" },
    { src: "/assets/images/kanban-app-activity-panel.png", label: "Panel de actividad del tablero" },
    { src: "/assets/images/kanban-app-settings.png", label: "Configuración de usuario (apariencia)" },
    { src: "/assets/images/kanban-app-board-config.png", label: "Configuración general del tablero" },
    { src: "/assets/images/kanban-app-board-settings.png", label: "Gestión de miembros y permisos" },
  ];

  const steps = [
    {
      icon: <PlusCircle size={28} weight="duotone" />,
      title: "Crea un tablero",
      desc: "Define las columnas de tu flujo de trabajo: Pendiente, En Progreso, Completado. Personaliza el fondo y las preferencias.",
    },
    {
      icon: <Cards size={28} weight="duotone" />,
      title: "Añade tarjetas",
      desc: "Crea tarjetas con descripciones, checklist, etiquetas, fechas y miembros. Arrastra para reordenar entre columnas.",
    },
    {
      icon: <Handshake size={28} weight="duotone" />,
      title: "Colabora en vivo",
      desc: "Invita a tu equipo, asigna permisos, y ve los cambios reflejarse en tiempo real gracias a Socket.IO.",
    },
  ];

  const techGroups = [
    { title: "Frontend", items: ["React 19", "TypeScript", "Vite 8", "Tailwind CSS 4", "Zustand 6", "dnd-kit"] },
    { title: "Backend", items: ["NestJS 10", "TypeScript", "Prisma 7", "PostgreSQL", "Socket.IO", "Passport JWT"] },
    { title: "Infraestructura", items: ["Node.js", "Render", "Resend", "Swagger", "Helmet"] },
    { title: "Calidad", items: ["ESLint", "Vitest", "Supertest", "Pino Logger", "Rate Limiting", "Zod Validation"] },
  ];

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <LinesBg count={5} />
        <ParticlesBg />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-info/10 via-transparent to-transparent" />
        <div ref={heroRef} className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <div
            data-hero
            className="mb-6 inline-flex animate-bounce items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary sm:px-5 sm:py-2 sm:text-base"
            style={{ animationDuration: "3s" }}
          >
            <Sparkle size={16} weight="duotone" />
            Plataforma Kanban moderna y open-source
          </div>
          <h1
            data-hero
            className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-neutral-dark sm:mb-6 sm:text-6xl md:text-8xl"
          >
            Organiza tu flujo de trabajo{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              en tiempo real
            </span>
          </h1>
          <p
            data-hero
            className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-neutral-dark/60 sm:mb-10 sm:text-xl md:text-2xl"
          >
            Una aplicación Kanban completa con tableros colaborativos, tarjetas
            con checklist y etiquetas, drag & drop en tiempo real, y gestión de
            miembros con permisos granulares.
          </p>
          <div data-hero className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <button
                className="w-full cursor-pointer rounded-xl bg-primary px-10 py-4 text-lg font-semibold text-primary-fg shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
                onClick={() => navigate("/boards")}
              >
                Ir a mis tableros
              </button>
            ) : (
              <>
                <button
                  className="w-full cursor-pointer rounded-xl bg-primary px-10 py-4 text-lg font-semibold text-primary-fg shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
                  onClick={() => navigate("/login")}
                >
                  Comenzar gratis
                </button>
                <button
                  className="w-full cursor-pointer rounded-xl border border-neutral-light bg-surface px-10 py-4 text-lg font-semibold text-neutral-dark shadow-sm transition-all hover:bg-neutral-light-hover hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
                  onClick={() => {
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ver funcionalidades
                </button>
              </>
            )}
          </div>
          <div
            data-hero
            className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-neutral-dark/30"
          >
            <ArrowDown size={24} />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section
        id="features"
        className="relative overflow-hidden bg-surface px-6 py-24"
      >
        <LinesBg count={5} />
        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            title="Todo lo que necesitas para gestionar proyectos"
            subtitle="Desde la planificación hasta la ejecución, Kanban Platform te da las herramientas para mantener tu equipo sincronizado."
          />
          <div
            ref={featuresRef}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((f) => (
              <div key={f.title} data-card>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCREENSHOTS ─── */}
      <section
        id="screenshots"
        className="relative overflow-hidden px-6 py-24"
      >
        <LinesBg count={3} />
        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            title="¿Cómo se ve?"
          />
          <div ref={mockupsRef} className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {mockups.map((mockup) => (
              <div key={mockup.label} data-mockup>
                <Mockup src={mockup.src} label={mockup.label} onZoom={() => setSelectedImage(mockup)} />
              </div>
            ))}
          </div>
        </div>

        <Modal isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} size="2xl">
          {selectedImage && (
            <div>
              <img
                src={selectedImage.src}
                alt={selectedImage.label}
                className="w-full rounded-lg"
              />
              <p className="mt-4 text-center text-base text-neutral-dark/60">
                {selectedImage.label}
              </p>
            </div>
          )}
        </Modal>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative overflow-hidden bg-surface px-6 py-24">
        <LinesBg count={4} />
        <div className="relative mx-auto max-w-5xl">
          <SectionTitle
            title="Estadísticas"
            subtitle="Algunos números del proyecto."
          />
          <div className="rounded-3xl border border-neutral-light/60 bg-surface/50 px-6 py-12 shadow-sm backdrop-blur-sm sm:px-12 sm:py-16">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <GsapCounter target={14} label="Modelos de datos" />
              <GsapCounter target={30} suffix="+" label="Endpoints API" />
              <GsapCounter target={4} label="Temas visuales" />
              <GsapCounter target={2} label="Idiomas soportados" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative overflow-hidden px-6 py-24">
        <LinesBg count={4} />
        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            title="Cómo funciona"
            subtitle="En tres pasos simples."
          />
          <div
            ref={stepsRef}
            className="relative grid gap-8 md:grid-cols-3"
          >
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-0.5 bg-gradient-to-r from-primary/20 via-info/20 to-primary/20 md:block" />
            {steps.map((item) => (
              <div
                key={item.title}
                data-step
                className="relative rounded-2xl border border-neutral-light bg-surface p-8 shadow-sm"
              >
                <div className="relative z-10 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-info text-2xl font-black text-white shadow-lg shadow-primary/20">
                  {item.icon}
                </div>
                <h3 className="relative z-10 mb-3 text-2xl font-bold text-neutral-dark">
                  {item.title}
                </h3>
                <p className="relative z-10 text-base leading-relaxed text-neutral-dark/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="relative overflow-hidden bg-surface px-6 py-24">
        <LinesBg count={4} />
        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            title="Stack Tecnológico"
            subtitle="Construido con tecnologías modernas y robustas."
          />
          <div
            ref={techRef}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {techGroups.map((group) => (
              <div
                key={group.title}
                data-tech
                className="rounded-2xl border border-neutral-light bg-surface p-6 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <h3 className="mb-4 text-xl font-semibold text-primary">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-base text-neutral-dark/70"
                    >
                      <CheckCircle
                        size={14}
                        weight="fill"
                        className="shrink-0 text-success"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section id="cta" className="relative overflow-hidden px-6 pb-32 pt-16">
        <LinesBg count={3} />
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-info px-6 py-12 text-center shadow-xl sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_white)] opacity-10" />
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 animate-pulse rounded-full bg-white/5 blur-xl" style={{ animationDuration: "4s" }} />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-52 w-52 animate-pulse rounded-full bg-white/5 blur-xl" style={{ animationDuration: "5s" }} />
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-5xl">
              ¿Listo para empezar?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-lg text-white/80 sm:mb-10 sm:text-xl">
              Regístrate gratis y comienza a organizar tus proyectos en
              minutos. Sin tarjeta de crédito.
            </p>
            {isAuthenticated ? (
              <button className="w-full cursor-pointer rounded-xl bg-white px-10 py-4 text-lg font-semibold text-primary shadow-lg transition-all hover:shadow-xl hover:brightness-95 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto" onClick={() => navigate("/boards")}>
                Ir a mis tableros
              </button>
            ) : (
              <button className="w-full cursor-pointer rounded-xl bg-white px-10 py-4 text-lg font-semibold text-primary shadow-lg transition-all hover:shadow-xl hover:brightness-95 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto" onClick={() => navigate("/login")}>
                Crear cuenta gratuita
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-neutral-light bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-6 py-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <KanbanIcon
              size={20}
              weight="duotone"
              className="text-primary"
            />
            <span className="text-base font-semibold text-neutral-dark">
              Kanban Platform
            </span>
          </div>
          <p className="text-sm text-neutral-dark/40 md:text-base">
            &copy; {new Date().getFullYear()} — Proyecto open-source
          </p>
        </div>
      </footer>
    </div>
  );
}
