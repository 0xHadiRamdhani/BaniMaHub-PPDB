"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultSchedule } from "@/app/lib/ppdb-data";
import { Panel, SubpageShell } from "@/app/components/subpage-shell";

export default function PpdbPage() {
    const [schedule, setSchedule] = useState(defaultSchedule);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("ppdb:schedule");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setSchedule(parsed);
                }
            }
        } catch {}

        fetch("/api/schedule")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
                    setSchedule(data.schedule);
                    try {
                        localStorage.setItem("ppdb:schedule", JSON.stringify(data.schedule));
                    } catch {}
                }
            })
            .catch(() => {});

        const handleUpdate = () => {
            try {
                const current = localStorage.getItem("ppdb:schedule");
                if (current) {
                    const parsed = JSON.parse(current);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setSchedule(parsed);
                    }
                }
            } catch {}
        };

        window.addEventListener("ppdb:schedule-updated", handleUpdate);
        window.addEventListener("storage", handleUpdate);

        return () => {
            window.removeEventListener("ppdb:schedule-updated", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, []);

    return (
        <SubpageShell
            eyebrow="Penerimaan Peserta Didik Baru"
            title="Mulai Langkahmu di Sini"
            intro="Pendaftaran tahun ajaran baru dibuka untuk calon siswa yang siap belajar, praktik, dan berkembang bersama."
        >
            <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
                <div className="grid gap-5 md:grid-cols-2">
                    <Panel>
                        <span className="inline-block rounded-lg bg-[#EFF6FF] px-3 py-1 text-xs font-extrabold tracking-wider text-[#1D4ED8] uppercase dark:bg-[#1E293B] dark:text-[#38BDF8]">
                            Timeline
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">Jadwal Terbaru</h2>
                        <div className="mt-5 space-y-3 text-sm">
                            {schedule.map(([stage, first, second]) => (
                                <div key={stage} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#0F172A]/60">
                                    <p className="font-extrabold text-ink">{stage}</p>
                                    <p className="mt-1 text-xs leading-5 text-muted-soft">
                                        Gelombang 1: <strong className="text-ink">{first}</strong>
                                        <br />
                                        Gelombang 2: <strong className="text-ink">{second}</strong>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel>
                        <span className="inline-block rounded-lg bg-[#EFF6FF] px-3 py-1 text-xs font-extrabold tracking-wider text-[#1D4ED8] uppercase dark:bg-[#1E293B] dark:text-[#38BDF8]">
                            Registrasi Online
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">Alur Pendaftaran</h2>
                        <p className="mt-3 text-sm leading-7 text-muted-soft">
                            Isi formulir biodata, unggah dokumen pendukung (atau pilih menyusul), verifikasi berkas oleh panitia, lalu pantau pengumuman secara online.
                        </p>
                        <Link
                            href="/ppdb/daftar"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-[#2563EB]/20 transition hover:bg-[#1D4ED8]"
                        >
                            Buka Formulir Pendaftaran
                        </Link>
                    </Panel>
                    <Panel>
                        <span className="inline-block rounded-lg bg-[#EFF6FF] px-3 py-1 text-xs font-extrabold tracking-wider text-[#1D4ED8] uppercase dark:bg-[#1E293B] dark:text-[#38BDF8]">
                            Menu Cepat
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">Layanan PPDB</h2>
                        <div className="mt-4 flex flex-col gap-2.5 text-sm">
                            <Link href="/ppdb/pembayaran" className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 font-bold text-[#1D4ED8] transition hover:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A]/60 dark:text-[#38BDF8]">
                                Konfirmasi pembayaran →
                            </Link>
                            <Link href="/ppdb/ranking" className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 font-bold text-[#1D4ED8] transition hover:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A]/60 dark:text-[#38BDF8]">
                                Lihat ranking seleksi →
                            </Link>
                            <Link href="/ppdb/pengumuman" className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 font-bold text-[#1D4ED8] transition hover:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A]/60 dark:text-[#38BDF8]">
                                Pengumuman kelulusan →
                            </Link>
                            <Link href="/faq" className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 font-bold text-[#1D4ED8] transition hover:border-[#2563EB] dark:border-[#334155] dark:bg-[#0F172A]/60 dark:text-[#38BDF8]">
                                Baca FAQ pendaftaran →
                            </Link>
                        </div>
                    </Panel>
                    <Panel>
                        <span className="inline-block rounded-lg bg-[#ECFDF5] px-3 py-1 text-xs font-extrabold tracking-wider text-[#059669] uppercase dark:bg-[#059669]/15 dark:text-[#34D399]">
                            Verifikasi
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">Sudah Mendaftar?</h2>
                        <p className="mt-3 text-sm leading-7 text-muted-soft">
                            Gunakan nomor pendaftaran (`PPDB-2026-XXXX`) atau NISN untuk melihat status verifikasi berkas secara real-time.
                        </p>
                        <Link
                            href="/ppdb/cek-status"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#1E293B] dark:bg-[#2563EB]"
                        >
                            Cek Status Pendaftaran
                        </Link>
                    </Panel>
                </div>
            </section>
        </SubpageShell>
    );
}
