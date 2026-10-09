"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 border-b border-neutral-300 bg-paper/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-18.5 sm:px-8">
                <Link href="/" className="flex items-center gap-3 no-underline">
                    <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-300 bg-paper-soft">
                        <Image src="/logo.png" alt="Logo SMK Bani Masum" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="font-extrabold tracking-tight text-lg sm:text-xl truncate">SMK BANI MASUM</span>
                </Link>
                
                <nav className="hidden items-center gap-6 text-sm font-bold lg:flex">
                    <a href="#keunggulan" className="text-ink/80 transition-colors hover:text-primary">Kenapa Kami</a>
                    <a href="#jurusan" className="text-ink/80 transition-colors hover:text-primary">Jurusan</a>
                    <a href="#alur" className="text-ink/80 transition-colors hover:text-primary">Alur Daftar</a>
                    <a href="#jadwal" className="text-ink/80 transition-colors hover:text-primary">Jadwal</a>
                    <a href="#syarat" className="text-ink/80 transition-colors hover:text-primary">Syarat</a>
                    <Link href="/ppdb/tiket" className="text-ink/80 transition-colors hover:text-primary">Tiket</Link>
                </nav>
                
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link href="/ppdb/daftar" className="hidden lg:flex rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg shrink-0 bg-primary px-3 py-2 text-xs font-bold text-white sm:px-4 sm:text-sm" style={{ color: "#ffffff" }}>
                        Daftar Sekarang
                    </Link>
                    <button 
                        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 bg-paper text-primary shadow-sm hover:bg-paper-soft transition-colors" style={{ color: "var(--btn-secondary-text)" }} 
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {isOpen ? (
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="lg:hidden border-t border-neutral-300 bg-paper px-4 py-4 absolute w-full left-0 shadow-lg flex flex-col gap-4">
                    <nav className="flex flex-col gap-4 text-sm font-bold">
                        <a href="#keunggulan" onClick={() => setIsOpen(false)} className="text-ink/80 transition-colors hover:text-primary">Kenapa Kami</a>
                        <a href="#jurusan" onClick={() => setIsOpen(false)} className="text-ink/80 transition-colors hover:text-primary">Jurusan</a>
                        <a href="#alur" onClick={() => setIsOpen(false)} className="text-ink/80 transition-colors hover:text-primary">Alur Daftar</a>
                        <a href="#jadwal" onClick={() => setIsOpen(false)} className="text-ink/80 transition-colors hover:text-primary">Jadwal</a>
                        <a href="#syarat" onClick={() => setIsOpen(false)} className="text-ink/80 transition-colors hover:text-primary">Syarat</a>
                        <Link href="/ppdb/tiket" onClick={() => setIsOpen(false)} className="text-ink/80 transition-colors hover:text-primary">Tiket</Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
