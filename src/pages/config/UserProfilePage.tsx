import { useState, useEffect } from "react";
import {
  LinkIcon,
  AtIcon,
  UserCircleIcon,
  FloppyDiskIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/shared/components/Button";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-lg border border-neutral-light bg-neutral-light/50 px-3 py-2 text-sm text-neutral-dark placeholder:text-neutral-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-neutral-dark/70">{label}</span>
      {children}
    </label>
  );
}

interface ProfileForm {
  displayName: string;
  jobTitle: string;
  company: string;
  location: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  socialWebsite: string;
  socialTwitter: string;
  socialGithub: string;
  socialLinkedin: string;
  socialInstagram: string;
}

function buildFormFromUser(user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>): ProfileForm {
  const profileJson = user.profile?.profile || {};
  return {
    displayName: profileJson.displayName || "",
    jobTitle: profileJson.jobTitle || "",
    company: profileJson.company || "",
    location: profileJson.location || "",
    bio: profileJson.bio || "",
    avatarUrl: user.avatarUrl || profileJson.coverUrl || "",
    coverUrl: profileJson.coverUrl || "",
    socialWebsite: profileJson.socialWebsite || "",
    socialTwitter: profileJson.socialTwitter || "",
    socialGithub: profileJson.socialGithub || "",
    socialLinkedin: profileJson.socialLinkedin || "",
    socialInstagram: profileJson.socialInstagram || "",
  };
}

function formHasChanges(form: ProfileForm, user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>): boolean {
  const profileJson = user.profile?.profile || {};
  return (
    form.displayName !== (profileJson.displayName || "") ||
    form.jobTitle !== (profileJson.jobTitle || "") ||
    form.company !== (profileJson.company || "") ||
    form.location !== (profileJson.location || "") ||
    form.bio !== (profileJson.bio || "") ||
    form.coverUrl !== (profileJson.coverUrl || "") ||
    form.socialWebsite !== (profileJson.socialWebsite || "") ||
    form.socialTwitter !== (profileJson.socialTwitter || "") ||
    form.socialGithub !== (profileJson.socialGithub || "") ||
    form.socialLinkedin !== (profileJson.socialLinkedin || "") ||
    form.socialInstagram !== (profileJson.socialInstagram || "")
  );
}

export function UserProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ProfileForm | null>(null);

  useEffect(() => {
    if (user && !form) {
      setForm(buildFormFromUser(user));
    }
  }, [user]);

  if (!user) {
    return (
      <p className="text-content text-neutral-dark">
        Inicia sesión para personalizar tu perfil.
      </p>
    );
  }

  if (!form) return null;

  const set = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        displayName: form.displayName,
        jobTitle: form.jobTitle || null,
        company: form.company || null,
        location: form.location || null,
        bio: form.bio || null,
        coverUrl: form.coverUrl || null,
        socialWebsite: form.socialWebsite || null,
        socialTwitter: form.socialTwitter || null,
        socialGithub: form.socialGithub || null,
        socialLinkedin: form.socialLinkedin || null,
        socialInstagram: form.socialInstagram || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(buildFormFromUser(user));
    setSaved(false);
  };

  const hasChanges = formHasChanges(form, user);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} disabled={saving || !hasChanges}>
          <FloppyDiskIcon size={20} weight="duotone" />
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
        {hasChanges && (
          <Button variant="ghost" onClick={handleReset} disabled={saving}>
            <ArrowCounterClockwiseIcon size={20} weight="duotone" /> Descartar
          </Button>
        )}
        {saved && (
          <span className="text-content text-success">Perfil guardado correctamente</span>
        )}
      </div>
      <section className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <UserCircleIcon size={20} weight="duotone" className="text-primary/70" />
          Información básica
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre visible">
            <TextInput
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
            />
          </Field>
          <Field label="Nombre de cuenta">
            <TextInput value={user.name || ""} disabled />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={user.email || ""} disabled />
          </Field>
          <Field label="Puesto">
            <TextInput
              value={form.jobTitle}
              onChange={(e) => set("jobTitle", e.target.value)}
              placeholder="Product Designer"
            />
          </Field>
          <Field label="Empresa">
            <TextInput
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </Field>
          <Field label="Ubicación">
            <TextInput
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Caracas, VE"
            />
          </Field>
          <Field label="URL de avatar">
            <TextInput
              value={form.avatarUrl}
              onChange={(e) => set("avatarUrl", e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Bio">
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className="w-full rounded-lg border border-neutral-light bg-surface px-3 py-2 text-sm text-neutral-dark placeholder:text-neutral-dark/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Cuéntale al equipo sobre ti…"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-light bg-surface p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-neutral-dark flex items-center gap-2">
          <LinkIcon size={20} weight="duotone" className="text-primary/70" />
          Redes sociales
        </h3>
        <p className="mb-4 text-sm text-neutral-dark/60">
          Enlaces mostrados en tu perfil público.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {([
            ["socialWebsite", "Sitio web", LinkIcon],
            ["socialTwitter", "Twitter / X", AtIcon],
            ["socialGithub", "GitHub", UserCircleIcon],
            ["socialLinkedin", "LinkedIn", UserCircleIcon],
            ["socialInstagram", "Instagram", UserCircleIcon],
          ] as Array<[keyof ProfileForm, string, PhosphorIcon]>).map(([key, label, Icon]) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-2">
                <Icon size={20} weight="duotone" className="text-neutral-dark/50" />
                <TextInput
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={
                    key === "socialTwitter" ? "@usuario" : "https://…"
                  }
                />
              </div>
            </Field>
          ))}
        </div>
      </section>
    </div>
  );
}
