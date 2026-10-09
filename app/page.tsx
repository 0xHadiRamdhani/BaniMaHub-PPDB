import Link from "next/link";
import Image from "next/image";
import { Float, Reveal, StaggerGroup, StaggerItem } from "@/app/components/motion";
import TechBackground from "@/app/components/tech-background";
import { ThemeToggle } from "./components/theme-toggle";
import MajorSelector from "./components/major-selector";
import Header from "./components/header";
import { cookies } from "next/headers";

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
const requirements = ["Fotokopi Kartu Keluarga (KK)", "Fotokopi Akta Kelahiran", "Ijazah / Surat Keterangan Lulus", "Pas foto terbaru 3x4 (2 lembar)", "Fotokopi rapor terakhir", "Nomor HP aktif orang tua/wali"];

function StudentArt() {
    return <div className="relative border border-neutral-300 bg-paper-soft p-5 shadow-lg rounded-2xl">
        <div className="absolute right-4 top-4 h-20 w-20 rounded-full halftone opacity-40" />
        <Image src="/siswa-berseragam.png" alt="Siswa SMK Bani Masum berseragam" width={768} height={768} className="relative aspect-square w-full object-cover" priority />
        <div className="absolute bottom-4 left-4 border border-neutral-300 rounded-md bg-paper px-3 py-2 text-xs font-extrabold">SIAP BERKARYA</div>
    </div>;
}

