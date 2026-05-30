import { UserStatus } from "@orvex/types";
import { Avatar, cn, type AvatarSize } from "@orvex/ui";

const statusRing: Record<UserStatus, string | null> = {
  [UserStatus.Online]: "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950",
  [UserStatus.Away]: "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950",
  [UserStatus.DoNotDisturb]: "ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-950",
  [UserStatus.Offline]: null,
};

interface StatusAvatarProps {
  src?: string | null;
  name: string;
  status: UserStatus;
  size?: AvatarSize;
  className?: string;
}

export function StatusAvatar({ src, name, status, size = "xl", className }: StatusAvatarProps) {
  const ring = statusRing[status];
  const avatarProps = src === undefined ? { name, size } : { src, name, size };

  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-full",
        ring,
        className,
      )}
    >
      <Avatar {...avatarProps} className="ring-0" />
    </div>
  );
}
