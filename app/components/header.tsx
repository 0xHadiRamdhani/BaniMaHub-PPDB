"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShieldCheck, Sparkles, Store } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const isEkantin = pathname?.startsWith("/ekantin");

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F172A]/95 text-white backdrop-blur-md">
            <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
                <Link href="/" className="flex shrink-0 items-center gap-3 no-underline">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#38BDF8] bg-white p-1 shadow-sm">
                        <Image src="/logo.png" alt="Logo SMK Bani Masum" fill sizes="40px" className="object-contain p-0.5" />
                    </span>
                    <span className="flex flex-col">
                        <span className="whitespace-nowrap font-black tracking-wide text-sm sm:text-base text-white leading-tight">
                            SMK BANI MASUM
                        </span>
                        <span className="whitespace-nowrap text-[10px] font-bold tracking-wider text-[#38BDF8] uppercase">
                            PORTAL PPDB 2026/2027
                        </span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 text-xs font-bold xl:flex xl:gap-1.5">
                    {[
                        ["/#keunggulan", "Kenapa Kami"],
                        ["/#jurusan", "Jurusan"],
                        ["/#alur", "Alur Daftar"],
                        ["/#jadwal", "Jadwal"],
                        ["/#syarat", "Syarat"],
                    ].map(([href, label]) => (
                        <a
                            key={href}
                            href={href}
                            className="whitespace-nowrap rounded-xl px-3 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            {label}
                        </a>
                    ))}
                    <Link
                        href="/ppdb/cek-status"
                        className="whitespace-nowrap rounded-xl px-3 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        Cek Status
                    </Link>
                    <Link
                        href="/ppdb/tiket"
                        className="whitespace-nowrap rounded-xl px-3 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        Tiket
                    </Link>
                    <Link
                        href="/ekantin"
                        className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-xl border border-[#38BDF8]/30 bg-[#1E293B] px-3.5 py-2 text-[#38BDF8] transition-colors hover:border-[#38BDF8] hover:bg-[#38BDF8]/15 hover:text-white"
                    >
                        <Store size={14} />
                        <span>E-Kantin</span>
                    </Link>
                </nav>

                <div className="flex shrink-0 items-center gap-2.5">
                    <ThemeToggle />
                    {!isEkantin && (
                        <Link
                            href="/admin"
                            className="hidden sm:inline-flex whitespace-nowrap items-center gap-1.5 rounded-xl border border-white/15 bg-[#1E293B] px-3.5 py-2 text-xs font-bold text-slate-200 transition-all hover:border-[#38BDF8]/50 hover:text-white"
                            title="Portal Admin Panitia"
                        >
                            <ShieldCheck size={15} className="text-[#38BDF8]" />
                            <span>Admin</span>
                        </Link>
                    )}
                    <Link
                        href="/ppdb/daftar"
                        className="hidden xl:inline-flex whitespace-nowrap items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#1D4ED8]"
                        style={{ color: "#ffffff" }}
                    >
                        <Sparkles size={14} />
                        <span>Daftar Sekarang</span>
                    </Link>
                    <button
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 xl:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle Menu"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="border-t border-white/10 bg-[#0F172A] px-5 py-4 shadow-2xl xl:hidden">
                    <nav className="flex flex-col gap-1.5 text-sm font-bold">
                        {[
                            ["/#keunggulan", "Kenapa Kami"],
                            ["/#jurusan", "Jurusan"],
                            ["/#alur", "Alur Daftar"],
                            ["/#jadwal", "Jadwal"],
                            ["/#syarat", "Syarat"],
                        ].map(([href, label]) => (
                            <a
                                key={href}
                                href={href}
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl px-3.5 py-2.5 text-slate-200 transition-colors hover:bg-[#1E293B] hover:text-[#38BDF8]"
                            >
                                {label}
                            </a>
                        ))}
                        <Link
                            href="/ppdb/cek-status"
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl px-3.5 py-2.5 text-slate-200 transition-colors hover:bg-[#1E293B] hover:text-[#38BDF8]"
                        >
                            Cek Status Berkas
                        </Link>
                        <Link
                            href="/ppdb/tiket"
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl px-3.5 py-2.5 text-slate-200 transition-colors hover:bg-[#1E293B] hover:text-[#38BDF8]"
                        >
                            Lihat Tiket Pendaftaran
                        </Link>
                        <Link
                            href="/ekantin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 rounded-xl border border-[#38BDF8]/25 bg-[#1E293B]/70 px-3.5 py-2.5 text-[#38BDF8] transition-colors hover:bg-[#1E293B]"
                        >
                            <Store size={16} />
                            <span>E-Kantin & Koperasi Sekolah</span>
                        </Link>
                        {!isEkantin && (
                            <Link
                                href="/admin"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl px-3.5 py-2.5 text-slate-200 transition-colors hover:bg-[#1E293B] hover:text-[#38BDF8]"
                            >
                                Portal Admin PPDB
                            </Link>
                        )}
                        <Link
                            href="/ppdb/daftar"
                            onClick={() => setIsOpen(false)}
                            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-center text-sm font-bold text-white shadow-sm"
                            style={{ color: "#ffffff" }}
                        >
                            <Sparkles size={16} />
                            <span>Daftar Sekarang</span>
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
