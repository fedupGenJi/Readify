interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string; // Add this line
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (src) {
    return <img src={src} alt={name} className={`${sizeClasses[size]} rounded-full object-cover ${className}`} />;
  }

  return (
    <div
      className={`flex ${sizeClasses[size]} shrink-0 items-center justify-center rounded-full bg-secondary/10 font-semibold text-primary ${className}`}
    >
      {initial}
    </div>
  );
}