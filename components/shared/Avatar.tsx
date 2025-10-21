interface AvatarProps {
  name?: string;
}

function getInitials(name?: string) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
}

export function Avatar({ name }: AvatarProps) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {getInitials(name)}
    </div>
  );
}
