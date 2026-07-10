"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/i18n";

export default function Header() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();

  const NAV = [
    { href: "/dashboard", label: t("nav_dashboard") },
    { href: "/assist", label: t("nav_assist") }
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
              AI
            </span>
            <span className="text-sm font-semibold text-slate-900">
              CMC Call Center AI
              <span className="ml-2 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                Africa PoC
              </span>
            </span>
          </Link>
          <nav className="flex gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  pathname.startsWith(n.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-md border border-slate-300 text-xs">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 font-medium ${
                lang === "en" ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ja")}
              className={`px-2.5 py-1 font-medium ${
                lang === "ja" ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              日本語
            </button>
          </div>
          <div className="hidden text-xs text-slate-500 md:block">
            {t("signed_in")} <span className="font-medium text-slate-700">A. Mwangi {t("agent_role")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
