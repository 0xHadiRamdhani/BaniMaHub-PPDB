import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";

export function SubpageShell({
    eyebrow,
    title,
    intro,
    headerAction,
    hideHomeLink,
    children,
}: {
    eyebrow: string;
    title: string;
    intro?: string;
    headerAction?: React.ReactNode;
    hideHomeLink?: boolean;
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-paper-soft pb-16">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F172A]/95 text-white backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-18 sm:px-8">
                    <Link href="/" className="flex min-w-0 items-center gap-3 no-underline">
                        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#38BDF8] bg-white p-1">
                            <Image src="/logo.png" alt="Logo SMK Bani Masum" fill sizes="40px" className="object-contain p-0.5" />
                        </span>
                        <span className="flex flex-col min-w-0">
                            <span className="truncate font-black tracking-wide text-sm sm:text-base text-white leading-tight">
                                SMK BANI MASUM
                            </span>
                            <span className="truncate text-[10px] font-bold tracking-wider text-[#38BDF8] uppercase">
                                PORTAL PPDB 2026/2027
                            </span>
                        </span>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <ThemeToggle />
                        {headerAction}
                        {!hideHomeLink && (
                            <Link
                                href="/"
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-white/20"
                            >
                                <ArrowLeft size={14} className="text-[#38BDF8]" />
                                <span>Beranda</span>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <section className="bg-gradient-to-b from-[#0F172A] to-[#1E3A8A] rounded-b-[28px] sm:rounded-b-[36px] py-10 sm:py-14 text-white shadow-md">
                <div className="mx-auto max-w-6xl px-4 sm:px-8">
                    <h1 className="font-extrabold tracking-tight text-3xl sm:text-5xl text-white">
                        {title}
                    </h1>
                    {intro && (
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                            {intro}
                        </p>
                    )}
                </div>
            </section>

            {children}
        </main>
    );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-2xl border border-neutral-300 bg-paper p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] sm:p-7 ${className}`}
        >
            {children}
        </div>
    );
}

