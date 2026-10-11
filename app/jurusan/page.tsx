import Link from "next/link";
import { majors } from "@/app/lib/ppdb-data";
import { Panel, SubpageShell } from "@/app/components/subpage-shell";

export default function JurusanPage() {
    return (
        <SubpageShell
            eyebrow="Kompetensi Keahlian"
            title="Pilih Jalur Keahlianmu"
            intro="Kurikulum dirancang untuk membangun kemampuan praktik yang bisa langsung dibawa ke dunia kerja."
        >
            <section className="mx-auto grid max-w-5xl gap-6 px-5 py-10 sm:px-8 md:grid-cols-2">
                {majors.map((major) => (
                    <Panel key={major.code}>
                        <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-3.5 py-1.5 text-sm font-extrabold text-[#38BDF8]">
                                {major.code === "RPL" ? "💻 RPL" : "🏍️ TBSM"}
                            </span>
                            <span className="rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#1D4ED8] dark:bg-[#1E293B] dark:text-[#38BDF8]">
                                Unggulan Industri
                            </span>
                        </div>
                        <h2 className="mt-4 text-2xl font-extrabold text-ink">{major.name}</h2>
                        <p className="mt-2.5 text-sm leading-7 text-muted-soft">{major.description}</p>
                        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#334155] dark:bg-[#0F172A]/60">
                                <h3 className="text-xs font-extrabold tracking-wider text-[#1D4ED8] uppercase dark:text-[#38BDF8]">
                                    Prospek Kerja
                                </h3>
                                <ul className="mt-2.5 space-y-1.5 text-xs font-semibold text-ink">
                                    {major.careers.map((career) => (
                                        <li key={career} className="flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                                            {career}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#334155] dark:bg-[#0F172A]/60">
                                <h3 className="text-xs font-extrabold tracking-wider text-[#1D4ED8] uppercase dark:text-[#38BDF8]">
                                    Fasilitas Praktik
                                </h3>
                                <ul className="mt-2.5 space-y-1.5 text-xs font-semibold text-ink">
                                    {major.facilities.map((facility) => (
                                        <li key={facility} className="flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                                            {facility}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <Link
                            href="/ppdb/daftar"
                            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-[#2563EB]/20 transition hover:bg-[#1D4ED8]"
                        >
                            Daftar Jurusan {major.code} →
                        </Link>
                    </Panel>
                ))}
            </section>
        </SubpageShell>
    );
}
