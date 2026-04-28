import { useMemo } from "react";

export function MemberAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar?: string;
}) {
  const color = useMemo(() => {
    if (avatar) return [avatar, "transparent"];
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return randomColor;
  }, [avatar]);

  return (
    <div
      className="h-8 w-8 rounded-full text-white flex items-center justify-center ring ring-white"
      style={{ backgroundColor: color.toString() }}
      title={name}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}
