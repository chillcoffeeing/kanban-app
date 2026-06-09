import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  EnvelopeIcon,
  BuildingIcon,
  MapPinIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  GlobeIcon,
  XLogoIcon,
  InstagramLogoIcon,
} from "@phosphor-icons/react";
import { Modal } from "./Modal";
import { ApiClient } from "@/services/api";
import { useBoardStore } from "@/stores/boardStore";
import type { UserResponse, UserProfileJson } from "@/shared/types";

export function MemberProfileModal() {
  const userId = useBoardStore((boardState) => boardState.selectedUserId);
  const setSelectedUserId = useBoardStore(
    (boardState) => boardState.setSelectedUserId,
  );
  const [state, setState] = useState<{
    user: UserResponse | null;
    loading: boolean;
  }>({ user: null, loading: false });
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setState({ user: null, loading: false });
      return;
    }

    setCoverError(false);
    setState((prev) => ({ ...prev, loading: true }));

    const fetchUser = async () => {
      try {
        const data = await ApiClient.get<UserResponse>(`/users/${userId}`);
        setState({ user: data, loading: false });
      } catch (error) {
        console.error("Error fetching user:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchUser();
  }, [userId]);

  const handleClose = () => {
    setSelectedUserId(null);
  };

  if (!userId) return null;

  if (state.loading) {
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

  const user = state.user;
  if (!user) return null;

  const profile: UserProfileJson = user.profile?.profile ?? {};
  const displayName = profile.displayName || user.name || "Usuario";
  const bio = profile.bio;
  const jobTitle = profile.jobTitle;
  const company = profile.company;
  const location = profile.location;
  const coverUrl = profile.coverUrl;
  const avatarUrl =
    user.avatarUrl || `https://i.pravatar.cc/150?u=${user.email}`;

  const socialWebsite = profile.socialWebsite;
  const socialGithub = profile.socialGithub;
  const socialLinkedin = profile.socialLinkedin;
  const socialTwitter = profile.socialTwitter;
  const socialInstagram = profile.socialInstagram;

  const hasSocials =
    socialWebsite ||
    socialGithub ||
    socialLinkedin ||
    socialTwitter ||
    socialInstagram;

  return (
    <Modal isOpen={!!userId} onClose={handleClose} size="md">
      <div>
        {coverUrl ? (
          <div className="relative h-32 w-full rounded-t-lg bg-linear-to-r from-blue-500 via-purple-500 to-pink-500">
            {!coverError && (
              <img
                src={coverUrl}
                alt="Cover"
                className="h-full w-full object-cover rounded-t-lg"
                onError={() => setCoverError(true)}
              />
            )}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
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

          {hasSocials && (
            <div className="flex flex-wrap gap-4 mb-6">
              {socialWebsite && (
                <a
                  href={socialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <GlobeIcon size={18} />
                  Web
                </a>
              )}
              {socialGithub && (
                <a
                  href={`https://github.com/${socialGithub}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-neutral-dark/70 hover:text-neutral-dark"
                >
                  <GithubLogoIcon size={18} />
                  GitHub
                </a>
              )}
              {socialLinkedin && (
                <a
                  href={`https://linkedin.com/in/${socialLinkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary/70 hover:text-primary"
                >
                  <LinkedinLogoIcon size={18} />
                  LinkedIn
                </a>
              )}
              {socialTwitter && (
                <a
                  href={`https://x.com/${socialTwitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-neutral-dark/70 hover:text-neutral-dark"
                >
                  <XLogoIcon size={18} />X / Twitter
                </a>
              )}
              {socialInstagram && (
                <a
                  href={`https://instagram.com/${socialInstagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#E4405F] hover:text-[#D3314A]"
                >
                  <InstagramLogoIcon size={18} />
                  Instagram
                </a>
              )}
            </div>
          )}

          {user.createdAt && (
            <div className="border-t border-neutral-light pt-4 text-center">
              <p className="text-xs text-neutral-dark/50">
                Miembro desde{" "}
                {format(new Date(user.createdAt), "MMMM yyyy", { locale: es })}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
