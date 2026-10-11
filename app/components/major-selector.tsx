"use client";

import Link from "next/link";
import { Laptop, Wrench, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { majors } from "@/app/lib/ppdb-data";
import { StaggerGroup, StaggerItem } from "./motion";

export default function MajorSelector() {
    const [selectedMajor, setSelectedMajor] = useState<typeof majors[number] | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (selectedMajor && !dialog.open) dialog.showModal();
        if (!selectedMajor && dialog.open) dialog.close();
    }, [selectedMajor]);

    return (
        <>
            <StaggerGroup className="mt-8 grid gap-5 md:auto-rows-fr md:grid-cols-2">
                {majors.map((major) => {
                    const isRpl = major.code === "RPL";
                    return (
                        <StaggerItem key={major.code} className="h-full">
                            <button
                                type="button"
                                onClick={() => setSelectedMajor(major)}
                                className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-paper text-left shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-lg"
                            >
                                <div className="flex w-full items-center justify-between border-b border-neutral-300 bg-[#0F172A] px-6 py-5 text-white">
                                    <div className="flex items-center gap-3.5">
                                        <span
                                            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${
                                                isRpl
                                                    ? "border-[#38BDF8]/30 bg-[#2563EB]/25 text-[#38BDF8]"
                                                    : "border-[#F97316]/30 bg-[#EA580C]/25 text-[#FB923C]"
                                            }`}
                                        >
                                            {isRpl ? <Laptop className="h-6 w-6" /> : <Wrench className="h-6 w-6" />}
                                        </span>
                                        <div>
                                            <span className="block font-black tracking-tight text-2xl sm:text-3xl text-white">
                                                {major.code}
                                            </span>
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                {isRpl ? "Teknologi & Rekayasa" : "Teknik Otomotif"}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                                            isRpl
                                                ? "border-[#2563EB]/30 bg-[#EFF6FF] text-[#1D4ED8]"
                                                : "border-[#F97316]/30 bg-[#FFF7ED] text-[#EA580C]"
                                        }`}
                                    >
                                        {isRpl ? "💻 RPL" : "🏍️ TBSM"}
                                    </span>
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <span className="text-lg font-extrabold text-ink">{major.name}</span>
                                    <span className="mt-2 text-sm leading-relaxed text-neutral-700">
                                        {major.description}
                                    </span>
                                    <div className="mt-4 flex flex-wrap gap-1.5">
                                        {major.careers.slice(0, 3).map((career) => (
                                            <span
                                                key={career}
                                                className="rounded-lg border border-neutral-300 bg-paper-soft px-2.5 py-1 text-xs font-semibold text-neutral-700"
                                            >
                                                {career}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-extrabold text-primary group-hover:translate-x-1 transition-transform">
                                        <span>Lihat Detail Kompetensi</span>
                                        <ArrowRight size={14} />
                                    </span>
                                </div>
                            </button>
                        </StaggerItem>
                    );
                })}
            </StaggerGroup>

            <dialog
                ref={dialogRef}
                onCancel={() => setSelectedMajor(null)}
                onClick={(event) => {
                    if (event.target === dialogRef.current) setSelectedMajor(null);
                }}
                className="m-auto max-h-[min(90dvh,780px)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-neutral-300 bg-paper p-0 text-ink shadow-2xl"
                aria-labelledby="major-dialog-title"
            >
                {selectedMajor && (
                    <>
                        <div className="flex items-start justify-between gap-4 rounded-b-[24px] bg-[#0F172A] p-6 text-white sm:p-7">
                            <div className="flex items-center gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#38BDF8] bg-[#1E293B] text-[#38BDF8]">
                                    {selectedMajor.code === "RPL" ? (
                                        <Laptop className="h-7 w-7" />
                                    ) : (
                                        <Wrench className="h-7 w-7" />
                                    )}
                                </span>
                                <div>
                                    <span className="inline-block rounded-md bg-white/10 px-2.5 py-0.5 text-xs font-bold text-[#38BDF8]">
                                        KOMPETENSI KEAHLIAN • {selectedMajor.code}
                                    </span>
                                    <h2 id="major-dialog-title" className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                                        {selectedMajor.name}
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMajor(null)}
                                aria-label="Tutup detail jurusan"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-6 p-6 sm:p-7">
                            <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">
                                {selectedMajor.description}
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <section className="rounded-2xl border border-neutral-300 bg-paper-soft p-4">
                                    <h3 className="text-sm font-extrabold text-primary">Prospek Karir Lulusan</h3>
                                    <ul className="mt-3 space-y-2 text-xs font-semibold text-neutral-700 sm:text-sm">
                                        {selectedMajor.careers.map((career) => (
                                            <li key={career} className="flex items-center gap-2">
                                                <CheckCircle2 size={15} className="shrink-0 text-[#15803D]" />
                                                <span>{career}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                                <section className="rounded-2xl border border-neutral-300 bg-paper-soft p-4">
                                    <h3 className="text-sm font-extrabold text-primary">Fasilitas Praktik</h3>
                                    <ul className="mt-3 space-y-2 text-xs font-semibold text-neutral-700 sm:text-sm">
                                        {selectedMajor.facilities.map((facility) => (
                                            <li key={facility} className="flex items-center gap-2">
                                                <CheckCircle2 size={15} className="shrink-0 text-[#1D4ED8]" />
                                                <span>{facility}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedMajor(null)}
                                    className="rounded-xl border border-neutral-300 bg-paper px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-paper-soft sm:text-sm"
                                >
                                    Tutup
                                </button>
                                <Link
                                    href="/ppdb/daftar"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2563EB] sm:text-sm"
                                    style={{ color: "#ffffff" }}
                                >
                                    <span>Pilih Jurusan & Daftar</span>
                                    <ArrowRight size={15} />
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </dialog>
        </>
    );
}