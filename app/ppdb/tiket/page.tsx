"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
    Printer,
    Search,
    ArrowLeft,
    Copy,
    Check,
    CheckCircle2,
    Clock,
    AlertTriangle,
    QrCode,
    User,
    FileCheck2,
} from "lucide-react";
import { SubpageShell } from "@/app/components/subpage-shell";

type Registration = {
    number: string;
    name: string;
    status: string;
    major?: string;
    nisn?: string;
    created_at?: string;
    photo_url?: string | null;
    phone?: string;
    birth_date?: string;
};

function getStatusBadge(status: string) {
    switch (status) {
        case "Lulus verifikasi":
        case "Diterima":
            return {
                label: "Lulus Verifikasi",
                color: "#15803D",
                bg: "#DCFCE7",
                border: "#BBF7D0",
                icon: CheckCircle2,
            };
        case "Menunggu verifikasi":
            return {
                label: "Menunggu Verifikasi",
                color: "#B45309",
                bg: "#FEF3C7",
                border: "#FDE68A",
                icon: Clock,
            };
        case "Berkas tidak lengkap":
        case "Berkas dikembalikan":
        case "Revisi berkas":
            return {
                label: "Perlu Revisi Berkas",
                color: "#C2410C",
                bg: "#FFEDD5",
                border: "#FED7AA",
                icon: AlertTriangle,
            };
        case "Tidak lulus verifikasi":
            return {
                label: "Tidak Lulus",
                color: "#B91C1C",
                bg: "#FEE2E2",
                border: "#FECACA",
                icon: AlertTriangle,
            };
        default:
            return {
                label: status,
                color: "#1D4ED8",
                bg: "#EFF6FF",
                border: "#BFDBFE",
                icon: CheckCircle2,
            };
    }
}

