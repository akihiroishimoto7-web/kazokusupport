// 費用感を5段階バーで視覚化するコンポーネント
const LABELS: Record<number, string> = {
  1: "低め",
  2: "やや低め",
  3: "中程度",
  4: "やや高め",
  5: "高め",
};

type Props = {
  level: 1 | 2 | 3 | 4 | 5;
  compact?: boolean; // 比較ページ用の小さいサイズ
};

export default function CostBar({ level, compact = false }: Props) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "mt-2" : "mt-3"}`}>
      {/* 5段階バー */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`rounded-full transition-colors
              ${compact ? "w-6 h-2.5" : "w-8 h-3"}
              ${n <= level ? "bg-amber-400" : "bg-gray-200"}`}
          />
        ))}
      </div>
      {/* ラベル */}
      <span className={`font-medium text-amber-600 ${compact ? "text-xs" : "text-sm"}`}>
        {LABELS[level]}
      </span>
    </div>
  );
}
