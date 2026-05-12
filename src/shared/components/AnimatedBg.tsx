import { useRef, useLayoutEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";

function LinesCanvas() {
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

    const lines = Array.from({ length: 5 }).map((_, i) => ({
      amplitude: 12 + Math.random() * 28,
      frequency: 0.003 + Math.random() * 0.01,
      speed: (0.15 + Math.random() * 0.3) * (i % 2 === 0 ? 1 : -1),
      yOffset: ((i + 1) / 6) * (canvas.height / devicePixelRatio),
      thickness: 1 + Math.random() * 1.5,
      alpha: 0.04 + Math.random() * 0.06,
      hue: i % 2 === 0 ? 239 : 217,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;
    const draw = () => {
      time += 0.01;
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      for (const line of lines) {
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, `hsla(${line.hue}, 60%, 55%, 0)`);
        gradient.addColorStop(0.1, `hsla(${line.hue}, 60%, 55%, ${line.alpha})`);
        gradient.addColorStop(0.9, `hsla(${line.hue}, 60%, 55%, ${line.alpha})`);
        gradient.addColorStop(1, `hsla(${line.hue}, 60%, 55%, 0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = line.thickness;

        ctx.beginPath();
        ctx.moveTo(-80, line.yOffset);
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
  }, []);

  return (
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full" />
  );
}

function ParticlesCanvas() {
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
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.2 + 0.03,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(239, 60%, 55%, ${p.alpha})`;
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
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full" />
  );
}

function WavesCanvas() {
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

    const waves = Array.from({ length: 3 }).map((_, i) => ({
      amplitude: 20 + i * 15,
      frequency: 0.002 + i * 0.001,
      speed: 0.3 + i * 0.1,
      yCenter: (canvas.height / devicePixelRatio) * (0.5 + i * 0.15),
      alpha: 0.03 + i * 0.02,
      hue: [239, 217, 280][i],
    }));

    let time = 0;
    const draw = () => {
      time += 0.008;
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      for (const wave of waves) {
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 2) {
          const y =
            wave.yCenter +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, wave.yCenter - wave.amplitude, 0, h);
        gradient.addColorStop(0, `hsla(${wave.hue}, 60%, 55%, ${wave.alpha})`);
        gradient.addColorStop(1, `hsla(${wave.hue}, 60%, 55%, 0)`);
        ctx.fillStyle = gradient;
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
    <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full" />
  );
}

export function AnimatedBg() {
  const background = useSettingsStore((settings) => settings.background);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return null;

  switch (background) {
    case "lines":
      return <LinesCanvas />;
    case "particles":
      return <ParticlesCanvas />;
    case "waves":
      return <WavesCanvas />;
    default:
      return null;
  }
}
