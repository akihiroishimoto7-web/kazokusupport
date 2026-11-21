/** 細い矢印。文字の「→」より線が整うのでSVGで描きます */
export function Arrow({ dir = "right", className }: { dir?: "right" | "up-right" | "down"; className?: string }) {
  const rotate = dir === "up-right" ? -45 : dir === "down" ? 90 : 0;
  return (
    <svg
      className={`arrow ${className ?? ""}`}
      width="18"
      height="10"
      viewBox="0 0 18 10"
      aria-hidden="true"
      style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
    >
      <path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
