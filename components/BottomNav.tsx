"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/",              label: "選択肢",   icon: HomeIcon },
  { href: "/quiz",          label: "診断",     icon: QuizIcon },
  { href: "/compare-entry", label: "比較",     icon: CompareIcon },
  { href: "/services",      label: "サービス", icon: ServiceIcon },
  { href: "/simulate",      label: "費用",     icon: SimulateIcon },
  { href: "/guide",         label: "ガイド",   icon: GuideIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40
                    bg-white/90 backdrop-blur-md border-t border-line
                    safe-area-pb">
      <div className="flex max-w-5xl mx-auto">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/"
            ? pathname === "/"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5
                          py-2.5 text-[11px] font-medium transition-colors
                          ${active ? "text-accent" : "text-sub hover:text-ink"}`}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── アイコン群 ──────────────────────────────────────────
function HomeIcon({ active }: { active: boolean }) {
  const c = active ? "#5b9cf0" : "currentColor";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}

function QuizIcon({ active }: { active: boolean }) {
  const c = active ? "#5b9cf0" : "currentColor";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
      <circle cx="12" cy="17" r="0.5" fill={c}/>
    </svg>
  );
}

function CompareIcon({ active }: { active: boolean }) {
  const c = active ? "#5b9cf0" : "currentColor";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2"  y="3" width="8" height="18" rx="2"/>
      <rect x="14" y="3" width="8" height="18" rx="2"/>
      <line x1="10" y1="8"  x2="14" y2="8"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
      <line x1="10" y1="16" x2="14" y2="16"/>
    </svg>
  );
}

function ServiceIcon({ active }: { active: boolean }) {
  const c = active ? "#5b9cf0" : "currentColor";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 017 7c0 4-3.5 8-7 11C8.5 17 5 13 5 9a7 7 0 017-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  );
}

function SimulateIcon({ active }: { active: boolean }) {
  const c = active ? "#5b9cf0" : "currentColor";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
      <path d="M6 15h4M14 15h4"/>
    </svg>
  );
}

function GuideIcon({ active }: { active: boolean }) {
  const c = active ? "#5b9cf0" : "currentColor";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  );
}
