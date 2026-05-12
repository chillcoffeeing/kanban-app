export const STATIC_BACKGROUNDS: { id: string; label: string }[] = [
  { id: "plain", label: "Plano" },
  { id: "dots", label: "Puntos" },
  { id: "grid", label: "Cuadrícula" },
];

export const ANIMATED_BACKGROUNDS: { id: string; label: string }[] = [
  { id: "lines", label: "Líneas" },
  { id: "particles", label: "Partículas" },
  { id: "waves", label: "Olas" },
];

export const BACKGROUNDS: { id: string; label: string }[] = [
  ...STATIC_BACKGROUNDS,
  ...ANIMATED_BACKGROUNDS,
];
