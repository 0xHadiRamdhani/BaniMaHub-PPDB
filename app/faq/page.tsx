import Link from "next/link";
import { Panel, SubpageShell } from "@/app/components/subpage-shell";

const questions = [
    ["Siapa yang bisa mendaftar?", "Lulusan SMP atau sederajat yang ingin mengembangkan keahlian di bidang komputer maupun otomotif."],
    ["Dokumen apa saja yang perlu disiapkan?", "Kartu Keluarga, ijazah atau SKL, akta kelahiran, dan pas foto terbaru dalam format PDF atau gambar."],
    ["Berapa lama proses verifikasi?", "Panitia memeriksa berkas secara bertahap. Status akan diperbarui setelah pemeriksaan selesai."],
    ["Bagaimana cara mengetahui hasil pendaftaran?", "Gunakan nomor pendaftaran pada halaman Cek Status setelah formulir berhasil dikirim."],
];

export default function FAQPage() {
    return (
        <SubpageShell
            eyebrow="Bantuan PPDB"
            title="Pertanyaan yang Sering Ditanyakan"
            intro="Temukan jawaban singkat seputar pendaftaran siswa baru SMK Bani Masum."
        >
            <section className="mx-auto max-w-3xl space-y-5 px-5 py-10 sm:px-8">
                <div className="space-y-3.5">
                    {questions.map(([question, answer]) => (
                        <details
                            key={question}
                            className="group rounded-2xl border border-[#E2E8F0] bg-paper p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition hover:border-[#2563EB]/40 dark:border-[#334155]"
                        >
                            <summary className="cursor-pointer list-none pr-8 text-sm font-extrabold text-ink marker:hidden">
                                {question}
                                <span className="float-right inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1D4ED8] transition-transform group-open:rotate-45 dark:bg-[#1E293B] dark:text-[#38BDF8]">
                                    +
                                </span>
                            </summary>
                            <p className="mt-4 border-t border-[#E2E8F0] pt-4 text-sm leading-7 text-muted-soft dark:border-[#334155]">
                                {answer}
                            </p>
                        </details>
                    ))}
                </div>

                <Panel>
                    <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight text-ink">Masih perlu bantuan?</h2>
                            <p className="mt-1.5 text-sm leading-6 text-muted-soft">
                                Hubungi panitia PPDB untuk pertanyaan yang belum terjawab.
                            </p>
                        </div>
                        <a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#059669] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-[#059669]/20 transition hover:bg-[#047857] sm:mt-0"
                        >
                            Chat WhatsApp
                        </a>
                    </div>
                </Panel>

                <p className="pt-2 text-center text-sm">
                    <Link href="/ppdb/daftar" className="font-extrabold text-[#1D4ED8] underline underline-offset-4 dark:text-[#38BDF8]">
                        Mulai Pendaftaran Siswa Baru →
                    </Link>
                </p>
            </section>
        </SubpageShell>
    );
}
