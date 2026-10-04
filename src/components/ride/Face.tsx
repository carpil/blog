import { getInitials } from "../../lib/format";

// The app tints passengers without a photo in rotation; "me" is always the primary.
const PALETTE: [string, string][] = [
  ["#444956", "#dee2f3"],
  ["#b34d00", "#ffeae1"],
  ["#31353c", "#c9beff"],
];

interface Props {
  name: string;
  photo?: string | null;
  size: number;
  index?: number;
  me?: boolean;
  // Background and text colour, when the face isn't one of the passengers' tints.
  colors?: [string, string];
  className?: string;
}

export default function Face({ name, photo, size, index = 0, me = false, colors, className = "" }: Props) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.32) };
  if (photo) {
    return <img className={`face ${className}`} style={style} src={photo} alt={name} width={size} height={size} loading="lazy" decoding="async" />;
  }
  const [background, color] = colors ?? (me ? ["#6c47ff", "#f1ebff"] : PALETTE[index % PALETTE.length]);
  return (
    <span className={`face ${className}`} style={{ ...style, background, color }} role="img" aria-label={name}>
      {getInitials(name)}
    </span>
  );
}
