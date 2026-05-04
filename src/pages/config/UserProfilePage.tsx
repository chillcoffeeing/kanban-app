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
import type { UserSocialLinks } from "@/shared/types/user";
import { Button } from "@/shared/components/Button";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default placeholder:text-fg-subtle focus:border-border-focus focus:outline-none"
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-card-meta font-medium text-fg-muted">{label}</span>
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
  accountName: string;
  username: string;
}

function buildFormFromUser(user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>): ProfileForm {
  const profile = user.profile;
  return {
    displayName: profile.displayName || "",
    jobTitle: profile.jobTitle || "",
    company: profile.company || "",
    location: profile.location || "",
    bio: profile.bio || "",
    avatarUrl: profile.avatarUrl || "",
    coverUrl: profile.coverUrl || "",
    socialWebsite: profile.socials?.website || "",
    socialTwitter: profile.socials?.twitter || "",
    socialGithub: profile.socials?.github || "",
    socialLinkedin: profile.socials?.linkedin || "",
    socialInstagram: profile.socials?.instagram || "",
    accountName: user.name || "",
    username: user.username || "",
  };
}

function formHasChanges(form: ProfileForm, user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>): boolean {
  const profile = user.profile;
  return (
    form.displayName !== (profile.displayName || "") ||
    form.jobTitle !== (profile.jobTitle || "") ||
    form.company !== (profile.company || "") ||
    form.location !== (profile.location || "") ||
    form.bio !== (profile.bio || "") ||
    form.avatarUrl !== (profile.avatarUrl || "") ||
    form.coverUrl !== (profile.coverUrl || "") ||
    form.socialWebsite !== (profile.socials?.website || "") ||
    form.socialTwitter !== (profile.socials?.twitter || "") ||
    form.socialGithub !== (profile.socials?.github || "") ||
    form.socialLinkedin !== (profile.socials?.linkedin || "") ||
    form.socialInstagram !== (profile.socials?.instagram || "") ||
    form.accountName !== (user.name || "") ||
    form.username !== (user.username || "")
  );
}

export function UserProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ProfileForm | null>(null);

  useEffect(() => {
    if (user && (!form || form.accountName !== user.name)) {
      setForm(buildFormFromUser(user));
    }
  }, [user]);

  if (!user) {
    return (
      <p className="text-content text-fg-muted">
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
      const socials: UserSocialLinks = {
        website: form.socialWebsite || null,
        twitter: form.socialTwitter || null,
        github: form.socialGithub || null,
        linkedin: form.socialLinkedin || null,
        instagram: form.socialInstagram || null,
      };
      const profilePromise = updateProfile({
        displayName: form.displayName,
        jobTitle: form.jobTitle || null,
        company: form.company || null,
        location: form.location || null,
        bio: form.bio || null,
        avatarUrl: form.avatarUrl || null,
        coverUrl: form.coverUrl || null,
        socials,
      });

      if (form.accountName !== user.name) {
        updateUser({ name: form.accountName });
      }
      if (form.username !== user.username) {
        updateUser({ username: form.username || null });
      }

      await profilePromise;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
      <section>
        <h3 className="mb-1 text-content font-semibold text-fg-default">
          Información básica
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nombre visible">
            <TextInput
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
            />
          </Field>
          <Field label="Nombre de cuenta">
            <TextInput
              value={form.accountName}
              onChange={(e) => set("accountName", e.target.value)}
            />
          </Field>
          <Field label="Username (@handle)">
            <TextInput
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="sin_espacios"
            />
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
        <div className="mt-3">
          <Field label="Bio">
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className="rounded-input border border-border-default bg-bg-card px-3 py-2 text-content text-fg-default placeholder:text-fg-subtle focus:border-border-focus focus:outline-none"
              placeholder="Cuéntale al equipo sobre ti…"
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-content font-semibold text-fg-default">
          Redes sociales
        </h3>
        <p className="mb-3 text-card-meta text-fg-subtle">
          Enlaces mostrados en tu perfil público.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {([
            ["socialWebsite", "Sitio web", LinkIcon],
            ["socialTwitter", "Twitter / X", AtIcon],
            ["socialGithub", "GitHub", UserCircleIcon],
            ["socialLinkedin", "LinkedIn", UserCircleIcon],
            ["socialInstagram", "Instagram", UserCircleIcon],
          ] as Array<[keyof ProfileForm, string, PhosphorIcon]>).map(([key, label, Icon]) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-2">
                <Icon size={20} weight="duotone" className="text-icon-muted" />
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

      <section>
        <h3 className="mb-1 text-content font-semibold text-fg-default">
          Cuentas enlazadas
        </h3>
        <p className="mb-3 text-card-meta text-fg-subtle">
          Proveedores con los que puedes iniciar sesión.
        </p>
        <div className="flex flex-wrap gap-2">
          {user.linkedProviders.map((p) => (
            <span
              key={`${p.provider}-${p.providerId}`}
              className="inline-flex items-center gap-2 rounded-pill bg-bg-muted px-3 py-1 text-card-meta text-fg-muted capitalize"
            >
              <UserCircleIcon size={18} weight="duotone" /> {p.provider}
            </span>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 pt-4 border-t border-border-default">
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
          <span className="text-content text-fg-success">Perfil guardado correctamente</span>
        )}
      </div>
    </div>
  );
}