export default async function Home() {
    const cookieStore = await cookies();
    const registrationNumber = cookieStore.get("registration_number")?.value;

    return <main>
        <Header />

        <section className="relative overflow-hidden border-b border-neutral-300 py-10 sm:py-16 lg:py-20"><TechBackground /><div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:gap-10 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <Reveal><div className="lg:max-w-2xl"><h1 className="font-extrabold tracking-tight text-4xl leading-[.98] sm:text-7xl">Wujudkan Masa Depanmu Mulai dari SMK Bani Masum!</h1><p className="mt-5 max-w-xl text-base leading-7 text-ink/80 sm:text-lg sm:leading-8">Belajar keahlian yang benar-benar dipakai di dunia kerja, dari praktik nyata sampai bimbingan guru yang siap mendampingi kamu sampai lulus.</p><div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-4"><Link href="/ppdb/daftar" className="rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg  bg-primary px-6 py-3 text-center font-bold text-[#ffffff] shadow-md rounded-xl " style={{ color: "#ffffff" }}>Daftar Sekarang</Link><a href="#jurusan" className="rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg  bg-paper px-6 py-3 text-center font-bold text-primary shadow-md rounded-xl" style={{ color: "var(--btn-secondary-text)" }}>Lihat Jurusan</a><Link href={registrationNumber ? `/ppdb/tiket?number=${registrationNumber}` : "/ppdb/tiket"} className="rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg bg-amber-500 px-6 py-3 text-center font-bold text-white shadow-md rounded-xl">Lihat Tiket Kamu</Link></div></div></Reveal>
            <Float className="w-full lg:max-w-125 lg:justify-self-end"><StudentArt /></Float>
        </div></section>

        <section id="keunggulan" className="border-b border-neutral-300 py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-8"><Reveal><p className="mb-2 text-xs font-extrabold uppercase tracking-wide">Kenapa SMK Bani Masum</p><h2 className="font-extrabold tracking-tight text-4xl sm:text-5xl">Bukan Cuma Sekolah, Tapi Bekal Kerja</h2><p className="mt-3 max-w-2xl leading-7 text-neutral-700">Empat hal yang bikin lulusan kami siap terjun ke dunia kerja maupun lanjut kuliah.</p></Reveal><div className="mt-8 grid gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5 lg:auto-rows-fr lg:grid-cols-4">{advantages.map(([number, title, text], index) => <Reveal key={title} className="h-full lg:h-57.5" delay={index * 0.1}><article className="flex h-full flex-col border border-neutral-300 bg-paper p-5 shadow-md rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30"><span className="font-extrabold tracking-tight text-4xl">{number}</span><h3 className="mt-4 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-neutral-700">{text}</p></article></Reveal>)}</div></div></section>

        <section id="prestasi-kegiatan" className="border-b border-neutral-300 bg-paper-soft py-12 sm:py-16"><div className="mx-auto max-w-7xl px-4 sm:px-8"><Reveal><p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-primary" style={{ color: "var(--btn-secondary-text)" }}>Di Luar Kelas</p><h2 className="font-extrabold tracking-tight text-4xl sm:text-5xl">Prestasi dan Kegiatan</h2><p className="mt-3 max-w-2xl leading-7 text-neutral-700">Ruang untuk mengembangkan kemampuan, meraih pencapaian, dan belajar bersama.</p></Reveal><div className="mt-8 sm:mt-10"><Reveal><h3 className="font-extrabold tracking-tight text-3xl">Prestasi Siswa</h3></Reveal><div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">{achievements.map(([title, description, src], index) => <Reveal key={title} className="h-full" delay={index * 0.1}><article className="h-full overflow-hidden border border-neutral-300 bg-paper shadow-md rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30"><div className="relative aspect-[4/3]"><Image src={src} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover" /></div><div className="p-3 sm:p-5"><h4 className="text-sm font-extrabold sm:text-lg">{title}</h4><p className="mt-2 text-xs leading-5 text-neutral-700 sm:text-sm sm:leading-6">{description}</p></div></article></Reveal>)}</div></div><div className="mt-8 sm:mt-10"><Reveal><h3 className="font-extrabold tracking-tight text-3xl">Kegiatan Sekolah</h3></Reveal><div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">{activities.map(([title, description, src], index) => <Reveal key={title} className="h-full" delay={index * 0.1}><article className="h-full overflow-hidden border border-neutral-300 bg-paper shadow-md rounded-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30"><div className="relative aspect-[4/3]"><Image src={src} alt={title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover" /></div><div className="p-3 sm:p-5"><h4 className="text-sm font-extrabold sm:text-lg">{title}</h4><p className="mt-2 text-xs leading-5 text-neutral-700 sm:text-sm sm:leading-6">{description}</p></div></article></Reveal>)}</div></div></div></section>

        <section id="jurusan" className="border-b border-neutral-300 bg-paper-soft py-16"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-primary" style={{ color: "var(--btn-secondary-text)" }}>Kompetensi Keahlian</p><h2 className="font-extrabold tracking-tight text-4xl sm:text-5xl">Pilih Jurusan Sesuai Minatmu</h2></Reveal><MajorSelector /></div></section>

        <section id="alur" className="border-b border-neutral-300 py-16"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><p className="mb-2 text-xs font-extrabold uppercase tracking-wide">Cara Mendaftar</p><h2 className="font-extrabold tracking-tight text-4xl sm:text-5xl">4 Langkah Sampai Resmi Jadi Siswa</h2></Reveal><div className="mt-9 grid overflow-hidden border border-neutral-300 rounded-xl sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-4 shadow-md rounded-xl">{steps.map(([number, title, text], index) => <Reveal key={number} delay={index * 0.1} className={`${index < 3 ? "border-b border-neutral-300 lg:border-b-0 lg:border-r border-neutral-300" : ""} ${index % 2 === 0 ? "sm:border-r border-neutral-300 lg:border-r border-neutral-300" : ""} lg:h-65`}><article className="flex h-full flex-col bg-paper p-6"><span className="font-extrabold tracking-tight text-4xl">{number}</span><h3 className="mt-4 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-neutral-700">{text}</p></article></Reveal>)}</div></div></section>

        <section id="jadwal" className="border-b border-neutral-300 py-16"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-primary" style={{ color: "var(--btn-secondary-text)" }}>Jadwal PPDB</p><h2 className="font-extrabold tracking-tight text-4xl sm:text-5xl">Jangan Sampai Kelewat Tanggal</h2></Reveal><Reveal delay={0.08}><div className="mt-9 overflow-x-auto  shadow-md rounded-xl"><table className="w-full min-w-155 border-collapse text-left text-sm"><thead className="bg-primary text-[#ffffff]" style={{ color: "#ffffff" }}><tr><th className="p-4 font-extrabold tracking-tight text-lg">Tahapan</th><th className="p-4 font-extrabold tracking-tight text-lg">Gelombang 1</th><th className="p-4 font-extrabold tracking-tight text-lg">Gelombang 2</th></tr></thead><tbody>{[["Pendaftaran online", "2 Feb – 28 Feb", "3 Mar – 30 Apr"], ["Verifikasi berkas", "1 Mar – 5 Mar", "1 Mei – 5 Mei"], ["Pengumuman", "10 Mar", "10 Mei"], ["Daftar ulang", "11 – 15 Mar", "11 – 15 Mei"]].map((row) => <tr key={row[0]} className="border-b-2 border-primary/20 last:border-0"><td className="p-4">{row[0]}</td><td className="p-4 font-bold">{row[1]}</td><td className="p-4 font-bold">{row[2]}</td></tr>)}</tbody></table></div></Reveal></div></section>

        <section id="syarat" className="border-b border-neutral-300 py-16"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><p className="mb-2 text-xs font-extrabold uppercase tracking-wide">Syarat Pendaftaran</p><h2 className="font-extrabold tracking-tight text-4xl sm:text-5xl">Siapkan Dokumen Ini</h2></Reveal><div className="mt-8 grid gap-x-10 sm:grid-cols-2">{requirements.map((item, index) => <Reveal key={item} delay={index * 0.1}><div className="flex items-center gap-3 border-b-2 border-dashed border-ink py-4 text-sm font-semibold"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 rounded-md text-sm font-extrabold">✓</span>{item}</div></Reveal>)}</div></div></section>

        <section className="py-16"><div className="mx-auto max-w-7xl px-5 sm:px-8"><Reveal><div className=" bg-primary px-6 py-12 text-center text-[#ffffff] shadow-lg rounded-2xl  sm:px-10" style={{ color: "#ffffff" }}><h2 className="font-extrabold tracking-tight text-4xl sm:text-5xl">Siap Gabung Angkatan Baru?</h2><p className="mx-auto mt-3 max-w-xl text-[#ffffff]/85" style={{ color: "#ffffff" }}>Isi formulir pendaftaran online sekarang, cuma butuh 10 menit.</p><Link href="/ppdb/daftar" className="rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg mt-7 inline-flex  bg-paper px-6 py-3 font-bold text-primary " style={{ color: "var(--btn-secondary-text)" }}>Mulai Daftar</Link></div></Reveal></div></section>

        <footer className="border-t border-neutral-300 py-10"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-8 px-5 sm:px-8"><div><div className="font-extrabold tracking-tight text-2xl">SMK BANI MASUM</div><p className="mt-2 text-sm leading-7 text-neutral-700">Subang, Jawa Barat<br />ppdb@banimasum.sch.id<br />(0260) 000-000</p></div><nav className="flex flex-wrap gap-5 text-sm font-bold"><Link href="/tentang">Tentang</Link><Link href="/jurusan">Jurusan</Link><Link href="/ppdb">PPDB</Link><Link href="/ppdb/cek-status">Cek Status</Link><Link href="/ppdb/tiket">Cetak Kartu</Link><Link href="/faq">FAQ</Link></nav></div><div className="mx-auto mt-8 max-w-7xl px-5 text-xs text-neutral-500 sm:px-8">© 2026 SMK Bani Masum. Semua hak dilindungi.</div></footer>
    </main>;
}