function RegistrationCardContent() {
    const searchParams = useSearchParams();
    const number = searchParams.get("number")?.toUpperCase() ?? "";
    const [registration, setRegistration] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(Boolean(number));
    const [copied, setCopied] = useState(false);

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

    const handleCopy = () => {
        if (!registration?.number) return;
        navigator.clipboard.writeText(registration.number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!number || (!loading && !registration)) {
        return (
            <SubpageShell
                eyebrow="Kartu Pendaftaran Resmi"
                title={!number ? "Cari Kartu Peserta PPDB" : "Data Tidak Ditemukan"}
                intro={
                    !number
                        ? "Masukkan nomor registrasi pendaftaran (BM26-...) untuk melihat dan mencetak kartu peserta resmi."
                        : "Nomor registrasi yang dimasukkan tidak ditemukan di basis data kami. Mohon periksa kembali formulir pencarian."
                }
            >
                <section className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-14">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                        {!number ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const val = formData.get("number")?.toString().trim().toUpperCase() ?? "";
                                    if (val) {
                                        window.location.href = `/ppdb/tiket?number=${encodeURIComponent(val)}`;
                                    }
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label htmlFor="reg-number-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Nomor Registrasi PPDB
                                    </label>
                                    <div className="relative mt-2">
                                        <Search
                                            size={18}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            id="reg-number-input"
                                            required
                                            name="number"
                                            placeholder="Contoh: BM26-270203496821358F"
                                            className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 font-mono text-sm font-bold uppercase text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                        Nomor registrasi otomatis didapatkan setelah Anda menyelesaikan pengisian formulir pendaftaran online.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2563EB]"
                                    style={{ color: "#ffffff" }}
                                >
                                    <Search size={16} />
                                    <span>Buka Kartu Peserta</span>
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                                    <AlertTriangle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                                    <span>
                                        Nomor pendaftaran <strong>{number}</strong> belum terdaftar atau terdapat kesalahan pengetikan karakter.
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <Link
                                        href="/ppdb/tiket"
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:text-sm"
                                    >
                                        <ArrowLeft size={15} />
                                        <span>Cari Nomor Lain</span>
                                    </Link>
                                    <Link
                                        href="/ppdb/daftar"
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#2563EB] sm:text-sm"
                                        style={{ color: "#ffffff" }}
                                    >
                                        <span>Daftar Sekarang</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </SubpageShell>
        );
    }

    if (loading || !registration) {
        return (
            <SubpageShell eyebrow="Kartu Pendaftaran Resmi" title="Memuat Kartu Peserta...">
                <section className="mx-auto max-w-xl px-4 py-16 sm:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <QrCode size={24} className="animate-pulse" />
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                            Menyiapkan Kartu Peserta Resmi...
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Memverifikasi data pendaftar dari sistem PPDB SMK Bani Masum.
                        </p>
                    </div>
                </section>
            </SubpageShell>
        );
    }

    const qrUrl = `https://quickchart.io/qr?size=220&margin=1&text=${encodeURIComponent(
        `PPDB SMK BANI MASUM 2026/2027\nNomor: ${registration.number}\nNama: ${registration.name}\nStatus: ${registration.status}\nValidasi: https://ppdb-smk-bm.vercel.app/ppdb/tiket?number=${registration.number}`
    )}`;

    const statusBadge = getStatusBadge(registration.status);
    const StatusIcon = statusBadge.icon;

    let formattedRegDate = "Belum terdata";
    if (registration.created_at) {
        try {
            formattedRegDate = new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(new Date(registration.created_at));
        } catch {}
    }

    const printDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());

    return (
        <SubpageShell
            eyebrow="Tanda Bukti Pendaftaran Resmi"
            title="Kartu Peserta PPDB"
            intro="Simpan atau cetak kartu ini sebagai bukti resmi pendaftaran. Wajib dibawa saat mengikuti tes seleksi minat bakat, wawancara, dan verifikasi berkas di kampus SMK Bani Masum."
        >
            {/* Custom Print CSS Rule: Forces pure white paper layout and isolates only the card */}
            <style type="text/css" media="print">{`
                @page {
                    size: A4 portrait;
                    margin: 0.8cm 1.2cm;
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                html, body {
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                }
                /* Hide header, navigation, banner, buttons, and all other page elements */
                body * {
                    visibility: hidden !important;
                }
                /* Show ONLY the official card and its children */
                #printable-card-wrapper,
                #printable-card-wrapper * {
                    visibility: visible !important;
                }
                #printable-card-wrapper {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                }
                .no-print {
                    display: none !important;
                }
                #official-credential-card {
                    box-shadow: none !important;
                    border: 1.5px solid #0f172a !important;
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    border-radius: 8px !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    margin: 0 auto !important;
                    width: 100% !important;
                }
                #official-credential-card,
                #official-credential-card div,
                #official-credential-card article {
                    background-color: #ffffff !important;
                }
            `}</style>

            <section id="printable-card-wrapper" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
                {/* On-Screen Action Toolbar */}
                <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Link
                            href="/ppdb/cek-status"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                            <ArrowLeft size={14} />
                            <span>Cek Status Berkas</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            title="Salin nomor registrasi ke clipboard"
                        >
                            {copied ? (
                                <>
                                    <Check size={14} className="text-emerald-600" />
                                    <span className="text-emerald-600">Tersalin!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={14} className="text-slate-500" />
                                    <span>Salin Nomor</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#2563EB] active:scale-[0.98]"
                            style={{ color: "#ffffff" }}
                        >
                            <Printer size={15} />
                            <span>Cetak Kartu Peserta</span>
                        </button>
                    </div>
                </div>

                {/* ==============================================================
                    OFFICIAL CREDENTIAL CARD (KARTU TANDA PESERTA PPDB RESMI)
                    Document is ALWAYS purely WHITE for authentic paper presentation
                   ============================================================== */}
                <article
                    id="official-credential-card"
                    className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white text-slate-900 shadow-xl"
                    style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
                >
                    {/* 1. KOP SURAT RESMI (OFFICIAL SCHOOL LETTERHEAD) */}
                    <div className="border-b border-slate-200 bg-white p-5 sm:p-7">
                        <div className="flex items-center gap-4 sm:gap-5">
                            {/* School Emblem Logo */}
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs sm:h-18 sm:w-18">
                                <Image
                                    src="/logo.png"
                                    alt="Logo SMK Bani Masum"
                                    fill
                                    sizes="72px"
                                    className="object-contain p-1"
                                    priority
                                />
                            </div>

                            {/* Official Institution Title */}
                            <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 sm:text-xs">
                                    Yayasan Bani Masum Subang
                                </div>
                                <h2 className="font-black tracking-tight text-lg text-slate-900 sm:text-2xl leading-snug">
                                    SMK BANI MASUM
                                </h2>
                                <p className="mt-0.5 text-[11px] font-medium text-slate-600 leading-tight">
                                    NPSN: 69888774 • Terakreditasi • Bidang Keahlian: Teknologi & Rekayasa
                                </p>
                                <p className="text-[10.5px] text-slate-500 leading-tight">
                                    Jalan Raya Subang • Subang, Jawa Barat 41211 • Website: smkbanimasum.sch.id
                                </p>
                            </div>
                        </div>

                        {/* Official Document Double Rule */}
                        <div className="mt-4 border-b-2 border-slate-900" />
                        <div className="mt-0.5 border-b border-slate-300" />

                        {/* Official Card Title Ribbon */}
                        <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-black tracking-wider text-blue-800 uppercase">
                                <FileCheck2 size={13} />
                                Kartu Tanda Peserta Seleksi PPDB
                            </span>
                            <span className="text-xs font-bold text-slate-600">
                                Tahun Ajaran 2026/2027
                            </span>
                        </div>
                    </div>

                    {/* 2. CARD BODY: PHOTO, DATA CREDENTIALS, AND QR VERIFICATION */}
                    <div className="p-5 sm:p-7 space-y-6 bg-white">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:items-start">
                            {/* Left Side: Student Photo (3x4) and Verification QR Code */}
                            <div className="flex flex-row justify-around sm:col-span-4 sm:flex-col sm:items-center sm:justify-start gap-4">
                                {/* Student 3x4 Pas Foto */}
                                <div className="flex flex-col items-center">
                                    <div className="relative flex aspect-[3/4] w-28 items-center justify-center overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 shadow-xs sm:w-32">
                                        {registration.photo_url ? (
                                            <img
                                                src={registration.photo_url}
                                                alt={`Pas foto ${registration.name}`}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-3 text-center">
                                                <User size={32} className="text-slate-400" />
                                                <span className="mt-1 text-[10px] font-bold tracking-tight text-slate-500">
                                                    PAS FOTO
                                                </span>
                                                <span className="text-[9px] text-slate-400">
                                                    3x4 (Ditempel)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="mt-1.5 text-[10px] font-semibold text-slate-500">
                                        Foto Peserta
                                    </span>
                                </div>

                                {/* Committee QR Verification */}
                                <div className="flex flex-col items-center">
                                    <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs">
                                        <img
                                            src={qrUrl}
                                            alt="QR code validasi kartu"
                                            width={100}
                                            height={100}
                                            className="h-24 w-24 object-contain sm:h-26 sm:w-26"
                                        />
                                    </div>
                                    <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        Scan Validasi
                                    </span>
                                </div>
                            </div>

                            {/* Right Side: Credential Details Table */}
                            <div className="sm:col-span-8">
                                <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                                    {/* Nomor Registrasi */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-1">
                                        <span className="text-xs font-bold text-slate-500">
                                            Nomor Registrasi
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm sm:text-base font-black text-blue-700">
                                                {registration.number}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Nama Calon Siswa */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-1">
                                        <span className="text-xs font-bold text-slate-500">
                                            Nama Calon Siswa
                                        </span>
                                        <span className="text-sm sm:text-base font-black uppercase text-slate-900">
                                            {registration.name}
                                        </span>
                                    </div>

                                    {/* NISN */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-1">
                                        <span className="text-xs font-bold text-slate-500">
                                            NISN Siswa
                                        </span>
                                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-800">
                                            {registration.nisn || "-"}
                                        </span>
                                    </div>

                                    {/* Pilihan Jurusan */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-1">
                                        <span className="text-xs font-bold text-slate-500">
                                            Pilihan Kompetensi
                                        </span>
                                        <span className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-800">
                                            {registration.major || "RPL - Rekayasa Perangkat Lunak"}
                                        </span>
                                    </div>

                                    {/* Status Verifikasi */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-1">
                                        <span className="text-xs font-bold text-slate-500">
                                            Status Verifikasi
                                        </span>
                                        <span
                                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold"
                                            style={{
                                                backgroundColor: statusBadge.bg,
                                                borderColor: statusBadge.border,
                                                color: statusBadge.color,
                                            }}
                                        >
                                            <StatusIcon size={12} />
                                            <span>{statusBadge.label}</span>
                                        </span>
                                    </div>

                                    {/* Tanggal Mendaftar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-1">
                                        <span className="text-xs font-bold text-slate-500">
                                            Tanggal Terdaftar
                                        </span>
                                        <span className="text-xs font-bold text-slate-700">
                                            {formattedRegDate}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. KETENTUAN & TATA TERTIB SELEKSI PPDB */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed">
                            <div className="font-black uppercase tracking-wider text-[11px] text-slate-700 mb-1.5">
                                Petunjuk & Tata Tertib Peserta Seleksi:
                            </div>
                            <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11.5px]">
                                <li>
                                    Kartu tanda peserta ini <strong>wajib dibawa dan ditunjukkan</strong> kepada panitia saat pelaksanaan tes minat bakat dan wawancara di SMK Bani Masum.
                                </li>
                                <li>
                                    Peserta mengenakan seragam sekolah asal lengkap, sopan, bersepatu rapi, dan hadir 15 menit sebelum jadwal seleksi dimulai.
                                </li>
                                <li>
                                    Bawa berkas fisik asli (Fotokopi KK, Akta Kelahiran, Rapor/SKL, dan Pas Foto 3x4) untuk verifikasi langsung oleh panitia PPDB.
                                </li>
                            </ol>
                        </div>

                        {/* 4. OFFICIAL LEGALIZATION & SIGNATURE BLOCK */}
                        <div className="pt-2 grid grid-cols-2 gap-4 text-center text-xs bg-white">
                            <div className="flex flex-col justify-between h-28">
                                <span className="font-semibold text-slate-500">
                                    Tanda Tangan Calon Siswa,
                                </span>
                                <div className="font-bold text-slate-900">
                                    ( {registration.name.toUpperCase()} )
                                </div>
                            </div>

                            <div className="flex flex-col justify-between h-28 items-center">
                                <div className="text-slate-600 font-semibold leading-tight">
                                    Subang, {printDate}
                                    <br />
                                    Panitia PPDB SMK Bani Masum,
                                </div>

                                {/* Official Verification Stamp Badge */}
                                <div className="relative inline-flex items-center gap-1 rounded-md border border-emerald-600/40 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                                    <CheckCircle2 size={11} className="text-emerald-600" />
                                    <span>Sah / Dokumen Resmi</span>
                                </div>

                                <div className="font-bold text-slate-900">
                                    ( Panitia Penerimaan Siswa Baru )
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </section>
        </SubpageShell>
    );
}

export default function RegistrationCardPage() {
    return (
        <Suspense
            fallback={
                <SubpageShell eyebrow="Kartu Pendaftaran Resmi" title="Memuat Kartu Peserta...">
                    <section className="mx-auto max-w-xl px-5 py-16 sm:px-8">
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                Menyiapkan kartu pendaftaran resmi...
                            </p>
                        </div>
                    </section>
                </SubpageShell>
            }
        >
            <RegistrationCardContent />
        </Suspense>
    );
}
