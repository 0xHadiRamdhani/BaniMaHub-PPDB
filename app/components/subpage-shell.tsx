import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/theme-toggle";

export function SubpageShell({ eyebrow, title, intro, headerAction, hideHomeLink, children }: { eyebrow: string; title: string; intro?: string; headerAction?: React.ReactNode; hideHomeLink?: boolean; children: React.ReactNode }) {
    return <main><header className="border-b border-gray-200 bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:h-[74px] sm:px-8"><Link href="/" className="flex min-w-0 items-center gap-3"><span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50"><Image src="/logo.png" alt="Logo SMK Bani Masum" fill sizes="40px" className="object-cover" /></span><span className="hidden truncate font-extrabold tracking-tight text-xl sm:block">SMK BANI MASUM</span></Link><div className="flex items-center gap-2 sm:gap-3"><ThemeToggle />{headerAction}{!hideHomeLink && <Link href="/" className="shrink-0 text-sm font-bold text-primary underline underline-offset-4">← Beranda</Link>}</div></div></header><section className="border-b border-gray-200 bg-gray-50 py-10 sm:py-14"><div className="mx-auto max-w-5xl px-4 sm:px-8"><p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-primary">{eyebrow}</p><h1 className="font-extrabold tracking-tight text-4xl sm:text-6xl">{title}</h1>{intro && <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700 sm:text-lg sm:leading-8">{intro}</p>}</div></section>{children}</main>;
}

export function Panel({ children }: { children: React.ReactNode }) {
    return <div className="border border-gray-200 bg-white p-4 shadow-md rounded-xl sm:p-8">{children}</div>;
}
