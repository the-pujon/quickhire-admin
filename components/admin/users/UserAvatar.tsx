const AVATAR_COLORS = [
  "from-indigo-500 to-purple-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function UserAvatar({ name }: { name: string }) {
  return (
    <div
      className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(name)} flex items-center justify-center text-white text-[12px] font-bold shadow-sm shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}
