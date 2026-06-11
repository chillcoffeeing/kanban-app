import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  KanbanIcon, ListIcon, XIcon,
} from "@phosphor-icons/react";
import { PUBLIC_THEME_KEY, THEME_OPTIONS } from "@/shared/utils/constants";

function getPublicTheme(): string {
  return localStorage.getItem(PUBLIC_THEME_KEY) || "light";
}

function setPublicTheme(id: string) {
  localStorage.setItem(PUBLIC_THEME_KEY, id);
  window.dispatchEvent(new Event("public-theme-change"));
}

const navLinks = [
  { section: "features", label: "Funcionalidades" },
  { section: "screenshots", label: "Capturas" },
];

export function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = useCallback(
    (sectionId: string) => {
      setMenuOpen(false);
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [location, navigate],
  );

  return (
    <header className="fixed top-0 z-50 w-full border-b border-neutral-light/80 bg-neutral-light/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <button
          className="flex cursor-pointer items-center gap-2"
          onClick={() => navigate("/")}
        >
          <KanbanIcon size={28} weight="duotone" className="text-primary" />
          <span className="text-xl font-bold text-neutral-dark">Kanban</span>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.section}
              onClick={() => scrollTo(link.section)}
              className="cursor-pointer text-base font-medium text-neutral-dark/70 transition-colors hover:text-primary"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              navigate("/register");
            }}
            className="cursor-pointer text-base font-medium text-neutral-dark/70 transition-colors hover:text-primary"
          >
            Comenzar
          </button>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="group relative">
            <button
              className="cursor-pointer rounded-lg p-2 text-neutral-dark/60 transition-colors hover:bg-neutral-light-hover hover:text-neutral-dark"
              aria-label="Cambiar tema"
            >
              {(() => {
                const current = THEME_OPTIONS.find((themeOption) => themeOption.id === getPublicTheme()) ?? THEME_OPTIONS[0];
                return <current.Icon size={20} />;
              })()}
            </button>
            <div className="invisible absolute right-0 top-full z-50 mt-1 w-44 origin-top-right scale-95 rounded-xl border border-neutral-light bg-surface p-1.5 opacity-0 shadow-lg transition-all group-hover:visible group-hover:scale-100 group-hover:opacity-100">
              {THEME_OPTIONS.map(({ id, label, Icon }) => {
                const active = getPublicTheme() === id;
                return (
                  <button
                    key={id}
                    onClick={() => setPublicTheme(id)}
                    className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-neutral-dark/70 hover:bg-neutral-light-hover"
                    }`}
                  >
                    <Icon size={18} weight={active ? "fill" : "duotone"} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {isAuthenticated ? (
            <button
              className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-base font-semibold text-primary-fg transition-all hover:bg-primary-hover hover:shadow-lg"
              onClick={() => navigate("/boards")}
            >
              Ir a la App
            </button>
          ) : (
            <>
              <button
                className="cursor-pointer rounded-lg px-5 py-2 text-base font-semibold text-neutral-dark transition-colors hover:bg-neutral-light-hover"
                onClick={() => navigate("/login")}
              >
                Iniciar Sesión
              </button>
              <button
                className="cursor-pointer rounded-lg bg-primary px-5 py-2 text-base font-semibold text-primary-fg transition-all hover:bg-primary-hover hover:shadow-lg"
                onClick={() => navigate("/register")}
              >
                Registrarse
              </button>
            </>
          )}
        </div>

        <button
          className="flex cursor-pointer items-center justify-center md:hidden"
          onClick={() => setMenuOpen((p) => !p)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-light/80 bg-surface px-6 py-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.section}
                onClick={() => scrollTo(link.section)}
                className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-base font-medium text-neutral-dark/70 transition-colors hover:bg-neutral-light-hover hover:text-primary"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/register");
              }}
              className="w-full cursor-pointer rounded-lg px-3 py-2 text-left text-base font-medium text-neutral-dark/70 transition-colors hover:bg-neutral-light-hover hover:text-primary"
            >
              Comenzar
            </button>
            {THEME_OPTIONS.map(({ id, label, Icon }) => {
              const active = getPublicTheme() === id;
              return (
                <button
                  key={id}
                  onClick={() => { setPublicTheme(id); setMenuOpen(false); }}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-neutral-dark/70 hover:bg-neutral-light-hover hover:text-primary"
                  }`}
                >
                  <Icon size={20} weight={active ? "fill" : "duotone"} />
                  {label}
                </button>
              );
            })}
            <hr className="border-neutral-light" />
            {isAuthenticated ? (
              <button
                className="w-full cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-base font-semibold text-primary-fg transition-all hover:bg-primary-hover"
                onClick={() => { navigate("/boards"); setMenuOpen(false); }}
              >
                Ir a la App
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  className="w-full cursor-pointer rounded-lg px-5 py-2.5 text-base font-semibold text-neutral-dark transition-colors hover:bg-neutral-light-hover"
                  onClick={() => { navigate("/login"); setMenuOpen(false); }}
                >
                  Iniciar Sesión
                </button>
                <button
                  className="w-full cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-base font-semibold text-primary-fg transition-all hover:bg-primary-hover"
                  onClick={() => { navigate("/register"); setMenuOpen(false); }}
                >
                  Registrarse
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
