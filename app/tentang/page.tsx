import Image from "next/image";
import { gallery } from "@/app/lib/ppdb-data";
import { Panel, SubpageShell } from "@/app/components/subpage-shell";

export default function TentangPage() {
    return (
        <SubpageShell
            eyebrow="Profil Sekolah"
            title="Tempat Tumbuhnya Keahlian dan Karakter"
            intro="SMK Bani Masum hadir untuk menyiapkan generasi muda Subang menjadi tenaga terampil, percaya diri, dan siap melanjutkan perjalanan."
        >
            <section className="mx-auto max-w-5xl space-y-6 px-5 py-10 sm:px-8">
                <div className="grid gap-5 md:grid-cols-2">
                    <Panel>
                        <span className="inline-block rounded-lg bg-[#EFF6FF] px-3 py-1 text-xs font-extrabold tracking-wider text-[#1D4ED8] uppercase dark:bg-[#1E293B] dark:text-[#38BDF8]">
                            Visi Sekolah
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">Visi Utama</h2>
                        <p className="mt-3 text-sm leading-7 text-muted-soft">
                            Menjadi sekolah kejuruan pilihan yang menghasilkan lulusan kompeten, berkarakter, dan relevan dengan dunia kerja.
                        </p>
                    </Panel>
                    <Panel>
                        <span className="inline-block rounded-lg bg-[#EFF6FF] px-3 py-1 text-xs font-extrabold tracking-wider text-[#1D4ED8] uppercase dark:bg-[#1E293B] dark:text-[#38BDF8]">
                            Misi Pendidikan
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">Misi Kami</h2>
                        <p className="mt-3 text-sm leading-7 text-muted-soft">
                            Menguatkan praktik, membangun budaya belajar disiplin, serta membuka akses pengalaman industri untuk setiap siswa.
                        </p>
                    </Panel>
                </div>

                <section className="pt-4">
                    <h2 className="text-2xl font-extrabold tracking-tight text-ink">Galeri Kegiatan</h2>
                    <div className="mt-5 grid gap-5 md:grid-cols-3">
                        {gallery.map(([title, description, src]) => (
                            <article
                                key={title}
                                className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-paper shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/40 dark:border-[#334155]"
                            >
                                <Image src={src} alt={title} width={768} height={768} className="aspect-square w-full object-cover" />
                                <div className="p-5">
                                    <h3 className="font-extrabold text-ink">{title}</h3>
                                    <p className="mt-2 text-xs leading-6 text-muted-soft">{description}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="grid gap-5 pt-2 md:grid-cols-[1.2fr_.8fr]">
                    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-paper shadow-[0_2px_10px_rgba(15,23,42,0.03)] dark:border-[#334155]">
                        <iframe
                            title="Peta lokasi SMK Bani Masum"
                            src="https://www.google.com/maps?q=Subang%2C%20Jawa%20Barat&output=embed"
                            className="h-80 w-full border-0"
                            loading="lazy"
                        />
                    </div>
                    <Panel>
                        <span className="inline-block rounded-lg bg-[#ECFDF5] px-3 py-1 text-xs font-extrabold tracking-wider text-[#059669] uppercase dark:bg-[#059669]/15 dark:text-[#34D399]">
                            Layanan Bantuan
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink">Hubungi Panitia</h2>
                        <p className="mt-3 text-sm leading-6 text-muted-soft">
                            Butuh bantuan memilih jurusan atau menyiapkan berkas pendaftaran? Konsultasikan langsung via WhatsApp.
                        </p>
                        <a
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#059669] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-[#059669]/20 transition hover:bg-[#047857]"
                        >
                            Chat WhatsApp Panitia
                        </a>
                    </Panel>
                </section>
            </section>
        </SubpageShell>
    );
}
