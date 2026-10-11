import Link from "next/link";
import Image from "next/image";
import { Float, Reveal } from "@/app/components/motion";
import TechBackground from "@/app/components/tech-background";
import MajorSelector from "./components/major-selector";
import Header from "./components/header";
import { cookies } from "next/headers";
import {
    CheckCircle2,
    Ticket,
    Search,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";

const advantages = [
    ["01", "Guru Berpengalaman", "Diajar tenaga pendidik yang paham kebutuhan industri, bukan cuma teori di buku."],
    ["02", "Praktik Langsung", "Jam praktik lebih banyak, plus kesempatan magang di perusahaan mitra."],
    ["03", "Fasilitas Lengkap", "Lab komputer, bengkel, dan ruang praktik yang terus diperbarui."],
    ["04", "Alumni Terserap Kerja", "Jaringan alumni dan mitra industri membantu lulusan mendapat pekerjaan."],
];
const achievements = [
    ["Juara 2 Bahasa Indonesia tingkat nasional", "Prestasi siswa dalam kompetisi Bahasa Indonesia.", "/juara2bindo.jpeg"],
    ["Juara 2 Sains tingkat nasional", "Prestasi siswa dalam kompetisi sains.", "/juara2sains.jpeg"],
    ["Juara 3 Bahasa Indonesia tingkat nasional", "Prestasi siswa dalam kompetisi Bahasa Indonesia.", "/juara3bindo.jpeg"],
    ["Gema Pramuka", "Prestasi siswa dalam kegiatan Gema Pramuka.", "/gema.jpeg"],
];
const activities = [
    ["Kumpul Pagi", "Kegiatan apel pagi untuk membangun kedisiplinan dan semangat siswa.", "/kumpul_pagi.jpeg"],
    ["Kegiatan Literasi", "Membiasakan siswa membaca untuk memperluas wawasan dan pengetahuan.", "/literasi.jpeg"],
    ["Pembelajaran di Kelas", "Suasana belajar yang interaktif dan nyaman di ruang kelas.", "/pembelajaran.jpeg"],
    ["Kegiatan Pembelajaran OOP", "Siswa belajar kerja secara tim dan mengembangkan suatu software.", "/kegiatan1.jpeg"],
    ["Praktik Jurusan RPL", "Praktik langsung di lab komputer untuk jurusan Rekayasa Perangkat Lunak.", "/praktek_rpl.jpeg"],
    ["Praktik Jurusan TBSM", "Pembelajaran membongkar dan merakit mesin sepeda motor secara profesional.", "/praktek_tbsm.jpeg"],
    ["Praktik Perbengkelan", "Mengasah keterampilan mekanik untuk siap terjun ke dunia kerja.", "/praktek_tbsm2.jpeg"],
];
const steps = [
    ["01", "Isi Formulir", "Lengkapi data diri, data orang tua, dan pilih jurusan."],
    ["02", "Upload Dokumen", "Unggah KK, akta lahir, ijazah/SKL, dan pas foto."],
    ["03", "Verifikasi Berkas", "Panitia memeriksa kelengkapan dokumen kamu."],
    ["04", "Pengumuman", "Cek status kelulusan pakai nomor pendaftaran."],
];
const requirements = [
    "Fotokopi Kartu Keluarga (KK)",
    "Fotokopi Akta Kelahiran",
    "Ijazah / Surat Keterangan Lulus",
    "Pas foto terbaru 3x4 (2 lembar)",
    "Fotokopi rapor terakhir",
    "Nomor HP aktif orang tua/wali",
];

function StudentArt() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#1E293B]/90 p-4 shadow-2xl backdrop-blur-sm">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]">
                <Image
                    src="/siswa-berseragam.png"
                    alt="Siswa SMK Bani Masum berseragam"
                    width={768}
                    height={768}
                    className="relative aspect-square w-full object-cover"
                    priority
                />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0F172A]/90 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-xs font-extrabold tracking-wide text-white">SIAP KERJA & BERKARYA</span>
                </div>
                <span className="rounded-lg bg-[#2563EB]/30 px-2.5 py-0.5 text-[11px] font-bold text-[#38BDF8]">
                    NPSN: 69888774
                </span>
            </div>
        </div>
    );
}

