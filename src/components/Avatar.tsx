interface AvatarProps {
  emoji?: string;
  gradient?: [string, string];
  /** Render the Wikipedia "W" mark instead of an emoji. */
  wiki?: boolean;
  size?: number;
  /** Story-style ring: 'new' is colourful, 'seen' is grey. */
  ring?: 'new' | 'seen' | 'none';
}

export function Avatar({ emoji, gradient, wiki, size = 32, ring = 'none' }: AvatarProps) {
  const inner = (
    <span
      className={`avatar${wiki ? ' avatar--wiki' : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        background: wiki || !gradient ? undefined : `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      }}
      aria-hidden="true"
    >
      {wiki ? 'W' : emoji}
    </span>
  );
  if (ring === 'none') return inner;
  return <span className={`avatar-ring avatar-ring--${ring}`}>{inner}</span>;
}
