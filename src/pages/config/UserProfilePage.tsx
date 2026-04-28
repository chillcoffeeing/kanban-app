import type { InputHTMLAttributes } from "react";
import {
  Link as LinkIcon,
  At,
  UserCircle,
} from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { useAuthStore } from "@/stores/authStore";
import type { UserSocialLinks } from "@/shared/types/user";
import { Button } from "@/shared/components/Button";

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
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

export function UserProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const updateUser = useAuthStore((s) => s.updateUser);

  if (!user) {
    return (
      <p className="text-content text-fg-muted">
        Inicia sesión para personalizar tu perfil.
      </p>
    );
  }

  const profile = user.profile;
  const setField = <K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) =>
    updateProfile({ [key]: value } as Partial<typeof profile>);
  const setSocial = (key: keyof UserSocialLinks, value: string) =>
    updateProfile({ socials: { [key]: value || null } as Partial<UserSocialLinks> as UserSocialLinks });

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-1 text-content font-semibold text-fg-default">
          Información básica
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nombre visible">
            <TextInput
              value={profile.displayName || ""}
              onChange={(e) => setField("displayName", e.target.value)}
            />
          </Field>
          <Field label="Nombre de cuenta">
            <TextInput
              value={user.name || ""}
              onChange={(e) => updateUser({ name: e.target.value })}
            />
          </Field>
          <Field label="Username (@handle)">
            <TextInput
              value={user.username || ""}
              onChange={(e) =>
                updateUser({ username: e.target.value || null })
              }
              placeholder="sin_espacios"
            />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={user.email || ""} disabled />
          </Field>
          <Field label="Puesto">
            <TextInput
              value={profile.jobTitle || ""}
              onChange={(e) => setField("jobTitle", e.target.value || null)}
              placeholder="Product Designer"
            />
          </Field>
          <Field label="Empresa">
            <TextInput
              value={profile.company || ""}
              onChange={(e) => setField("company", e.target.value || null)}
            />
          </Field>
          <Field label="Ubicación">
            <TextInput
              value={profile.location || ""}
              onChange={(e) => setField("location", e.target.value || null)}
              placeholder="Caracas, VE"
            />
          </Field>
          <Field label="URL de avatar">
            <TextInput
              value={profile.avatarUrl || ""}
              onChange={(e) => setField("avatarUrl", e.target.value || null)}
              placeholder="https://…"
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Bio">
            <textarea
              rows={3}
              value={profile.bio || ""}
              onChange={(e) => setField("bio", e.target.value || null)}
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
            ["website", "Sitio web", LinkIcon],
            ["twitter", "Twitter / X", At],
            ["github", "GitHub", UserCircle],
            ["linkedin", "LinkedIn", UserCircle],
            ["instagram", "Instagram", UserCircle],
          ] as Array<[keyof UserSocialLinks, string, PhosphorIcon]>).map(([key, label, Icon]) => (
            <Field key={key} label={label}>
              <div className="flex items-center gap-2">
                <Icon size={20} weight="duotone" className="text-icon-muted" />
                <TextInput
                  value={profile.socials?.[key] || ""}
                  onChange={(e) => setSocial(key, e.target.value)}
                  placeholder={
                    key === "twitter" ? "@usuario" : "https://…"
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
              <UserCircle size={18} weight="duotone" /> {p.provider}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}