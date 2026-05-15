// 詳細画面のアイコン付き情報行
export default function InfoRow({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 sm:gap-5 py-5 border-b border-line last:border-b-0">
      <div className="text-3xl shrink-0" aria-hidden>{emoji}</div>
      <div>
        <div className="text-sm text-sub mb-1">{label}</div>
        <div className="text-lg sm:text-xl text-ink leading-relaxed">{value}</div>
      </div>
    </div>
  );
}
