"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Printer, Search, ArrowLeft } from "lucide-react";
import { Panel, SubpageShell } from "@/app/components/subpage-shell";

type Registration = { number: string; name: string; status: string };

function getStatusPill(status: string) {
    switch (status) {
        case "Lulus verifikasi":
        case "Diterima":
            return { color: "#15803D", bg: "#DCFCE7" };
        case "Menunggu verifikasi":
            return { color: "#D97706", bg: "#FEF3C7" };
        case "Berkas tidak lengkap":
        case "Berkas dikembalikan":
        case "Revisi berkas":
            return { color: "#EA580C", bg: "#FFEDD5" };
        case "Tidak lulus verifikasi":
            return { color: "#DC2626", bg: "#FEE2E2" };
        default:
            return { color: "#1D4ED8", bg: "#EFF6FF" };
    }
}

function RegistrationCardContent() {
    const searchParams = useSearchParams();
    const number = searchParams.get("number")?.toUpperCase() ?? "";
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(Boolean(number));

    useEffect(() => {
        if (!number) {
            setLoading(false);
            return;
        }
        let active = true;
        setLoading(true);
        fetch(`/api/pendaftaran?number=${encodeURIComponent(number)}`)
            .then(async (response) =>
                response.ok ? ((await response.json()) as { registration: Registration }) : null
            )
            .then((data) => {
                if (active) setRegistration(data?.registration ?? null);
            })
            .catch(() => undefined)
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [number]);

    if (!number || (!loading && !registration)) {
        return (
            <SubpageShell
                eyebrow="Kartu Pendaftaran"
                title={!number ? "Lihat Kartu Pendaftaran" : "Data Tidak Ditemukan"}
                intro={
                    !number
                        ? "Masukkan nomor pendaftaran kamu untuk melihat atau mencetak kartu bukti registrasi."
                        : "Pastikan nomor pendaftaran yang dimasukkan sudah benar."
                }
            >
                <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-14">
                    <Panel>
                        {!number ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const val = formData.get("number")?.toString().trim().toUpperCase() ?? "";
                                    window.location.href = `/ppdb/tiket?number=${encodeURIComponent(val)}`;
                                }}
                                className="space-y-4"
                            >
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
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#2563EB]"
                                    style={{ color: "#ffffff" }}
                                >
                                    <Search size={16} />
                                    <span>Cari Kartu Peserta</span>
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/ppdb/tiket"
                                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-paper px-4 py-2.5 text-xs font-bold text-ink hover:bg-paper-soft sm:text-sm"
                                >
                                    <ArrowLeft size={15} />
                                    <span>Cari Nomor Lain</span>
                                </Link>
                                <Link
                                    href="/ppdb/daftar"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white shadow-sm sm:text-sm"
                                    style={{ color: "#ffffff" }}
                                >
                                    <span>Daftar Baru</span>
                                </Link>
                            </div>
                        )}
                    </Panel>
                </section>
            </SubpageShell>
        );
    }

    if (loading || !registration) {
        return (
            <SubpageShell eyebrow="Kartu Pendaftaran" title="Memuat Kartu...">
                <section className="mx-auto max-w-xl px-4 py-14 sm:px-8">
                    <Panel>
                        <p className="text-center text-sm font-semibold text-neutral-600">
                            Menyiapkan kartu peserta PPDB...
                        </p>
                    </Panel>
                </section>
            </SubpageShell>
        );
    }

    const qrUrl = `https://quickchart.io/qr?size=180&text=${encodeURIComponent(`PPDB SMK Bani Masum - ${registration.number}`)}`;
    const pill = getStatusPill(registration.status);

    return (
        <SubpageShell
            eyebrow="Kartu Pendaftaran"
            title="Kartu Peserta PPDB"
            intro="Simpan atau cetak kartu ini sebagai bukti pendaftaran resmi SMK Bani Masum."
        >
            <style type="text/css" media="print">{`
                body * { visibility: hidden; }
                #printable-card, #printable-card * { visibility: visible; }
                #printable-card {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    border: 1px solid #e2e8f0 !important;
                    box-shadow: none !important;
                }
            `}</style>
            <section className="mx-auto max-w-2xl px-4 py-10 sm:px-8 sm:py-14">
                <Panel className="overflow-hidden p-0 sm:p-0">
                    <div id="printable-card" className="overflow-hidden rounded-2xl bg-paper">
                        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] p-6 text-white sm:p-8">
                            <div>
                                <span className="inline-block rounded-full border border-[#38BDF8]/40 bg-[#2563EB]/30 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#38BDF8]">
                                    KARTU BUKTI REGISTRASI • 2026/2027
                                </span>
                                <h2 className="mt-2 font-black tracking-tight text-2xl text-white sm:text-3xl">
                                    SMK BANI MASUM
                                </h2>
                                <p className="mt-0.5 text-xs font-medium text-slate-400">
                                    NPSN: 69888774 • Subang, Jawa Barat
                                </p>
                            </div>
                            <div className="rounded-2xl border-2 border-[#38BDF8] bg-white p-1.5 shadow-md">
                                <img
                                    src={qrUrl}
                                    alt="QR code kartu pendaftaran"
                                    width={84}
                                    height={84}
                                    className="h-[84px] w-[84px] rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="p-6 sm:p-8">
                            <dl className="grid gap-5 text-sm sm:grid-cols-2">
                                <div className="rounded-xl border border-neutral-300 bg-paper-soft p-4">
                                    <dt className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        Nomor Pendaftaran
                                    </dt>
                                    <dd className="mt-1 font-black tracking-tight text-xl text-primary sm:text-2xl">
                                        {registration.number}
                                    </dd>
                                </div>
                                <div className="rounded-xl border border-neutral-300 bg-paper-soft p-4">
                                    <dt className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        Nama Calon Siswa
                                    </dt>
                                    <dd className="mt-1 text-base font-extrabold text-ink">{registration.name}</dd>
                                </div>
                                <div className="rounded-xl border border-neutral-300 bg-paper-soft p-4">
                                    <dt className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        Status Verifikasi
                                    </dt>
                                    <dd className="mt-1.5">
                                        <span
                                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold"
                                            style={{ backgroundColor: pill.bg, color: pill.color }}
                                        >
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: pill.color }}
                                            />
                                            {registration.status}
                                        </span>
                                    </dd>
                                </div>
                                <div className="rounded-xl border border-neutral-300 bg-paper-soft p-4">
                                    <dt className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                        Tanggal Cetak
                                    </dt>
                                    <dd className="mt-1 font-bold text-ink">
                                        {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date())}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-300 bg-paper-soft px-6 py-4 sm:px-8">
                        <Link
                            href="/ppdb/cek-status"
                            className="text-xs font-bold text-neutral-600 hover:text-primary sm:text-sm"
                        >
                            ← Cek Status Berkas
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2563EB] sm:text-sm"
                            style={{ color: "#ffffff" }}
                        >
                            <Printer size={16} />
                            <span>Cetak Kartu Peserta</span>
                        </button>
                    </div>
                </Panel>
            </section>
        </SubpageShell>
    );
}

export default function RegistrationCardPage() {
    return (
        <Suspense
            fallback={
                <SubpageShell eyebrow="Kartu Pendaftaran" title="Memuat Kartu...">
                    <section className="mx-auto max-w-xl px-5 py-14 sm:px-8">
                        <Panel>
                            <p>Menyiapkan kartu pendaftaran.</p>
                        </Panel>
                    </section>
                </SubpageShell>
            }
        >
            <RegistrationCardContent />
        </Suspense>
    );
}

