import { useEffect, useState } from "react";
import {
  EnvelopeIcon,
  BuildingIcon,
  MapPinIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  GlobeIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Modal } from "./Modal";
import { api } from "@/services/api";
import { useBoardStore } from "@/stores/boardStore";

interface MemberProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  profile?: {
    displayName?: string;
    bio?: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    coverUrl?: string;
    socials?: {
      website?: string;
      github?: string;
      linkedin?: string;
    };
  };
  createdAt?: string;
}

export function MemberProfileModal() {
  const userId = useBoardStore((s) => s.selectedUserId);
  const setSelectedUserId = useBoardStore((s) => s.setSelectedUserId);
  const [user, setUser] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await api<MemberProfile>(`/users/${userId}`);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleClose = () => {
    setSelectedUserId(null);
  };

  if (!userId) return null;

  if (loading) {
    return (
      <Modal isOpen={!!userId} onClose={handleClose} size="md">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="size-24 rounded-full bg-neutral-light/70 animate-pulse" />
          <div className="h-4 w-32 rounded bg-neutral-light/70 animate-pulse" />
          <div className="h-3 w-48 rounded bg-neutral-light/70 animate-pulse" />
        </div>
      </Modal>
    );
  }

  if (!user) return null;

  const profile = user.profile || {};
  const displayName = profile.displayName || user.name || "Usuario";
  const bio = profile.bio;
  const jobTitle = profile.jobTitle;
  const company = profile.company;
  const location = profile.location;
  const coverUrl = profile.coverUrl;
  const avatarUrl = user.avatarUrl || `https://i.pravatar.cc/150?u=${user.email}`;

  return (
    <Modal isOpen={!!userId} onClose={handleClose} size="md">
      <div>
        {coverUrl ? (
          <div className="relative h-32 w-full overflow-hidden rounded-t-lg -m-8 mb-0">
            <img
              src={coverUrl}
              alt="Cover"
              className="h-full w-full object-cover"
            />
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-32 rounded-full object-cover ring-4 ring-surface bg-surface"
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center pt-4">
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-32 rounded-full object-cover ring-4 ring-surface bg-surface"
            />
          </div>
        )}

        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-neutral-dark">
              {displayName}
            </h3>
            {jobTitle && (
              <p className="text-sm text-neutral-dark/70 mt-1">{jobTitle}</p>
            )}
            {(company || location) && (
              <p className="text-sm text-neutral-dark/60 mt-1">
                {[company, location].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>

          {bio && (
            <div className="mb-6 rounded-lg bg-neutral-light/30 p-4">
              <p className="text-sm text-neutral-dark/70 italic">"{bio}"</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-neutral-dark/70">
              <EnvelopeIcon size={18} className="text-neutral-dark/50" />
              <span>{user.email}</span>
            </div>
            {company && (
              <div className="flex items-center gap-2 text-sm text-neutral-dark/70">
                <BuildingIcon size={18} className="text-neutral-dark/50" />
                <span>{company}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-neutral-dark/70">
                <MapPinIcon size={18} className="text-neutral-dark/50" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {(profile.socials?.website || profile.socials?.github || profile.socials?.linkedin) && (
            <div className="flex flex-wrap gap-4 mb-6">
              {profile.socials.website && (
                <a
                  href={profile.socials.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <GlobeIcon size={18} />
                  Web
                </a>
              )}
              {profile.socials.github && (
                <a
                  href={`https://github.com/${profile.socials.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-neutral-dark/70 hover:text-neutral-dark"
                >
                  <GithubLogoIcon size={18} />
                  GitHub
                </a>
              )}
              {profile.socials.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.socials.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary"
                >
                  <LinkedinLogoIcon size={18} />
                  LinkedIn
                </a>
              )}
            </div>
          )}

          {user.createdAt && (
            <div className="border-t border-neutral-light pt-4 text-center">
              <p className="text-xs text-neutral-dark/50">
                Miembro desde{" "}
                {new Date(user.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
