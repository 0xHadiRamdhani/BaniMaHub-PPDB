"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, Clock, AlertTriangle, XCircle, Ticket } from "lucide-react";
import { Panel, SubpageShell } from "@/app/components/subpage-shell";

function getStatusStyle(status: string) {
    switch (status) {
        case "Lulus verifikasi":
        case "Diterima":
            return {
                text: "#15803D",
                bg: "#DCFCE7",
                border: "#86EFAC",
                icon: CheckCircle2,
                desc: "Selamat! Berkas pendaftaran kamu telah diverifikasi dan dinyatakan lulus seleksi.",
            };
        case "Menunggu verifikasi":
            return {
                text: "#D97706",
                bg: "#FEF3C7",
                border: "#FDE68A",
                icon: Clock,
                desc: "Berkas pendaftaran kamu sedang dalam antrean pemeriksaan panitia PPDB.",
            };
        case "Berkas tidak lengkap":
        case "Berkas dikembalikan":
        case "Revisi berkas":
            return {
                text: "#EA580C",
                bg: "#FFEDD5",
                border: "#FDBA74",
                icon: AlertTriangle,
                desc: "Ada dokumen yang perlu dilengkapi atau diperbaiki. Silakan hubungi panitia PPDB.",
            };
        case "Tidak lulus verifikasi":
            return {
                text: "#DC2626",
                bg: "#FEE2E2",
                border: "#FCA5A5",
                icon: XCircle,
                desc: "Mohon maaf, berkas pendaftaran belum memenuhi kriteria verifikasi.",
            };
        default:
            return {
                text: "#1D4ED8",
                bg: "#EFF6FF",
                border: "#BFDBFE",
                icon: Clock,
                desc: "Informasi status pendaftaran calon siswa baru.",
            };
    }
}

export default function StatusPage() {
    const [result, setResult] = useState<{ number?: string; name?: string; status: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const check = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const number = new FormData(event.currentTarget).get("number")?.toString().trim().toUpperCase() ?? "";
        setLoading(true);
        try {
            const response = await fetch(`/api/pendaftaran?number=${encodeURIComponent(number)}`);
            const data = (await response.json()) as {
                registration?: { number?: string; name?: string; status: string };
                error?: string;
            };
            if (response.ok && data.registration) {
                setResult({
                    number: data.registration.number ?? number,
                    name: data.registration.name,
                    status: data.registration.status ?? "Status belum tersedia.",
                });
            } else {
                setResult({ status: data.error ?? "Nomor pendaftaran tidak ditemukan." });
            }
        } catch {
            setResult({ status: "Status belum dapat diperiksa. Coba lagi." });
        } finally {
            setLoading(false);
        }
    };

    const statusStyle = result ? getStatusStyle(result.status) : null;
    const StatusIcon = statusStyle?.icon ?? Clock;

    return (
        <SubpageShell
            eyebrow="Pelacakan Pendaftaran"
            title="Cek Status Berkas"
            intro="Masukkan nomor registrasi PPDB kamu untuk memantau status verifikasi secara real-time."
        >
            <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-14">
                <Panel>
                    <form onSubmit={check} className="space-y-4">
                        <label className="block text-[13px] font-bold text-ink">
                            Nomor Registrasi PPDB
                            <div className="relative mt-2">
                                <Search
                                    size={18}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                                />
                                <input
                                    required
                                    name="number"
                                    placeholder="Contoh: BM26-1A2B3C4D5E6F7890"
                                    className="block w-full rounded-xl border border-neutral-300 bg-paper py-3.5 pl-11 pr-4 text-sm font-semibold uppercase outline-none"
                                />
                            </div>
                        </label>
                        <button
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1E293B] disabled:opacity-60"
                            style={{ color: "#ffffff" }}
                        >
                            <Search size={16} className="text-[#38BDF8]" />
                            <span>{loading ? "Memeriksa Data..." : "Periksa Status Pendaftaran"}</span>
                        </button>
                    </form>

                    {result && statusStyle && (
                        <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-300 bg-paper-soft">
                            {result.name && (
                                <div className="bg-[#0F172A] px-5 py-4 text-white">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#38BDF8]">
                                        {result.number}
                                    </span>
                                    <h3 className="mt-0.5 text-lg font-extrabold text-white">{result.name}</h3>
                                </div>
                            )}
                            <div className="p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                    Status Verifikasi Saat Ini
                                </p>
                                <div
                                    className="mt-2.5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold"
                                    style={{
                                        backgroundColor: statusStyle.bg,
                                        color: statusStyle.text,
                                        border: `1px solid ${statusStyle.border}`,
                                    }}
                                >
                                    <StatusIcon size={15} />
                                    <span>{result.status}</span>
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-neutral-700 sm:text-sm">
                                    {statusStyle.desc}
                                </p>
                                {result.number && (
                                    <div className="mt-4 border-t border-neutral-300 pt-4">
                                        <Link
                                            href={`/ppdb/tiket?number=${encodeURIComponent(result.number)}`}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#2563EB]"
                                            style={{ color: "#ffffff" }}
                                        >
                                            <Ticket size={15} />
                                            <span>Lihat & Cetak Kartu Peserta</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Panel>
            </section>
        </SubpageShell>
    );
}

