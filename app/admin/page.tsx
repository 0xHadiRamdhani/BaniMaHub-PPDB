"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { LogOut } from "lucide-react";
import { Panel, SubpageShell } from "@/app/components/subpage-shell";

type Registration = {
    registration_number: string;
    name: string;
    nisn: string;
    phone: string;
    parent_name: string;
    parent_phone: string;
    major: string;
    status: string;
    created_at: string;
};

type RegistrationDetail = Registration & { birth_date: string };
type DocumentLink = { name: string; url: string | null };
const statuses = ["Menunggu verifikasi", "Diterima", "Revisi berkas"];
const statusFilters = ["Semua", ...statuses];
const majorFilters = ["Semua", "RPL", "TBSM"];

function escapeCsv(value: string) {
    const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replaceAll('"', '""')}"`;
}

export default function AdminPage() {
    const router = useRouter();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [statusFilter, setStatusFilter] = useState("Semua");
    const [majorFilter, setMajorFilter] = useState("Semua");
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [savingNumber, setSavingNumber] = useState("");
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [savingNewRegistration, setSavingNewRegistration] = useState(false);
    const [addError, setAddError] = useState("");
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDetail | null>(null);
    const [documents, setDocuments] = useState<DocumentLink[]>([]);
    const [reload, setReload] = useState(0);
    const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
    const [addDialog, setAddDialog] = useState<HTMLDialogElement | null>(null);
    const [deletingNumber, setDeletingNumber] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        let active = true;
        fetch("/api/admin/pendaftar", { cache: "no-store" })
            .then(async (response) => {
                const result = await response.json() as { registrations?: Registration[]; error?: string };
                if (response.status === 401) {
                    router.replace("/admin/login");
                    return;
                }
                if (!response.ok) throw new Error(result.error || "Data pendaftar gagal dimuat.");
                if (active) setRegistrations(result.registrations ?? []);
            })
            .catch((fetchError: unknown) => {
                if (active) setError(fetchError instanceof Error ? fetchError.message : "Terjadi kesalahan saat memuat data.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [reload, router]);

    useEffect(() => {
        if (!dialog) return;
        if (selectedRegistration && !dialog.open) dialog.showModal();
        if (!selectedRegistration && dialog.open) dialog.close();
        if (selectedRegistration) setConfirmDelete(false);
    }, [dialog, selectedRegistration]);

    useEffect(() => {
        if (!addDialog) return;
        if (addDialogOpen && !addDialog.open) addDialog.showModal();
        if (!addDialogOpen && addDialog.open) addDialog.close();
    }, [addDialog, addDialogOpen]);

    const visibleRegistrations = registrations.filter((registration) => {
        const matchesStatus = statusFilter === "Semua" || registration.status === statusFilter;
        const matchesMajor = majorFilter === "Semua" || registration.major.split(" - ")[0] === majorFilter;
        const searchable = `${registration.registration_number} ${registration.name} ${registration.nisn} ${registration.major}`.toLowerCase();
        return matchesStatus && matchesMajor && searchable.includes(query.trim().toLowerCase());
    });

    const openDetails = async (number: string) => {
        setLoadingDetails(true);
        setError("");
        try {
            const response = await fetch(`/api/admin/pendaftar?number=${encodeURIComponent(number)}`, { cache: "no-store" });
            const result = await response.json() as { registration?: RegistrationDetail; documents?: DocumentLink[]; error?: string };
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            if (!response.ok || !result.registration) throw new Error(result.error || "Detail pendaftar gagal dimuat.");
            setSelectedRegistration(result.registration);
            setDocuments(result.documents ?? []);
        } catch (detailError) {
            setError(detailError instanceof Error ? detailError.message : "Detail pendaftar gagal dimuat.");
        } finally {
            setLoadingDetails(false);
        }
    };

    const updateStatus = async (number: string, status: string) => {
        setSavingNumber(number);
        setError("");
        try {
            const response = await fetch("/api/admin/pendaftar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ number, status }),
            });
            const result = await response.json() as { error?: string };
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            if (!response.ok) throw new Error(result.error || "Status gagal diperbarui.");
            setRegistrations((current) => current.map((item) => item.registration_number === number ? { ...item, status } : item));
            setSelectedRegistration((current) => current?.registration_number === number ? { ...current, status } : current);
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "Status gagal diperbarui.");
        } finally {
            setSavingNumber("");
        }
    };

    const addRegistration = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSavingNewRegistration(true);
        setAddError("");
        const form = event.currentTarget;
        try {
            const response = await fetch("/api/admin/pendaftar", {
                method: "POST",
                body: new FormData(form),
            });
            const result = await response.json() as { registration?: Registration; error?: string };
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            if (!response.ok || !result.registration) throw new Error(result.error || "Pendaftar gagal ditambahkan.");
            setRegistrations((current) => [result.registration!, ...current]);
            setNotice(`${result.registration.name} berhasil ditambahkan.`);
            setError("");
            setAddDialogOpen(false);
            form.reset();
        } catch (addError) {
            setAddError(addError instanceof Error ? addError.message : "Pendaftar gagal ditambahkan.");
        } finally {
            setSavingNewRegistration(false);
        }
    };

    const deleteRegistration = async (number: string) => {
        setDeletingNumber(number);
        setError("");
        try {
            const response = await fetch(`/api/admin/pendaftar?number=${encodeURIComponent(number)}`, { method: "DELETE" });
            const result = await response.json() as { error?: string };
            if (response.status === 401) { router.replace("/admin/login"); return; }
            if (!response.ok) throw new Error(result.error || "Data pendaftar gagal dihapus.");
            setRegistrations((current) => current.filter((item) => item.registration_number !== number));
            setSelectedRegistration(null);
            setConfirmDelete(false);
            setNotice(`Pendaftar ${number} berhasil dihapus.`);
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Data pendaftar gagal dihapus.");
        } finally {
            setDeletingNumber("");
        }
    };

    const signOut = async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.replace("/admin/login");
        router.refresh();
    };

    const exportCsv = () => {
        const columns = ["Nomor", "Nama", "NISN", "Jurusan", "Telepon", "Nama Wali", "Telepon Wali", "Status", "Tanggal Daftar"];
        const rows = visibleRegistrations.map((item) => [item.registration_number, item.name, item.nisn, item.major, item.phone, item.parent_name, item.parent_phone, item.status, item.created_at]);
        const csv = [columns, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "pendaftar-ppdb.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const summaries = statuses.map((status) => [status, registrations.filter((item) => item.status === status).length] as const);

    return <SubpageShell eyebrow="Administrasi PPDB" title="Data Pendaftar" intro="Daftar pendaftar yang tersimpan di Firebase." hideHomeLink headerAction={<button type="button" onClick={() => void signOut()} className="inline-flex shrink-0 items-center gap-2 border-2 border-ink px-3 py-2 text-sm font-bold hover:bg-paper-soft"><LogOut size={16} aria-hidden="true" />Keluar</button>}>
        <section className="mx-auto max-w-7xl space-y-6 px-5 py-10 sm:px-8 sm:py-14">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Panel><p className="font-extrabold tracking-tight text-4xl text-primary">{loading ? "..." : registrations.length}</p><p className="mt-1 text-sm font-bold">Total pendaftar</p></Panel>
                {summaries.map(([status, count]) => <Panel key={status}><p className="font-extrabold tracking-tight text-4xl text-primary">{loading ? "..." : count}</p><p className="mt-1 text-sm font-bold">{status}</p></Panel>)}
            </div>
            <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-extrabold tracking-tight text-2xl">Daftar Pendaftar</h2>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => { setAddError(""); setAddDialogOpen(true); }} className="border border-neutral-300 bg-primary px-4 py-2 text-sm font-bold text-[#ffffff] shadow-md rounded-xl">Tambah Pendaftar</button>
                        <button type="button" onClick={() => setReload((value) => value + 1)} disabled={loading} className="border border-neutral-300 px-4 py-2 text-sm font-bold hover:bg-paper-soft disabled:opacity-60">Muat ulang</button>
                        <button type="button" onClick={exportCsv} disabled={!visibleRegistrations.length} className="border border-neutral-300 bg-primary px-4 py-2 text-sm font-bold text-[#ffffff] shadow-md rounded-xl disabled:opacity-60">Export CSV</button>
                    </div>
                </div>
                {notice && <p role="status" className="mt-5 border-2 border-green-700 bg-green-50 p-3 text-sm font-bold text-green-800">{notice}</p>}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nomor, nama, NISN" className="min-w-0 border border-neutral-300 bg-paper px-4 py-3 text-sm" aria-label="Cari pendaftar" />
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="border border-neutral-300 bg-paper px-4 py-3 text-sm font-bold" aria-label="Filter status">{statusFilters.map((status) => <option key={status}>{status}</option>)}</select>
                    <select value={majorFilter} onChange={(event) => setMajorFilter(event.target.value)} className="border border-neutral-300 bg-paper px-4 py-3 text-sm font-bold" aria-label="Filter jurusan">{majorFilters.map((major) => <option key={major}>{major}</option>)}</select>
                </div>
                {error && <p role="alert" className="mt-5 border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p>}
                <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-225 border-collapse text-left text-sm">
                        <thead className="bg-primary text-[#ffffff]"><tr><th className="p-3">Nomor / Tanggal</th><th className="p-3">Pendaftar</th><th className="p-3">Jurusan</th><th className="p-3">Telepon</th><th className="p-3">Status</th><th className="p-3">Detail</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan={6} className="p-8 text-center text-neutral-600">Memuat data pendaftar...</td></tr>
                                : visibleRegistrations.map((registration) => <tr key={registration.registration_number} className="border-b-2 border-primary/20 align-top">
                                    <td className="p-3"><p className="font-bold">{registration.registration_number}</p><p className="mt-1 text-xs text-neutral-600">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(registration.created_at))}</p></td>
                                    <td className="p-3"><p className="font-bold">{registration.name}</p><p className="mt-1 text-xs text-neutral-600">NISN: {registration.nisn}</p></td>
                                    <td className="p-3">{registration.major}</td>
                                    <td className="p-3">{registration.phone}</td>
                                    <td className="p-3"><select value={registration.status} disabled={savingNumber === registration.registration_number} onChange={(event) => void updateStatus(registration.registration_number, event.target.value)} className="max-w-52 border-2 border-primary bg-paper px-2 py-2 text-xs font-bold disabled:opacity-60" aria-label={`Ubah status ${registration.registration_number}`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td>
                                    <td className="p-3"><button type="button" disabled={loadingDetails} onClick={() => void openDetails(registration.registration_number)} className="border-2 border-primary px-3 py-2 text-xs font-bold text-primary hover:bg-paper-soft disabled:opacity-60">{loadingDetails ? "Memuat..." : "Lihat"}</button></td>
                                </tr>)}
                            {!loading && visibleRegistrations.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-neutral-600">Tidak ada pendaftar yang cocok.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-xs text-neutral-600">Menampilkan {visibleRegistrations.length} dari {registrations.length} pendaftar.</p>
            </Panel>
        </section>

        <dialog ref={setAddDialog} onCancel={() => setAddDialogOpen(false)} onClick={(event) => { if (event.target === addDialog) setAddDialogOpen(false); }} className="m-auto max-h-[min(90dvh,850px)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto border border-neutral-300 bg-paper p-0 text-ink backdrop:bg-ink/70" aria-labelledby="add-registration-title">
            <form onSubmit={addRegistration} className="divide-y-[3px] divide-primary">
                <div className="flex items-start justify-between gap-4 bg-paper-soft p-5 sm:p-7">
                    <div><p className="text-xs font-extrabold uppercase text-primary">Entri Manual</p><h2 id="add-registration-title" className="mt-1 font-extrabold tracking-tight text-3xl">Tambah Pendaftar</h2></div>
                    <button type="button" onClick={() => setAddDialogOpen(false)} aria-label="Tutup form tambah pendaftar" className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-primary text-2xl font-bold text-primary hover:bg-paper">×</button>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
                    <label className="block text-sm font-bold sm:col-span-2">Nama lengkap<input required name="name" maxLength={120} className="mt-2 block w-full border border-neutral-300 bg-paper px-4 py-3 font-normal" /></label>
                    <label className="block text-sm font-bold">NISN<input required name="nisn" inputMode="numeric" className="mt-2 block w-full border border-neutral-300 bg-paper px-4 py-3 font-normal" /></label>
                    <label className="block text-sm font-bold">Tanggal lahir<input required name="birth_date" type="date" className="mt-2 block w-full border border-neutral-300 bg-paper px-4 py-3 font-normal" /></label>
                    <label className="block text-sm font-bold">Telepon pendaftar<input required name="phone" type="tel" maxLength={30} className="mt-2 block w-full border border-neutral-300 bg-paper px-4 py-3 font-normal" /></label>
                    <label className="block text-sm font-bold">Jurusan<select required name="major" defaultValue="" className="mt-2 block w-full border border-neutral-300 bg-paper px-4 py-3 font-normal"><option value="" disabled>Pilih jurusan</option><option value="RPL - Teknik Komputer">RPL - Teknik Komputer</option><option value="TBSM - Teknik Otomotif">TBSM - Teknik Otomotif</option></select></label>
                    <label className="block text-sm font-bold">Nama orang tua / wali<input required name="parent_name" maxLength={120} className="mt-2 block w-full border border-neutral-300 bg-paper px-4 py-3 font-normal" /></label>
                    <label className="block text-sm font-bold">Telepon orang tua / wali<input required name="parent_phone" type="tel" maxLength={30} className="mt-2 block w-full border border-neutral-300 bg-paper px-4 py-3 font-normal" /></label>
                </div>
                <div className="space-y-4 p-5 sm:p-7">
                    <h3 className="font-extrabold">Dokumen (opsional)</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[["kk", "Kartu Keluarga"], ["ijazah", "Ijazah / SKL"], ["photo", "Pas foto"]].map(([name, label]) => <label key={name} className="block text-sm font-bold">{label}<input name={name} type="file" accept=".pdf,image/jpeg,image/png" className="mt-2 block w-full min-w-0 border-2 border-ink p-2 text-xs font-normal" /></label>)}
                    </div>
                    <p className="text-xs text-neutral-600">PDF/JPG/PNG, maksimal 2 MB per dokumen.</p>
                    {addError && <p role="alert" className="border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-800">{addError}</p>}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setAddDialogOpen(false)} className="border border-neutral-300 px-4 py-3 text-sm font-bold">Batal</button>
                        <button type="submit" disabled={savingNewRegistration} className="border border-neutral-300 bg-primary px-5 py-3 text-sm font-bold text-[#ffffff] shadow-md rounded-xl disabled:opacity-60">{savingNewRegistration ? "Menyimpan..." : "Simpan Pendaftar"}</button>
                    </div>
                </div>
            </form>
        </dialog>

        <dialog ref={setDialog} onCancel={() => setSelectedRegistration(null)} onClick={(event) => { if (event.target === dialog) setSelectedRegistration(null); }} className="m-auto max-h-[min(90dvh,800px)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto border border-neutral-300 bg-paper p-0 text-ink backdrop:bg-ink/70" aria-labelledby="registration-detail-title">
            {selectedRegistration && <>
                <div className="flex items-start justify-between gap-4 border-b border-neutral-300 bg-paper-soft p-5 sm:p-7">
                    <div><p className="font-extrabold tracking-tight text-3xl text-primary">{selectedRegistration.registration_number}</p><h2 id="registration-detail-title" className="mt-1 text-xl font-extrabold">{selectedRegistration.name}</h2></div>
                    <button type="button" onClick={() => setSelectedRegistration(null)} aria-label="Tutup detail pendaftar" className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-primary text-2xl font-bold text-primary hover:bg-paper">×</button>
                </div>
                <div className="space-y-6 p-5 sm:p-7">
                    <dl className="grid gap-4 text-sm sm:grid-cols-2">
                        <div><dt className="font-bold text-neutral-600">NISN</dt><dd className="mt-1">{selectedRegistration.nisn}</dd></div>
                        <div><dt className="font-bold text-neutral-600">Tanggal lahir</dt><dd className="mt-1">{selectedRegistration.birth_date}</dd></div>
                        <div><dt className="font-bold text-neutral-600">Telepon pendaftar</dt><dd className="mt-1">{selectedRegistration.phone}</dd></div>
                        <div><dt className="font-bold text-neutral-600">Jurusan</dt><dd className="mt-1">{selectedRegistration.major}</dd></div>
                        <div><dt className="font-bold text-neutral-600">Nama orang tua / wali</dt><dd className="mt-1">{selectedRegistration.parent_name}</dd></div>
                        <div><dt className="font-bold text-neutral-600">Telepon orang tua / wali</dt><dd className="mt-1">{selectedRegistration.parent_phone}</dd></div>
                        <div><dt className="font-bold text-neutral-600">Status</dt><dd className="mt-1">{selectedRegistration.status}</dd></div>
                    </dl>
                    <section className="space-y-3">
                        <h3 className="font-extrabold text-primary text-lg">Dokumen Pendaftaran</h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {documents.map((document) => (
                                <div key={document.name} className="flex flex-col border-2 border-ink bg-paper p-3 shadow-md rounded-xl">
                                    <div className="mb-2 font-bold text-sm border-b-2 border-ink pb-1">{document.name}</div>
                                    {document.url ? (
                                        document.url.includes(".pdf") ? (
                                            <div className="flex flex-col items-center justify-center p-4 bg-paper-soft border-2 border-dashed border-ink flex-1 min-h-44 text-center">
                                                <p className="text-xs font-bold text-neutral-700 mb-3">Dokumen Berformat PDF</p>
                                                <a href={document.url} target="_blank" rel="noreferrer" className="border-2 border-primary bg-primary text-[#ffffff] px-3 py-2 text-xs font-bold shadow-md rounded-xl">
                                                    Buka Dokumen PDF
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col flex-1">
                                                <div className="relative overflow-hidden border-2 border-ink bg-neutral-100 h-44 flex items-center justify-center">
                                                    <img
                                                        src={document.url}
                                                        alt={document.name}
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                                <a
                                                    href={document.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-2 block text-center border-2 border-primary bg-primary px-3 py-1.5 text-xs font-bold text-[#ffffff] shadow-md rounded-xl hover:opacity-90"
                                                >
                                                    Lihat Ukuran Penuh ↗
                                                </a>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex items-center justify-center p-4 bg-neutral-100 border-2 border-dashed border-neutral-300 text-xs text-neutral-500 font-bold flex-1 min-h-44 text-center">
                                            Belum Diunggah
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="border-t-2 border-dashed border-red-300 pt-5">
                        <h3 className="font-extrabold text-red-700">Zona Berbahaya</h3>
                        {!confirmDelete
                            ? <button type="button" onClick={() => setConfirmDelete(true)} className="mt-3 border-2 border-red-700 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">Hapus Data Pendaftar</button>
                            : <div className="mt-3 space-y-3">
                                <p className="text-sm font-bold text-red-800">Yakin ingin menghapus <span className="font-extrabold tracking-tight">{selectedRegistration.registration_number}</span> – {selectedRegistration.name}? Tindakan ini tidak dapat dibatalkan.</p>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => void deleteRegistration(selectedRegistration.registration_number)} disabled={!!deletingNumber} className="border-2 border-red-700 bg-red-700 px-4 py-2 text-sm font-bold text-[#ffffff] hover:bg-red-800 disabled:opacity-60">{deletingNumber ? "Menghapus..." : "Hapus Permanen"}</button>
                                    <button type="button" onClick={() => setConfirmDelete(false)} disabled={!!deletingNumber} className="border-2 border-ink px-4 py-2 text-sm font-bold hover:bg-paper-soft disabled:opacity-60">Batal</button>
                                </div>
                            </div>}
                    </section>
                </div>
            </>}
        </dialog>
    </SubpageShell>;
}
