"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Panel, SubpageShell } from "@/app/components/subpage-shell";

type Registration = { number: string; name: string; status: string };

function RegistrationCardContent() {
    const searchParams = useSearchParams();
    const number = searchParams.get("number")?.toUpperCase() ?? "";
    const [registration, setRegistration] = useState<Registration | null>(null);
    useEffect(() => {
        if (!number) return;
        let active = true;
        fetch(`/api/pendaftaran?number=${encodeURIComponent(number)}`)
            .then(async (response) => response.ok ? response.json() as Promise<{ registration: Registration }> : null)
            .then((data) => { if (active && data) setRegistration(data.registration); })
            .catch(() => undefined);
        return () => { active = false; };
    }, [number]);
    if (!number || !registration) {
        return <SubpageShell eyebrow="Kartu Pendaftaran" title={!number ? "Lihat Kartu Pendaftaran" : "Data Tidak Ditemukan"} intro={!number ? "Masukkan nomor pendaftaran kamu untuk melihat atau mencetak kartu." : "Pastikan nomor pendaftaran yang dimasukkan sudah benar."}>
            <section className="mx-auto max-w-xl px-5 py-14 sm:px-8">
                <Panel>
                    {!number ? (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            window.location.href = `/ppdb/kartu?number=${formData.get("number")}`;
                        }}>
                            <label className="block text-sm font-bold">Nomor pendaftaran<input required name="number" placeholder="Contoh: BM26-1A2B3C4D5E6F7890" className="mt-2 block w-full border border-neutral-300 px-4 py-3 uppercase outline-none" /></label>
                            <button type="submit" className="mt-6 w-full border border-neutral-300 bg-primary px-5 py-3 font-bold text-white shadow-md rounded-xl" style={{ color: "#ffffff" }}>Cari Kartu</button>
                        </form>
                    ) : (
                        <Link href="/ppdb/daftar" className="inline-flex border border-neutral-300 bg-primary px-5 py-3 font-bold text-white shadow-md rounded-xl" style={{ color: "#ffffff" }}>Kembali ke Pendaftaran</Link>
                    )}
                </Panel>
            </section>
        </SubpageShell>;
    }
    const qrUrl = `https://quickchart.io/qr?size=180&text=${encodeURIComponent(`PPDB SMK Bani Masum - ${registration.number}`)}`;
    return <SubpageShell eyebrow="Kartu Pendaftaran" title="Kartu Peserta PPDB" intro="Simpan atau cetak kartu ini sebagai bukti pendaftaran sementara."><section className="mx-auto max-w-2xl px-5 py-14 sm:px-8"><Panel><div className="border border-neutral-300 bg-paper-soft p-6 sm:p-8"><div className="flex items-start justify-between gap-4 border-b-2 border-primary pb-5"><div><p className="text-xs font-extrabold uppercase tracking-wide text-primary">PPDB 2026/2027</p><h2 className="mt-2 font-extrabold tracking-tight text-3xl">SMK BANI MASUM</h2></div><img src={qrUrl} alt="QR code kartu pendaftaran" width={90} height={90} className="h-[90px] w-[90px] border-2 border-primary bg-paper p-1" /></div><dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-neutral-600">Nomor pendaftaran</dt><dd className="mt-1 font-extrabold tracking-tight text-2xl">{registration.number}</dd></div><div><dt className="font-bold text-neutral-600">Nama peserta</dt><dd className="mt-1 font-bold">{registration.name}</dd></div><div><dt className="font-bold text-neutral-600">Status</dt><dd className="mt-1 font-bold text-primary">{registration.status}</dd></div><div><dt className="font-bold text-neutral-600">Tanggal cetak</dt><dd className="mt-1">{new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date())}</dd></div></dl></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => window.print()} className="border border-neutral-300 bg-primary px-5 py-3 font-bold text-white shadow-md rounded-xl" style={{ color: "#ffffff" }}>Cetak Kartu</button><Link href="/ppdb/cek-status" className="border border-neutral-300 px-5 py-3 text-center font-bold text-primary">Cek Status</Link></div></Panel></section></SubpageShell>;
}

export default function RegistrationCardPage() { return <Suspense fallback={<SubpageShell eyebrow="Kartu Pendaftaran" title="Memuat Kartu..."><section className="mx-auto max-w-xl px-5 py-14 sm:px-8"><Panel><p>Menyiapkan kartu pendaftaran.</p></Panel></section></SubpageShell>}><RegistrationCardContent /></Suspense>; }
