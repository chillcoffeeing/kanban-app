import { useEffect, useState } from "react";
import {
  EnvelopeIcon,
  BuildingIcon,
  MapPinIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  GlobeIcon,
} from "@phosphor-icons/react";
import { Modal } from "./Modal";
import { api } from "@/services/api";
import { useBoardStore } from "@/stores/boardStore";

export function MemberProfileModal() {
  const userId = useBoardStore((s) => s.selectedUserId);
  const setSelectedUserId = useBoardStore((s) => s.setSelectedUserId);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await api<any>(`/users/${userId}`);
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
          <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-48 rounded bg-gray-200 animate-pulse" />
        </div>
      </Modal>
    );
  }

  if (!user) {
    return (
      <Modal isOpen={!!userId} onClose={handleClose} size="md">
        <div className="text-center py-8 text-gray-500">
          No se encontró información del usuario
        </div>
      </Modal>
    );
  }

  const profile = user.profile || {};
  const displayName = profile.displayName || "Usuario";
  const bio = profile.bio;
  const jobTitle = profile.jobTitle;
  const company = profile.company;
  const location = profile.location;
  const coverUrl = profile.coverUrl;
  const createdAt = user.createdAt;
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
                className="h-32 w-32 rounded-full object-cover ring-4 ring-white bg-white"
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center pt-4">
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-white bg-white"
            />
          </div>
        )}

        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {displayName}
            </h3>
            {jobTitle && (
              <p className="text-sm text-gray-600 mt-1">{jobTitle}</p>
            )}
            {(company || location) && (
              <p className="text-sm text-gray-500 mt-1">
                {[company, location].filter(Boolean).join(" • ")}
              </p>
            )}
          </div>

          {bio && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700 italic">"{bio}"</p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <EnvelopeIcon size={18} />
                <span>{user.email}</span>
              </div>
            )}
            {company && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BuildingIcon size={18} />
                <span>{company}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPinIcon size={18} />
                <span>{location}</span>
              </div>
            )}
          </div>

          {(profile.socialWebsite || profile.socialGithub || profile.socialLinkedin) && (
            <div className="flex flex-wrap gap-4 mb-6">
              {profile.socialWebsite && (
                <a
                  href={profile.socialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <GlobeIcon size={18} />
                  Web
                </a>
              )}
              {profile.socialGithub && (
                <a
                  href={`https://github.com/${profile.socialGithub}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <GithubLogoIcon size={18} />
                  GitHub
                </a>
              )}
              {profile.socialLinkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.socialLinkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700"
                >
                  <LinkedinLogoIcon size={18} />
                  LinkedIn
                </a>
              )}
            </div>
          )}

          {createdAt && (
            <div className="border-t border-gray-200 pt-4 text-center">
              <p className="text-xs text-gray-500">
                Miembro desde{" "}
                {new Date(createdAt).toLocaleDateString("es-ES", {
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