export default async function Home() {
    const cookieStore = await cookies();
    const registrationNumber = cookieStore.get("registration_number")?.value;

    return (
        <main className="min-h-screen bg-paper-soft">
            <Header />

            {/* Flutter-Style Dark Navy & Royal Blue Hero Banner */}
            <section className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-[#0F172A] via-[#0F172A] to-[#1E3A8A] py-12 text-white shadow-xl sm:rounded-b-[44px] sm:py-16 lg:py-20">
                <TechBackground />
                <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
                    <Reveal>
                        <div className="lg:max-w-2xl">
                            <h1 className="font-black tracking-tight text-3xl leading-[1.08] text-white sm:text-5xl lg:text-6xl">
                                Wujudkan Masa Depanmu Mulai dari{" "}
                                <span className="text-[#38BDF8]">SMK Bani Masum!</span>
                            </h1>

                            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-7">
                                Belajar keahlian yang benar-benar dipakai di dunia kerja, dari praktik nyata di lab dan bengkel sampai bimbingan guru yang siap mendampingi kamu sampai lulus.
                            </p>

                            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <Link
                                    href="/ppdb/daftar"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
                                    style={{ color: "#ffffff" }}
                                >
                                    <span>Daftar Sekarang</span>
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    href="/ppdb/cek-status"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-center text-sm font-bold text-white backdrop-blur-xs transition-all hover:-translate-y-0.5 hover:bg-white/15"
                                    style={{ color: "#ffffff" }}
                                >
                                    <Search size={16} className="text-[#38BDF8]" />
                                    <span>Cek Status Berkas</span>
                                </Link>
                                <Link
                                    href={registrationNumber ? `/ppdb/tiket?number=${registrationNumber}` : "/ppdb/tiket"}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D97706] px-5 py-3.5 text-center text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#B45309]"
                                    style={{ color: "#ffffff" }}
                                >
                                    <Ticket size={16} />
                                    <span>Lihat Tiket Kamu</span>
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                    <Float className="w-full lg:max-w-md lg:justify-self-end">
                        <StudentArt />
                    </Float>
                </div>
            </section>

            {/* Keunggulan Section */}
            <section id="keunggulan" className="py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal>
                        <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl text-ink">
                            Bukan Cuma Sekolah, Tapi Bekal Kerja
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
                            Empat keunggulan utama yang menyiapkan lulusan kami siap terjun ke dunia kerja maupun lanjut kuliah.
                        </p>
                    </Reveal>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {advantages.map(([number, title, text], index) => (
                            <Reveal key={title} className="h-full" delay={index * 0.08}>
                                <article className="flex h-full flex-col rounded-2xl border border-neutral-300 bg-paper p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft font-black text-base text-primary">
                                            {number}
                                        </span>
                                        <ShieldCheck size={18} className="text-primary/60" />
                                    </div>
                                    <h3 className="mt-4 text-base font-extrabold text-ink">{title}</h3>
                                    <p className="mt-2 text-xs leading-relaxed text-neutral-700 sm:text-sm">{text}</p>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Prestasi dan Kegiatan Section */}
            <section id="prestasi-kegiatan" className="border-t border-neutral-300 py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal>
                        <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl text-ink">
                            Prestasi dan Kegiatan Siswa
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
                            Ruang untuk mengembangkan bakat, meraih pencapaian nasional, dan membangun karakter.
                        </p>
                    </Reveal>

                    <div className="mt-8">
                        <Reveal>
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1.5 rounded-full bg-[#1D4ED8]" />
                                <h3 className="font-extrabold tracking-tight text-xl sm:text-2xl text-ink">
                                    Prestasi Siswa
                                </h3>
                            </div>
                        </Reveal>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {achievements.map(([title, description, src], index) => (
                                <Reveal key={title} className="h-full" delay={index * 0.08}>
                                    <article className="h-full overflow-hidden rounded-2xl border border-neutral-300 bg-paper shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                                        <div className="relative aspect-[4/3]">
                                            <Image
                                                src={src}
                                                alt={title}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <span className="inline-block rounded-md bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-extrabold text-[#15803D] uppercase">
                                                Prestasi
                                            </span>
                                            <h4 className="mt-2 text-sm font-extrabold text-ink sm:text-base">{title}</h4>
                                            <p className="mt-1.5 text-xs leading-relaxed text-neutral-700">{description}</p>
                                        </div>
                                    </article>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10">
                        <Reveal>
                            <div className="flex items-center gap-2">
                                <span className="h-5 w-1.5 rounded-full bg-[#38BDF8]" />
                                <h3 className="font-extrabold tracking-tight text-xl sm:text-2xl text-ink">
                                    Kegiatan Sekolah & Praktik
                                </h3>
                            </div>
                        </Reveal>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {activities.map(([title, description, src], index) => (
                                <Reveal key={title} className="h-full" delay={index * 0.08}>
                                    <article className="h-full overflow-hidden rounded-2xl border border-neutral-300 bg-paper shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                                        <div className="relative aspect-[4/3]">
                                            <Image
                                                src={src}
                                                alt={title}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <span className="inline-block rounded-md bg-primary-soft px-2 py-0.5 text-[10px] font-extrabold text-primary uppercase">
                                                Kegiatan
                                            </span>
                                            <h4 className="mt-2 text-sm font-extrabold text-ink sm:text-base">{title}</h4>
                                            <p className="mt-1.5 text-xs leading-relaxed text-neutral-700">{description}</p>
                                        </div>
                                    </article>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Jurusan Section */}
            <section id="jurusan" className="border-t border-neutral-300 py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal>
                        <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl text-ink">
                            Pilih Jurusan Sesuai Minatmu
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-700 sm:text-base">
                            Klik kartu jurusan di bawah untuk melihat prospek karir dan fasilitas laboratorium/bengkel.
                        </p>
                    </Reveal>
                    <MajorSelector />
                </div>
            </section>

            {/* Alur Pendaftaran Section */}
            <section id="alur" className="border-t border-neutral-300 py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal>
                        <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl text-ink">
                            4 Langkah Sampai Resmi Jadi Siswa
                        </h2>
                    </Reveal>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map(([number, title, text], index) => (
                            <Reveal key={number} delay={index * 0.08} className="h-full">
                                <article className="flex h-full flex-col rounded-2xl border border-neutral-300 bg-paper p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] font-black text-sm text-[#38BDF8]">
                                            {number}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                            Langkah {index + 1}
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-base font-extrabold text-ink">{title}</h3>
                                    <p className="mt-2 text-xs leading-relaxed text-neutral-700 sm:text-sm">{text}</p>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Jadwal PPDB Section */}
            <section id="jadwal" className="border-t border-neutral-300 py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal>
                        <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl text-ink">
                            Jangan Sampai Kelewat Tanggal
                        </h2>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-300 bg-paper shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                                    <thead className="bg-[#0F172A] text-white">
                                        <tr>
                                            <th className="px-5 py-4 font-extrabold text-sm text-white">Tahapan Seleksi</th>
                                            <th className="px-5 py-4 font-extrabold text-sm text-[#38BDF8]">Gelombang 1</th>
                                            <th className="px-5 py-4 font-extrabold text-sm text-[#10B981]">Gelombang 2</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-300">
                                        {[
                                            ["Pendaftaran online", "2 Feb – 28 Feb", "3 Mar – 30 Apr"],
                                            ["Verifikasi berkas", "1 Mar – 5 Mar", "1 Mei – 5 Mei"],
                                            ["Pengumuman kelulusan", "10 Mar", "10 Mei"],
                                            ["Daftar ulang & seragam", "11 – 15 Mar", "11 – 15 Mei"],
                                        ].map((row) => (
                                            <tr key={row[0]} className="hover:bg-paper-soft transition-colors">
                                                <td className="px-5 py-4 font-bold text-ink">{row[0]}</td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
                                                        {row[1]}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex rounded-lg bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#15803D]">
                                                        {row[2]}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Syarat Pendaftaran Section */}
            <section id="syarat" className="border-t border-neutral-300 py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal>
                        <h2 className="font-extrabold tracking-tight text-3xl sm:text-4xl text-ink">
                            Siapkan Dokumen Ini
                        </h2>
                    </Reveal>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {requirements.map((item, index) => (
                            <Reveal key={item} delay={index * 0.06}>
                                <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-300 bg-paper p-4 shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
                                        <CheckCircle2 size={18} />
                                    </span>
                                    <span className="text-sm font-bold text-ink">{item}</span>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <Reveal>
                        <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] px-6 py-12 text-center text-white shadow-xl sm:px-12">
                            <h2 className="font-black tracking-tight text-3xl text-white sm:text-5xl">
                                Siap Gabung Angkatan Baru?
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-200 sm:text-base">
                                Isi formulir pendaftaran online sekarang dari HP atau laptop, cuma butuh kurang dari 10 menit.
                            </p>
                            <div className="mt-7 flex flex-wrap justify-center gap-3">
                                <Link
                                    href="/ppdb/daftar"
                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-[#0F172A] shadow-md transition-transform hover:-translate-y-0.5"
                                    style={{ color: "#0F172A" }}
                                >
                                    <span className="text-[#0F172A]">Mulai Daftar Online</span>
                                    <ArrowRight size={16} className="text-[#1D4ED8]" />
                                </Link>
                                <Link
                                    href="/faq"
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:bg-white/20"
                                    style={{ color: "#ffffff" }}
                                >
                                    <span>Bantuan & FAQ</span>
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Dark Navy Footer matching Flutter AppTheme.dark */}
            <footer className="border-t border-white/10 bg-[#0F172A] py-12 text-white">
                <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-8 px-5 sm:px-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#38BDF8] bg-white p-1">
                                <Image src="/logo.png" alt="Logo SMK Bani Masum" fill sizes="40px" className="object-contain p-0.5" />
                            </span>
                            <div>
                                <div className="font-black tracking-wide text-lg text-white">SMK BANI MASUM</div>
                                <div className="text-[10px] font-bold tracking-wider text-[#38BDF8] uppercase">
                                    NPSN: 69888774 • SUBANG, JAWA BARAT
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-xs leading-6 text-slate-400 sm:text-sm">
                            Sekretariat PPDB SMK Bani Masum<br />
                            Email: ppdb@banimasum.sch.id • Hotline WA: 0812-3456-7890
                        </p>
                    </div>
                    <nav className="flex flex-wrap items-center gap-3 text-xs font-bold sm:gap-5 sm:text-sm">
                        <Link href="/tentang" className="text-slate-300 hover:text-[#38BDF8]">Tentang</Link>
                        <Link href="/jurusan" className="text-slate-300 hover:text-[#38BDF8]">Jurusan</Link>
                        <Link href="/ppdb" className="text-slate-300 hover:text-[#38BDF8]">Info PPDB</Link>
                        <Link href="/ppdb/cek-status" className="text-slate-300 hover:text-[#38BDF8]">Cek Status</Link>
                        <Link href="/ppdb/tiket" className="text-slate-300 hover:text-[#38BDF8]">Cetak Kartu</Link>
                        <Link href="/faq" className="text-slate-300 hover:text-[#38BDF8]">FAQ</Link>
                        <Link href="/admin" className="rounded-lg border border-white/15 bg-[#1E293B] px-3 py-1.5 text-[#38BDF8] hover:border-[#38BDF8]">
                            Portal Admin
                        </Link>
                    </nav>
                </div>
                <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 px-5 pt-6 text-xs text-slate-400 sm:px-8">
                    © 2026 Panitia PPDB SMK Bani Masum. Semua hak dilindungi.
                </div>
            </footer>
        </main>
    );
}

