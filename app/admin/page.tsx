"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    LogOut,
    Search,
    X,
    Users,
    Clock,
    CheckCircle2,
    AlertTriangle,
    PieChart,
    ChevronUp,
    Calendar,
    BarChart3,
    Megaphone,
    Plus,
    RefreshCw,
    Download,
    Copy,
    Eye,
    Edit3,
    Phone,
    Laptop,
    Wrench,
    FileCheck2,
    FileClock,
    Trash2,
    ArrowUp,
    ArrowUpDown,
    RotateCcw,
    User,
    Info,
    ExternalLink,
    MessageCircle,
    Share2,
    SlidersHorizontal,
    XCircle,
    FileWarning,
    Home,
    LayoutGrid,
    Table2,
    CheckSquare,
    Square,
    Printer,
    History,
    ZoomIn,
    ZoomOut,
    RotateCw,
    StickyNote,
    Ticket,
    Save,
} from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";

type Registration = {
    registration_number: string;
    name: string;
    nisn: string;
    birth_date?: string;
    phone: string;
    parent_name: string;
    parent_phone: string;
    major: string;
    status: string;
    created_at: string;
    documents_pending?: boolean;
    photo_url?: string;
    kk_url?: string;
    ijazah_url?: string;
    kk_path?: string;
    ijazah_path?: string;
    photo_path?: string;
    admin_notes?: string;
};

type RegistrationDetail = Registration & { birth_date: string };
type DocumentLink = { name: string; url: string | null };
type ActivityLogItem = {
    id: string;
    action: string;
    target: string;
    timestamp: string;
};

const ACTIVITY_LOG_KEY = "ppdb:admin_activity_log";

// Status options matching Flutter DetailScreen & DashboardScreen
const STATUS_OPTIONS = [
    {
        label: "Menunggu verifikasi",
        color: "#D97706",
        bg: "#FEF3C7",
        desc: "Berkas pendaftaran sedang dalam antrean verifikasi.",
        icon: Clock,
    },
    {
        label: "Lulus verifikasi",
        color: "#15803D",
        bg: "#DCFCE7",
        desc: "Semua dokumen dan data valid, siswa dinyatakan lulus seleksi.",
        icon: CheckCircle2,
    },
    {
        label: "Berkas tidak lengkap",
        color: "#EA580C",
        bg: "#FFEDD5",
        desc: "Ada lampiran dokumen yang belum lengkap atau buram.",
        icon: FileWarning,
    },
    {
        label: "Berkas dikembalikan",
        color: "#EA580C",
        bg: "#FFEDD5",
        desc: "Calon siswa diminta mengunggah ulang perbaikan dokumen.",
        icon: RotateCcw,
    },
    {
        label: "Tidak lulus verifikasi",
        color: "#DC2626",
        bg: "#FEE2E2",
        desc: "Data atau syarat administrasi tidak memenuhi kriteria penerimaan.",
        icon: XCircle,
    },
] as const;

const STATUS_FILTERS = [
    "Semua",
    "Menunggu verifikasi",
    "Lulus verifikasi",
    "Berkas bermasalah",
] as const;

const MAJOR_FILTERS = ["Semua", "RPL", "TBSM"] as const;
const DOC_FILTERS = ["Semua Berkas", "Berkas Lengkap", "Menunggu Berkas"] as const;

const TARGET_QUOTA = 200;

const WA_TEMPLATES = [
    {
        title: "📅 Informasi Jadwal Tes & Wawancara",
        tag: "JADWAL TES",
        tagColor: "#2563EB",
        desc: "Undangan mengikuti tahapan tes seleksi & wawancara PPDB",
        text: `*📅 PANGGILAN TES SELEKSI & WAWANCARA PPDB*
*SMK BANI MASUM TAHUN AJARAN 2026/2027*
_NPSN: 69888774_

Yth. Calon Siswa & Orang Tua/Wali,
Terima kasih telah melakukan pendaftaran di SMK Bani Masum. Berikut informasi pelaksanaan tes minat bakat & wawancara:

📍 *Lokasi:* Kampus SMK Bani Masum
🕗 *Waktu:* 08.00 - 12.00 WIB
👔 *Pakaian:* Seragam sekolah asal (rapi & bersepatu)

*Kelengkapan yang dibawa:*
- Bukti Nomor Registrasi PPDB
- Kartu Pelajar / Identitas
- Alat Tulis Lengkap

Konfirmasi kehadiran dan info:
WA Panitia: 0812-3456-7890`,
    },
    {
        title: "🎉 Pengumuman Hasil Kelulusan",
        tag: "HASIL SELEKSI",
        tagColor: "#15803D",
        desc: "Format ucapan selamat kelulusan seleksi PPDB",
        text: `*🎉 PENGUMUMAN KELULUSAN SELEKSI PPDB*
*SMK BANI MASUM TAHUN AJARAN 2026/2027*
_NPSN: 69888774_

Selamat! Bagi calon siswa yang telah dinyatakan *LULUS VERIFIKASI SELEKSI PPDB*. 

Selamat bergabung menjadi bagian dari Keluarga Besar SMK Bani Masum! 🎓

Tahap selanjutnya adalah *Daftar Ulang dan Pengambilan Seragam*. Informasi detail mengenai jadwal dan berkas fisik dapat dilihat di aplikasi PPDB atau langsung datang ke sekretariat PPDB.

Salam Hangat,
Panitia PPDB SMK Bani Masum`,
    },
    {
        title: "💳 Panduan Daftar Ulang & Seragam",
        tag: "DAFTAR ULANG",
        tagColor: "#0D9488",
        desc: "Instruksi alur daftar ulang dan pengukuran seragam",
        text: `*💳 PANDUAN DAFTAR ULANG & SERAGAM SISWA BARU*
*SMK BANI MASUM 2026/2027*

Bagi siswa yang telah lulus verifikasi, berikut langkah daftar ulang:

1. Hadir ke Sekretariat PPDB SMK Bani Masum
2. Menyerahkan berkas fisik (Fotokopi KK, Akta, SKL/Ijazah, Pas Foto 3x4 3 lembar)
3. Melakukan pengukuran seragam sekolah & praktik bengkel/lab
4. Penyelesaian administrasi pendaftaran

Pelayanan dibuka setiap hari kerja pukul 08.00 - 14.00 WIB.

Sekretariat PPDB SMK Bani Masum:
NPSN: 69888774
Hotline: 0812-3456-7890`,
    },
];

// AppTheme Status Color Utilities (1:1 with Flutter AppTheme)
function getStatusColor(status?: string) {
    switch (status) {
        case "Lulus verifikasi":
        case "Diterima":
            return "#15803D";
        case "Menunggu verifikasi":
            return "#D97706";
        case "Berkas tidak lengkap":
        case "Berkas dikembalikan":
        case "Revisi berkas":
            return "#EA580C";
        case "Tidak lulus verifikasi":
            return "#DC2626";
        default:
            return "#1D4ED8";
    }
}

function getStatusBgColor(status?: string) {
    switch (status) {
        case "Lulus verifikasi":
        case "Diterima":
            return "#DCFCE7";
        case "Menunggu verifikasi":
            return "#FEF3C7";
        case "Berkas tidak lengkap":
        case "Berkas dikembalikan":
        case "Revisi berkas":
            return "#FFEDD5";
        case "Tidak lulus verifikasi":
            return "#FEE2E2";
        default:
            return "#EFF6FF";
    }
}

function isApprovedStatus(status?: string) {
    return status === "Lulus verifikasi" || status === "Diterima";
}

function isProblematicStatus(status?: string) {
    return (
        status === "Berkas tidak lengkap" ||
        status === "Berkas dikembalikan" ||
        status === "Tidak lulus verifikasi" ||
        status === "Revisi berkas"
    );
}

function hasUploadedDocuments(reg: Registration) {
    const hasDocs =
        Boolean(reg.kk_url || reg.kk_path) ||
        Boolean(reg.ijazah_url || reg.ijazah_path) ||
        Boolean(reg.photo_url || reg.photo_path);
    return reg.documents_pending !== true && hasDocs;
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
}

function formatFlutterDate(dateVal?: string) {
    if (!dateVal) return "-";
    try {
        const dt = new Date(dateVal);
        if (Number.isNaN(dt.getTime())) return dateVal;
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const day = String(dt.getDate()).padStart(2, "0");
        const month = months[dt.getMonth()];
        const year = dt.getFullYear();
        const hour = String(dt.getHours()).padStart(2, "0");
        const minute = String(dt.getMinutes()).padStart(2, "0");
        return `${day} ${month} ${year} • ${hour}:${minute}`;
    } catch {
        return dateVal;
    }
}

function formatWaNumber(phone?: string) {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("0")) return `62${digits.slice(1)}`;
    if (digits.startsWith("62")) return digits;
    return `62${digits}`;
}

function escapeCsv(value: string) {
    const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replaceAll('"', '""')}"`;
}

export default function AdminPage() {
    const router = useRouter();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("Semua");
    const [selectedMajorFilter, setSelectedMajorFilter] = useState<string>("Semua");
    const [selectedDocFilter, setSelectedDocFilter] = useState<string>("Semua Berkas");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");
    const [isStatsExpanded, setIsStatsExpanded] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Bulk selection state
    const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
    const [batchLoading, setBatchLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [savingNumber, setSavingNumber] = useState("");
    const [deletingNumber, setDeletingNumber] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);

    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");
    const [reload, setReload] = useState(0);

    // Modals & extra feature states
    const [selectedRegistration, setSelectedRegistration] = useState<RegistrationDetail | null>(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        nisn: "",
        birth_date: "",
        phone: "",
        parent_name: "",
        parent_phone: "",
        major: "RPL - Teknik Komputer",
        admin_notes: "",
    });
    const [savingProfile, setSavingProfile] = useState(false);

    const [documents, setDocuments] = useState<DocumentLink[]>([]);
    const [lightboxDoc, setLightboxDoc] = useState<{ name: string; url: string } | null>(null);
    const [lightboxZoom, setLightboxZoom] = useState(1);
    const [lightboxRotate, setLightboxRotate] = useState(0);

    const [quickStatusTarget, setQuickStatusTarget] = useState<Registration | null>(null);
    const [quickContactTarget, setQuickContactTarget] = useState<Registration | null>(null);
    const [showSortModal, setShowSortModal] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [selectedTplIdx, setSelectedTplIdx] = useState(0);
    const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [savingNewRegistration, setSavingNewRegistration] = useState(false);
    const [addError, setAddError] = useState("");

    const logActivity = (action: string, target: string) => {
        const newEntry: ActivityLogItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            action,
            target,
            timestamp: new Date().toISOString(),
        };
        setActivityLogs((prev) => {
            const next = [newEntry, ...prev].slice(0, 50);
            try {
                localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(next));
            } catch {}
            return next;
        });
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
            if (raw) setActivityLogs(JSON.parse(raw) as ActivityLogItem[]);
        } catch {}
    }, []);

    useEffect(() => {
        const onScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), 4000);
        return () => window.clearTimeout(timer);
    }, [notice]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        fetch("/api/admin/pendaftar", { cache: "no-store" })
            .then(async (response) => {
                const result = (await response.json()) as { registrations?: Registration[]; error?: string };
                if (response.status === 401) {
                    router.replace("/admin/login");
                    return;
                }
                if (!response.ok) throw new Error(result.error || "Data pendaftar gagal dimuat.");
                if (active) setRegistrations(result.registrations ?? []);
            })
            .catch((fetchError: unknown) => {
                if (active) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Terjadi kesalahan saat memuat data."
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [reload, router]);

    // Statistics Computation (1:1 with Flutter DashboardScreen)
    const totalCount = registrations.length;
    const pendingCount = registrations.filter((d) => d.status === "Menunggu verifikasi").length;
    const approvedCount = registrations.filter((d) => isApprovedStatus(d.status)).length;
    const problematicCount = registrations.filter((d) => isProblematicStatus(d.status)).length;

    const rplDocs = registrations.filter((d) => (d.major ?? "").includes("RPL"));
    const rplTotal = rplDocs.length;
    const rplApproved = rplDocs.filter((d) => isApprovedStatus(d.status)).length;

    const tbsmDocs = registrations.filter((d) => (d.major ?? "").includes("TBSM"));
    const tbsmTotal = tbsmDocs.length;
    const tbsmApproved = tbsmDocs.filter((d) => isApprovedStatus(d.status)).length;

    const pendingDocsCount = registrations.filter((d) => !hasUploadedDocuments(d)).length;
    const completeDocsCount = totalCount - pendingDocsCount;

    // Filter & Sort Logic
    const filteredRegistrations = registrations
        .filter((data) => {
            const q = searchQuery.trim().toLowerCase();
            if (q) {
                const searchable = [
                    data.name,
                    data.registration_number,
                    data.nisn,
                    data.phone,
                    data.parent_name,
                    data.parent_phone,
                    data.major,
                    data.admin_notes,
                ]
                    .join(" ")
                    .toLowerCase();
                if (!searchable.includes(q)) return false;
            }

            if (selectedStatusFilter === "Menunggu verifikasi" && data.status !== "Menunggu verifikasi") {
                return false;
            }
            if (selectedStatusFilter === "Lulus verifikasi" && !isApprovedStatus(data.status)) {
                return false;
            }
            if (selectedStatusFilter === "Berkas bermasalah" && !isProblematicStatus(data.status)) {
                return false;
            }

            if (selectedMajorFilter === "RPL" && !(data.major ?? "").includes("RPL")) {
                return false;
            }
            if (selectedMajorFilter === "TBSM" && !(data.major ?? "").includes("TBSM")) {
                return false;
            }

            if (selectedDocFilter === "Berkas Lengkap" && !hasUploadedDocuments(data)) {
                return false;
            }
            if (selectedDocFilter === "Menunggu Berkas" && hasUploadedDocuments(data)) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "oldest") {
                return (a.created_at ?? "").localeCompare(b.created_at ?? "");
            }
            if (sortBy === "name_asc") {
                return (a.name ?? "").toLowerCase().localeCompare((b.name ?? "").toLowerCase());
            }
            if (sortBy === "name_desc") {
                return (b.name ?? "").toLowerCase().localeCompare((a.name ?? "").toLowerCase());
            }
            return (b.created_at ?? "").localeCompare(a.created_at ?? "");
        });

    const hasActiveFilters =
        searchQuery.trim().length > 0 ||
        selectedStatusFilter !== "Semua" ||
        selectedMajorFilter !== "Semua" ||
        selectedDocFilter !== "Semua Berkas" ||
        sortBy !== "newest";

    const resetAllFilters = () => {
        setSearchQuery("");
        setSelectedStatusFilter("Semua");
        setSelectedMajorFilter("Semua");
        setSelectedDocFilter("Semua Berkas");
        setSortBy("newest");
    };

    const toggleSelectOne = (number: string) => {
        setSelectedNumbers((prev) =>
            prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
        );
    };

    const toggleSelectAllFiltered = () => {
        const allFilteredNumbers = filteredRegistrations.map((r) => r.registration_number);
        const allSelected =
            allFilteredNumbers.length > 0 &&
            allFilteredNumbers.every((n) => selectedNumbers.includes(n));
        if (allSelected) {
            setSelectedNumbers((prev) => prev.filter((n) => !allFilteredNumbers.includes(n)));
        } else {
            setSelectedNumbers((prev) => Array.from(new Set([...prev, ...allFilteredNumbers])));
        }
    };

    const batchUpdateStatus = async (status: string) => {
        if (!selectedNumbers.length) return;
        setBatchLoading(true);
        setError("");
        try {
            const response = await fetch("/api/admin/pendaftar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ numbers: selectedNumbers, status }),
            });
            const result = (await response.json()) as { error?: string };
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            if (!response.ok) throw new Error(result.error || "Gagal memperbarui status massal.");
            setRegistrations((current) =>
                current.map((item) =>
                    selectedNumbers.includes(item.registration_number)
                        ? { ...item, status }
                        : item
                )
            );
            logActivity(
                `Ubah Status Massal (${selectedNumbers.length} siswa) -> ${status}`,
                selectedNumbers.slice(0, 3).join(", ")
            );
            setNotice(`${selectedNumbers.length} pendaftar berhasil diubah ke "${status}".`);
            setSelectedNumbers([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memperbarui status massal.");
        } finally {
            setBatchLoading(false);
        }
    };

    const batchDeleteSelected = async () => {
        if (!selectedNumbers.length) return;
        if (!window.confirm(`Hapus permanen ${selectedNumbers.length} data pendaftar yang dipilih?`)) {
            return;
        }
        setBatchLoading(true);
        setError("");
        try {
            await Promise.all(
                selectedNumbers.map((num) =>
                    fetch(`/api/admin/pendaftar?number=${encodeURIComponent(num)}`, {
                        method: "DELETE",
                    })
                )
            );
            setRegistrations((current) =>
                current.filter((item) => !selectedNumbers.includes(item.registration_number))
            );
            logActivity(`Hapus Massal (${selectedNumbers.length} siswa)`, selectedNumbers.join(", "));
            setNotice(`${selectedNumbers.length} data pendaftar berhasil dihapus.`);
            setSelectedNumbers([]);
        } catch {
            setError("Sebagian data pendaftar gagal dihapus.");
        } finally {
            setBatchLoading(false);
        }
    };

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard?.writeText(text);
        setNotice(message);
    };

    const syncEditForm = (reg: RegistrationDetail) => {
        setEditForm({
            name: reg.name || "",
            nisn: reg.nisn || "",
            birth_date: reg.birth_date && reg.birth_date !== "-" ? reg.birth_date : "",
            phone: reg.phone || "",
            parent_name: reg.parent_name || "",
            parent_phone: reg.parent_phone || "",
            major: reg.major || "RPL - Teknik Komputer",
            admin_notes: reg.admin_notes || "",
        });
    };

    const openDetails = async (reg: Registration) => {
        setLoadingDetails(true);
        setError("");
        setConfirmDelete(false);
        setIsEditingProfile(false);
        const initialDetail: RegistrationDetail = {
            ...reg,
            birth_date: reg.birth_date ?? "-",
        };
        setSelectedRegistration(initialDetail);
        syncEditForm(initialDetail);
        setDocuments([]);
        try {
            const response = await fetch(
                `/api/admin/pendaftar?number=${encodeURIComponent(reg.registration_number)}`,
                { cache: "no-store" }
            );
            const result = (await response.json()) as {
                registration?: RegistrationDetail;
                documents?: DocumentLink[];
                error?: string;
            };
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            if (!response.ok || !result.registration) {
                throw new Error(result.error || "Detail pendaftar gagal dimuat.");
            }
            setSelectedRegistration(result.registration);
            syncEditForm(result.registration);
            setDocuments(result.documents ?? []);
        } catch (detailError) {
            setError(
                detailError instanceof Error ? detailError.message : "Detail pendaftar gagal dimuat."
            );
        } finally {
            setLoadingDetails(false);
        }
    };

    const saveProfileEdits = async () => {
        if (!selectedRegistration) return;
        setSavingProfile(true);
        setError("");
        try {
            const payload = {
                number: selectedRegistration.registration_number,
                ...editForm,
            };
            const response = await fetch("/api/admin/pendaftar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = (await response.json()) as { error?: string };
            if (!response.ok) throw new Error(result.error || "Gagal menyimpan perubahan biodata.");
            setRegistrations((current) =>
                current.map((item) =>
                    item.registration_number === selectedRegistration.registration_number
                        ? { ...item, ...editForm }
                        : item
                )
            );
            setSelectedRegistration((current) =>
                current ? { ...current, ...editForm } : current
            );
            setIsEditingProfile(false);
            logActivity(
                "Edit Biodata / Catatan Panitia",
                `${editForm.name} (${selectedRegistration.registration_number})`
            );
            setNotice("Perubahan biodata & catatan panitia berhasil disimpan!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan biodata.");
        } finally {
            setSavingProfile(false);
        }
    };

    const updateStatus = async (number: string, status: string, studentName?: string) => {
        setSavingNumber(number);
        setError("");
        try {
            const response = await fetch("/api/admin/pendaftar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ number, status }),
            });
            const result = (await response.json()) as { error?: string };
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            if (!response.ok) throw new Error(result.error || "Status gagal diperbarui.");
            setRegistrations((current) =>
                current.map((item) =>
                    item.registration_number === number ? { ...item, status } : item
                )
            );
            setSelectedRegistration((current) =>
                current?.registration_number === number ? { ...current, status } : current
            );
            setQuickStatusTarget(null);
            logActivity(`Ubah Status -> ${status}`, `${studentName ?? number} (${number})`);
            setNotice(
                `Status ${studentName ?? number} berhasil diubah ke: ${status}`
            );
        } catch (updateError) {
            setError(
                updateError instanceof Error ? updateError.message : "Status gagal diperbarui."
            );
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
            const result = (await response.json()) as { registration?: Registration; error?: string };
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            if (!response.ok || !result.registration) {
                throw new Error(result.error || "Pendaftar gagal ditambahkan.");
            }
            setRegistrations((current) => [result.registration!, ...current]);
            logActivity(
                "Tambah Pendaftar Manual",
                `${result.registration.name} (${result.registration.registration_number})`
            );
            setNotice(`Pendaftar ${result.registration.name} berhasil ditambahkan.`);
            setError("");
            setAddDialogOpen(false);
            form.reset();
        } catch (err) {
            setAddError(err instanceof Error ? err.message : "Pendaftar gagal ditambahkan.");
        } finally {
            setSavingNewRegistration(false);
        }
    };

    const deleteRegistration = async (number: string, name?: string) => {
        setDeletingNumber(number);
        setError("");
        try {
            const response = await fetch(
                `/api/admin/pendaftar?number=${encodeURIComponent(number)}`,
                { method: "DELETE" }
            );
            const result = (await response.json()) as { error?: string };
            if (response.status === 401) {
                router.replace("/admin/login");
                return;
            }
            if (!response.ok) throw new Error(result.error || "Data pendaftar gagal dihapus.");
            setRegistrations((current) =>
                current.filter((item) => item.registration_number !== number)
            );
            setSelectedNumbers((prev) => prev.filter((n) => n !== number));
            setSelectedRegistration(null);
            setConfirmDelete(false);
            logActivity("Hapus Data Pendaftar", `${name ?? number} (${number})`);
            setNotice(`Data pendaftar ${name ?? number} berhasil dihapus.`);
        } catch (deleteError) {
            setError(
                deleteError instanceof Error ? deleteError.message : "Data pendaftar gagal dihapus."
            );
        } finally {
            setDeletingNumber("");
        }
    };

    const signOut = async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        router.replace("/admin/login");
        router.refresh();
    };

    const exportCsv = (onlySelected = false) => {
        const sourceList = onlySelected
            ? registrations.filter((r) => selectedNumbers.includes(r.registration_number))
            : filteredRegistrations;
        const columns = [
            "Nomor",
            "Nama",
            "NISN",
            "Tanggal Lahir",
            "Jurusan",
            "Telepon",
            "Nama Wali",
            "Telepon Wali",
            "Status",
            "Catatan Panitia",
            "Tanggal Daftar",
        ];
        const rows = sourceList.map((item) => [
            item.registration_number,
            item.name,
            item.nisn,
            item.birth_date ?? "",
            item.major,
            item.phone,
            item.parent_name,
            item.parent_phone,
            item.status,
            item.admin_notes ?? "",
            item.created_at,
        ]);
        const csv = [columns, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
        const url = URL.createObjectURL(
            new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = onlySelected
            ? `pendaftar-terpilih-${sourceList.length}-siswa.csv`
            : "pendaftar-ppdb-smk-bani-masum.csv";
        link.click();
        URL.revokeObjectURL(url);
        logActivity("Export Data CSV", `${sourceList.length} data pendaftar`);
        setNotice(`Data CSV (${sourceList.length} siswa) berhasil diunduh!`);
    };

    const quotaPercentage = Math.min(100, Math.round((approvedCount / TARGET_QUOTA) * 100));

    return (
        <main className="admin-portal min-h-screen bg-paper-soft pb-28 text-ink sm:pb-24">
            {/* Floating Toast Notification (Flutter SnackBar style) */}
            {notice && (
                <div
                    role="status"
                    className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-2.5 rounded-xl bg-[#15803D] px-4 py-3 text-xs font-bold text-white shadow-xl sm:bottom-6 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:text-sm"
                >
                    <CheckCircle2 size={18} className="shrink-0 text-white" />
                    <span className="truncate">{notice}</span>
                </div>
            )}

            {/* Flutter AppBar (#0F172A Deep Navy) */}
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F172A] text-white">
                <div className="mx-auto flex h-15 max-w-6xl items-center justify-between gap-2 px-3.5 sm:h-16 sm:gap-3 sm:px-6">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div
                            className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#38BDF8] p-1 sm:h-10 sm:w-10"
                            style={{ backgroundColor: "#ffffff" }}
                        >
                            <Image
                                src="/logo.png"
                                alt="Logo SMK Bani Masum"
                                fill
                                sizes="40px"
                                className="object-contain p-0.5"
                            />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate font-black tracking-[0.4px] text-[13px] sm:text-base text-white leading-tight">
                                SMK BANI MASUM
                            </div>
                            <div className="truncate text-[9.5px] sm:text-[10px] font-bold tracking-wider text-[#38BDF8] uppercase">
                                PANITIA PPDB 2026/2027
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setAddError("");
                                setAddDialogOpen(true);
                            }}
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#1D4ED8]"
                            style={{ color: "#ffffff" }}
                            title="Tambah Pendaftar Manual"
                        >
                            <Plus size={15} />
                            <span>Tambah</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowBroadcastModal(true)}
                            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#4ADE80] transition-colors hover:bg-white/20 sm:w-auto sm:px-3"
                            title="Pusat Siaran & Template WA"
                        >
                            <Megaphone size={16} />
                            <span className="ml-1.5 hidden text-xs font-bold text-white md:inline">
                                Siaran WA
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowReportModal(true)}
                            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#FBBF24] transition-colors hover:bg-white/20 sm:w-auto sm:px-3"
                            title="Laporan Rekapitulasi Resmi (Cetak / PDF)"
                        >
                            <Printer size={16} />
                            <span className="ml-1.5 hidden text-xs font-bold text-white lg:inline">
                                Laporan
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => exportCsv(false)}
                            disabled={!filteredRegistrations.length}
                            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#38BDF8] transition-colors hover:bg-white/20 disabled:opacity-40 sm:w-auto sm:px-3"
                            title="Export Data ke CSV"
                        >
                            <Download size={16} />
                            <span className="ml-1.5 hidden text-xs font-bold text-white md:inline">
                                CSV
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowActivityModal(true)}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#C084FC] transition-colors hover:bg-white/20"
                            title="Riwayat Aktivitas Panitia"
                        >
                            <History size={16} />
                            {activityLogs.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-1 text-[9px] font-black text-white">
                                    {activityLogs.length > 9 ? "9+" : activityLogs.length}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setReload((v) => v + 1)}
                            disabled={loading}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                            title="Muat Ulang Data"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                        <Link
                            href="/admin/ekantin"
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/15 px-2.5 text-xs font-bold text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/25 sm:px-3"
                            title="Buka Dashboard Admin E-Kantin"
                        >
                            <span>🍱</span>
                            <span className="hidden xs:inline sm:inline">E-Kantin</span>
                        </Link>
                        <Link
                            href="/"
                            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
                            title="Lihat Beranda Website"
                        >
                            <Home size={16} />
                        </Link>
                        <ThemeToggle />
                        <button
                            type="button"
                            onClick={() => setShowLogoutConfirm(true)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/15 text-red-300 transition-colors hover:bg-red-500/25"
                            title="Keluar Akun"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Top Stats & Greeting Banner (1:1 with Flutter DashboardScreen SliverToBoxAdapter) */}
            <section className="rounded-b-[26px] bg-[#0F172A] px-3.5 pt-3.5 pb-4 text-white shadow-md sm:px-6 sm:pt-5 sm:pb-6">
                <div className="mx-auto max-w-6xl">
                    {/* Greeting Row */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-[15px] font-extrabold text-white sm:text-lg">
                                {getGreeting()}, Administrator 👋
                            </h1>
                            <p className="mt-0.5 text-[11px] font-medium text-[#94A3B8] sm:text-xs">
                                Portal Administrasi PPDB SMK Bani Masum
                            </p>
                        </div>
                        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#10B981]/40 bg-[#10B981]/15 px-2.5 py-1">
                            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                            <span className="text-[10px] font-bold text-[#10B981]">Live Sync</span>
                        </div>
                    </div>

                    {/* Interactive 4 Stat Cards Grid */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-3">
                        {[
                            {
                                title: "Total",
                                count: loading ? "..." : String(totalCount),
                                color: "#2563EB",
                                filterKey: "Semua",
                                icon: Users,
                            },
                            {
                                title: "Menunggu",
                                count: loading ? "..." : String(pendingCount),
                                color: "#F59E0B",
                                filterKey: "Menunggu verifikasi",
                                icon: Clock,
                            },
                            {
                                title: "Lulus",
                                count: loading ? "..." : String(approvedCount),
                                color: "#10B981",
                                filterKey: "Lulus verifikasi",
                                icon: CheckCircle2,
                            },
                            {
                                title: "Masalah",
                                count: loading ? "..." : String(problematicCount),
                                color: "#EF4444",
                                filterKey: "Berkas bermasalah",
                                icon: AlertTriangle,
                            },
                        ].map((card) => {
                            const isSelected = selectedStatusFilter === card.filterKey;
                            const Icon = card.icon;
                            return (
                                <button
                                    key={card.title}
                                    type="button"
                                    onClick={() =>
                                        setSelectedStatusFilter(
                                            selectedStatusFilter === card.filterKey &&
                                                card.filterKey !== "Semua"
                                                ? "Semua"
                                                : card.filterKey
                                        )
                                    }
                                    className="flex flex-col items-start rounded-[14px] px-3 py-2.5 text-left transition-all active:scale-[0.98]"
                                    style={{
                                        backgroundColor: isSelected
                                            ? `color-mix(in srgb, ${card.color} 22%, #1E293B)`
                                            : "#1E293B",
                                        border: `1.5px solid ${
                                            isSelected ? card.color : "rgba(255,255,255,0.08)"
                                        }`,
                                    }}
                                >
                                    <div className="flex w-full items-center justify-between gap-1">
                                        <span
                                            className={`truncate text-[11px] ${
                                                isSelected
                                                    ? "font-bold text-white"
                                                    : "font-semibold text-[#94A3B8]"
                                            }`}
                                        >
                                            {card.title}
                                        </span>
                                        <Icon size={14} style={{ color: card.color }} />
                                    </div>
                                    <span className="mt-1 text-xl font-black text-white sm:mt-1.5 sm:text-2xl">
                                        {card.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quota & Major Distribution Card (Expandable) */}
                    <div className="mt-2.5 rounded-[16px] border border-white/10 bg-[#1E293B] p-3 sm:mt-3">
                        <button
                            type="button"
                            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                            className="flex w-full items-center justify-between py-0.5 text-left"
                        >
                            <div className="flex items-center gap-2">
                                <PieChart size={15} className="text-[#38BDF8]" />
                                <span className="text-xs font-bold text-white">
                                    Target Kuota Penerimaan ({approvedCount}/{TARGET_QUOTA})
                                </span>
                            </div>
                            <ChevronUp
                                size={18}
                                className={`text-[#38BDF8] transition-transform duration-300 ${
                                    isStatsExpanded ? "rotate-0" : "rotate-180"
                                }`}
                            />
                        </button>

                        {isStatsExpanded && (
                            <div className="mt-2.5 space-y-2.5">
                                {/* Quota Progress Bar */}
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-[#10B981] transition-all duration-500"
                                        style={{ width: `${quotaPercentage}%` }}
                                    />
                                </div>

                                {/* Mini Department Pills */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedMajorFilter(
                                                selectedMajorFilter === "RPL" ? "Semua" : "RPL"
                                            )
                                        }
                                        className="flex items-center justify-between rounded-[10px] px-3 py-2 text-xs transition-all"
                                        style={{
                                            backgroundColor:
                                                selectedMajorFilter === "RPL"
                                                    ? "color-mix(in srgb, #2563EB 22%, #1E293B)"
                                                    : "rgba(255,255,255,0.05)",
                                            border: `1.5px solid ${
                                                selectedMajorFilter === "RPL"
                                                    ? "#2563EB"
                                                    : "rgba(255,255,255,0.1)"
                                            }`,
                                        }}
                                    >
                                        <span className="font-bold text-white">💻 RPL</span>
                                        <span
                                            className={`font-bold ${
                                                selectedMajorFilter === "RPL"
                                                    ? "text-white"
                                                    : "text-[#94A3B8]"
                                            }`}
                                        >
                                            {rplTotal} ({rplApproved}✓)
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedMajorFilter(
                                                selectedMajorFilter === "TBSM" ? "Semua" : "TBSM"
                                            )
                                        }
                                        className="flex items-center justify-between rounded-[10px] px-3 py-2 text-xs transition-all"
                                        style={{
                                            backgroundColor:
                                                selectedMajorFilter === "TBSM"
                                                    ? "color-mix(in srgb, #F97316 22%, #1E293B)"
                                                    : "rgba(255,255,255,0.05)",
                                            border: `1.5px solid ${
                                                selectedMajorFilter === "TBSM"
                                                    ? "#F97316"
                                                    : "rgba(255,255,255,0.1)"
                                            }`,
                                        }}
                                    >
                                        <span className="font-bold text-white">🏍️ TBSM</span>
                                        <span
                                            className={`font-bold ${
                                                selectedMajorFilter === "TBSM"
                                                    ? "text-white"
                                                    : "text-[#94A3B8]"
                                            }`}
                                        >
                                            {tbsmTotal} ({tbsmApproved}✓)
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Bar: Jadwal & Gelombang, Analisis Detail, Laporan Rekap */}
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:gap-2">
                        <button
                            type="button"
                            onClick={() => setShowScheduleModal(true)}
                            className="flex items-center justify-center gap-1 rounded-[10px] border border-white/25 bg-white/5 px-2 py-2 text-[11px] font-bold text-white transition-colors hover:bg-white/10 sm:gap-1.5 sm:text-xs"
                        >
                            <Calendar size={13} className="shrink-0 text-[#38BDF8]" />
                            <span className="truncate">Jadwal</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAnalyticsModal(true)}
                            className="flex items-center justify-center gap-1 rounded-[10px] bg-[#1D4ED8] px-2 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#2563EB] sm:gap-1.5 sm:text-xs"
                            style={{ color: "#ffffff" }}
                        >
                            <BarChart3 size={13} className="shrink-0" />
                            <span className="truncate">Analisis</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowReportModal(true)}
                            className="flex items-center justify-center gap-1 rounded-[10px] border border-[#38BDF8]/40 bg-[#38BDF8]/15 px-2 py-2 text-[11px] font-bold text-[#38BDF8] transition-colors hover:bg-[#38BDF8]/25 sm:gap-1.5 sm:text-xs"
                        >
                            <Printer size={13} className="shrink-0" />
                            <span className="truncate">Rekap PDF</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Search, Sort & Filter Chips Section */}
            <section className="mx-auto max-w-6xl px-3.5 pt-3.5 sm:px-6 sm:pt-4">
                {/* Search TextField */}
                <div className="relative">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8]"
                    />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama, no. reg, NISN, atau catatan..."
                        aria-label="Cari pendaftar"
                        className="block w-full rounded-[12px] border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-9 text-[13px] font-medium text-[#0F172A] placeholder:text-[#64748B] shadow-2xs focus:border-[#1D4ED8] focus:outline-none sm:py-3 sm:pl-11"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
                            aria-label="Bersihkan pencarian"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Sort, Major & Document Filter Chips Row */}
                <div className="no-scrollbar mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2">
                    <button
                        type="button"
                        onClick={() => setShowSortModal(true)}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                            sortBy !== "newest"
                                ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]"
                                : "border-[#E2E8F0] bg-white text-[#0F172A]"
                        }`}
                    >
                        <ArrowUpDown size={13} />
                        <span>
                            {sortBy === "newest"
                                ? "Terbaru"
                                : sortBy === "oldest"
                                  ? "Terlama"
                                  : sortBy === "name_asc"
                                    ? "Nama A-Z"
                                    : "Nama Z-A"}
                        </span>
                    </button>

                    <div className="h-4 w-[1px] shrink-0 bg-[#E2E8F0]" />

                    {MAJOR_FILTERS.map((m) => {
                        const isSelected = selectedMajorFilter === m;
                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setSelectedMajorFilter(m)}
                                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                                    isSelected
                                        ? "border-[#0F172A] bg-[#0F172A] font-bold text-white"
                                        : "border-[#E2E8F0] bg-white font-medium text-[#0F172A] hover:bg-slate-50"
                                }`}
                                style={isSelected ? { color: "#ffffff" } : undefined}
                            >
                                {m === "Semua" ? "Semua Jurusan" : m}
                            </button>
                        );
                    })}

                    <div className="h-4 w-[1px] shrink-0 bg-[#E2E8F0]" />

                    {DOC_FILTERS.map((docFilter) => {
                        const isSelected = selectedDocFilter === docFilter;
                        const label =
                            docFilter === "Berkas Lengkap"
                                ? `Berkas Lengkap (${completeDocsCount})`
                                : docFilter === "Menunggu Berkas"
                                  ? `Menunggu Berkas (${pendingDocsCount})`
                                  : docFilter;
                        return (
                            <button
                                key={docFilter}
                                type="button"
                                onClick={() => setSelectedDocFilter(docFilter)}
                                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                                    isSelected
                                        ? "border-[#0D9488] bg-[#0D9488] font-bold text-white"
                                        : "border-[#E2E8F0] bg-white font-medium text-[#0F172A] hover:bg-slate-50"
                                }`}
                                style={isSelected ? { color: "#ffffff" } : undefined}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Status Filter Chips Row */}
                <div className="no-scrollbar mt-1.5 flex items-center gap-1.5 overflow-x-auto pb-1">
                    {STATUS_FILTERS.map((cat) => {
                        const isSelected = selectedStatusFilter === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedStatusFilter(cat)}
                                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                                    isSelected
                                        ? "border-[#1D4ED8] bg-[#1D4ED8] font-bold text-white"
                                        : "border-[#E2E8F0] bg-white font-medium text-[#0F172A] hover:bg-slate-50"
                                }`}
                                style={isSelected ? { color: "#ffffff" } : undefined}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* Result Count, Bulk Select & View Mode Switcher Row */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[11px] font-semibold text-[#64748B] sm:text-[11.5px]">
                            {filteredRegistrations.length} dari {totalCount} siswa
                        </p>
                        {filteredRegistrations.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleSelectAllFiltered}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] transition-colors hover:border-[#1D4ED8]"
                            >
                                {filteredRegistrations.every((r) =>
                                    selectedNumbers.includes(r.registration_number)
                                ) ? (
                                    <>
                                        <CheckSquare size={13} className="text-[#1D4ED8]" />
                                        <span>Batal Pilih</span>
                                    </>
                                ) : (
                                    <>
                                        <Square size={13} className="text-[#64748B]" />
                                        <span>Pilih Semua</span>
                                    </>
                                )}
                            </button>
                        )}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetAllFilters}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DC2626] hover:underline"
                            >
                                <RotateCcw size={12} />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>

                    {/* View Mode Switcher (Kartu Grid vs Tabel Kompak) */}
                    <div className="inline-flex items-center rounded-xl border border-[#E2E8F0] bg-white p-0.5">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                viewMode === "grid"
                                    ? "bg-[#1D4ED8] text-white"
                                    : "text-[#64748B] hover:text-[#0F172A]"
                            }`}
                            style={viewMode === "grid" ? { color: "#ffffff" } : undefined}
                        >
                            <LayoutGrid size={13} />
                            <span>Kartu</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("table")}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                                viewMode === "table"
                                    ? "bg-[#1D4ED8] text-white"
                                    : "text-[#64748B] hover:text-[#0F172A]"
                            }`}
                            style={viewMode === "table" ? { color: "#ffffff" } : undefined}
                        >
                            <Table2 size={13} />
                            <span>Tabel</span>
                        </button>
                    </div>
                </div>

                {/* Floating / Sticky Batch Action Bar when items are selected (Fixed above bottom nav on mobile) */}
                {selectedNumbers.length > 0 && (
                    <div className="fixed inset-x-3 bottom-[72px] z-40 flex flex-col gap-2 rounded-[18px] border border-[#38BDF8]/40 bg-[#0F172A]/95 p-3 text-white shadow-2xl backdrop-blur-md sm:static sm:inset-auto sm:mt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2563EB] px-2 text-xs font-black text-white">
                                    {selectedNumbers.length}
                                </span>
                                <span className="text-xs font-bold text-white">
                                    siswa dipilih
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedNumbers([])}
                                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-slate-300 sm:hidden"
                            >
                                <X size={12} />
                                <span>Batal</span>
                            </button>
                        </div>
                        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:pb-0">
                            <button
                                type="button"
                                disabled={batchLoading}
                                onClick={() => void batchUpdateStatus("Lulus verifikasi")}
                                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#16A34A] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#15803D] disabled:opacity-50"
                                style={{ color: "#ffffff" }}
                            >
                                <CheckCircle2 size={13} />
                                <span>Luluskan</span>
                            </button>
                            <button
                                type="button"
                                disabled={batchLoading}
                                onClick={() => void batchUpdateStatus("Berkas tidak lengkap")}
                                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#EA580C] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#C2410C] disabled:opacity-50"
                                style={{ color: "#ffffff" }}
                            >
                                <FileWarning size={13} />
                                <span>Berkas Kurang</span>
                            </button>
                            <button
                                type="button"
                                disabled={batchLoading}
                                onClick={() => void batchUpdateStatus("Menunggu verifikasi")}
                                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#D97706] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#B45309] disabled:opacity-50"
                                style={{ color: "#ffffff" }}
                            >
                                <Clock size={13} />
                                <span>Reset</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => exportCsv(true)}
                                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-[#38BDF8] transition-colors hover:bg-white/20"
                            >
                                <Download size={13} />
                                <span>CSV</span>
                            </button>
                            <button
                                type="button"
                                disabled={batchLoading}
                                onClick={() => void batchDeleteSelected()}
                                className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-red-400/30 bg-red-500/20 px-3 py-1.5 text-[11px] font-bold text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                            >
                                <Trash2 size={13} />
                                <span>Hapus</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedNumbers([])}
                                className="hidden sm:inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-300 hover:bg-white/10"
                            >
                                <X size={13} />
                                <span>Batal</span>
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mt-3 flex items-center justify-between rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-xs font-bold text-[#DC2626]"
                    >
                        <span>{error}</span>
                        <button type="button" onClick={() => setError("")}>
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* Registrations List: Card Grid OR Compact Table View */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#1D4ED8] border-t-transparent" />
                        <p className="mt-3 text-xs font-bold text-[#64748B]">
                            Memuat data pendaftar dari Firebase...
                        </p>
                    </div>
                ) : filteredRegistrations.length === 0 ? (
                    <div className="my-8 flex flex-col items-center justify-center rounded-[20px] border border-[#E2E8F0] bg-white p-10 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]">
                            <Search size={30} />
                        </div>
                        <h3 className="mt-4 text-[15px] font-bold text-[#0F172A]">
                            Tidak ada pendaftar ditemukan
                        </h3>
                        <p className="mt-1 max-w-xs text-xs text-[#64748B]">
                            Sesuaikan kata kunci pencarian atau reset filter yang sedang aktif.
                        </p>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={resetAllFilters}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-[#0F172A] px-4 py-2 text-xs font-bold text-white"
                                style={{ color: "#ffffff" }}
                            >
                                <RefreshCw size={14} />
                                <span>Tampilkan Semua Data</span>
                            </button>
                        )}
                    </div>
                ) : viewMode === "table" ? (
                    /* COMPACT TABLE VIEW FOR DESKTOP / PANITIA CEPAT */
                    <div className="mt-3 overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                                        <th className="w-10 px-3.5 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={toggleSelectAllFiltered}
                                                className="inline-flex items-center justify-center text-[#1D4ED8]"
                                                title="Pilih Semua"
                                            >
                                                {filteredRegistrations.every((r) =>
                                                    selectedNumbers.includes(r.registration_number)
                                                ) ? (
                                                    <CheckSquare size={15} />
                                                ) : (
                                                    <Square size={15} className="text-[#64748B]" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-3.5 py-3">Siswa & No. Reg</th>
                                        <th className="px-3.5 py-3">NISN</th>
                                        <th className="px-3.5 py-3">Jurusan</th>
                                        <th className="px-3.5 py-3">Kelengkapan Berkas</th>
                                        <th className="px-3.5 py-3">Status Verifikasi</th>
                                        <th className="px-3.5 py-3">Catatan Panitia</th>
                                        <th className="px-3.5 py-3">Waktu Daftar</th>
                                        <th className="px-3.5 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0]">
                                    {filteredRegistrations.map((reg) => {
                                        const number = reg.registration_number;
                                        const isChecked = selectedNumbers.includes(number);
                                        const status = reg.status || "Menunggu verifikasi";
                                        const statusColor = getStatusColor(status);
                                        const statusBgColor = getStatusBgColor(status);
                                        const isRpl = (reg.major || "RPL").includes("RPL");
                                        const isDocsPending = !hasUploadedDocuments(reg);

                                        return (
                                            <tr
                                                key={number}
                                                onClick={() => void openDetails(reg)}
                                                className={`cursor-pointer transition-colors hover:bg-[#F8FAFC] ${
                                                    isChecked ? "bg-[#EFF6FF]/40" : ""
                                                }`}
                                            >
                                                <td
                                                    className="px-3.5 py-3 text-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSelectOne(number);
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center justify-center text-[#1D4ED8]"
                                                    >
                                                        {isChecked ? (
                                                            <CheckSquare size={15} />
                                                        ) : (
                                                            <Square
                                                                size={15}
                                                                className="text-[#64748B]"
                                                            />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-3.5 py-3">
                                                    <div className="font-extrabold text-[#0F172A]">
                                                        {reg.name}
                                                    </div>
                                                    <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-[#64748B]">
                                                        <span>{number}</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(
                                                                    number,
                                                                    "Nomor pendaftaran disalin!"
                                                                );
                                                            }}
                                                            className="text-[#64748B] hover:text-[#1D4ED8]"
                                                        >
                                                            <Copy size={11} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-3.5 py-3 font-mono font-semibold text-[#0F172A]">
                                                    {reg.nisn}
                                                </td>
                                                <td className="px-3.5 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-[8px] border px-2 py-0.5 text-[11px] font-bold ${
                                                            isRpl
                                                                ? "border-[#2563EB]/30 bg-[#EFF6FF] text-[#1D4ED8]"
                                                                : "border-[#F97316]/30 bg-[#FFF7ED] text-[#EA580C]"
                                                        }`}
                                                    >
                                                        {isRpl ? (
                                                            <Laptop size={11} />
                                                        ) : (
                                                            <Wrench size={11} />
                                                        )}
                                                        <span>
                                                            {(reg.major || "RPL").split(" - ")[0]}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td className="px-3.5 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-[8px] border px-2 py-0.5 text-[11px] font-bold ${
                                                            isDocsPending
                                                                ? "border-[#F59E0B]/40 bg-[#FFFBEB] text-[#D97706]"
                                                                : "border-[#10B981]/40 bg-[#F0FDF4] text-[#15803D]"
                                                        }`}
                                                    >
                                                        {isDocsPending ? (
                                                            <FileClock size={11} />
                                                        ) : (
                                                            <FileCheck2 size={11} />
                                                        )}
                                                        <span>
                                                            {isDocsPending
                                                                ? "Menunggu"
                                                                : "Lengkap"}
                                                        </span>
                                                    </span>
                                                </td>
                                                <td
                                                    className="px-3.5 py-3"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setQuickStatusTarget(reg);
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-opacity hover:opacity-85"
                                                        style={{
                                                            backgroundColor: statusBgColor,
                                                            color: statusColor,
                                                        }}
                                                    >
                                                        <span
                                                            className="h-1.5 w-1.5 rounded-full"
                                                            style={{ backgroundColor: statusColor }}
                                                        />
                                                        <span>{status}</span>
                                                        <Edit3 size={10} />
                                                    </button>
                                                </td>
                                                <td className="max-w-44 px-3.5 py-3">
                                                    {reg.admin_notes ? (
                                                        <span className="inline-flex items-center gap-1 truncate rounded-lg border border-[#F59E0B]/30 bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-semibold text-[#D97706]">
                                                            <StickyNote size={11} className="shrink-0" />
                                                            <span className="truncate">
                                                                {reg.admin_notes}
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#64748B]">-</span>
                                                    )}
                                                </td>
                                                <td className="px-3.5 py-3 text-[11px] font-medium text-[#64748B]">
                                                    {formatFlutterDate(reg.created_at)}
                                                </td>
                                                <td
                                                    className="px-3.5 py-3 text-right"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setQuickContactTarget(reg)
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#FEF3C7] hover:text-[#D97706]"
                                                            title="Hubungi WA / Telepon"
                                                        >
                                                            <Phone size={14} />
                                                        </button>
                                                        <Link
                                                            href={`/ppdb/tiket?number=${encodeURIComponent(number)}`}
                                                            target="_blank"
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                                                            title="Lihat / Cetak Kartu Bukti Pendaftaran"
                                                        >
                                                            <Ticket size={14} />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => void openDetails(reg)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                                                            title="Buka Detail & Edit"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRegistrations.map((reg) => {
                            const name = reg.name || "Tanpa Nama";
                            const number = reg.registration_number;
                            const isChecked = selectedNumbers.includes(number);
                            const status = reg.status || "Menunggu verifikasi";
                            const major = reg.major || "RPL";
                            const isRpl = major.includes("RPL");
                            const statusColor = getStatusColor(status);
                            const statusBgColor = getStatusBgColor(status);
                            const isDocsPending = !hasUploadedDocuments(reg);
                            const initials = name
                                .trim()
                                .split(/\s+/)
                                .map((w) => w[0] ?? "")
                                .slice(0, 2)
                                .join("")
                                .toUpperCase();
                            const hasValidPhoto =
                                typeof reg.photo_url === "string" &&
                                reg.photo_url.startsWith("http");

                            return (
                                <article
                                    key={number}
                                    onClick={() => void openDetails(reg)}
                                    className={`group cursor-pointer rounded-[18px] border bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-[#1D4ED8]/40 hover:shadow-md ${
                                        isChecked
                                            ? "border-[#2563EB] ring-1 ring-[#2563EB]/40"
                                            : "border-[#E2E8F0]"
                                    }`}
                                >
                                    {/* Top Row: Selection Checkbox + Avatar + Name + Reg Number + Quick Action Buttons */}
                                    <div className="flex items-start gap-2.5">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelectOne(number);
                                            }}
                                            className="mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#64748B] hover:text-[#1D4ED8]"
                                            title="Pilih untuk aksi massal"
                                        >
                                            {isChecked ? (
                                                <CheckSquare size={17} className="text-[#2563EB]" />
                                            ) : (
                                                <Square size={17} />
                                            )}
                                        </button>

                                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-[#2563EB]/25 bg-[#EFF6FF]">
                                            {hasValidPhoto ? (
                                                <img
                                                    src={reg.photo_url}
                                                    alt={name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[15px] font-extrabold text-[#1D4ED8]">
                                                    {initials || "S"}
                                                </span>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-[15px] font-extrabold tracking-[-0.2px] text-[#0F172A] group-hover:text-[#1D4ED8]">
                                                {name}
                                            </h3>
                                            <div className="mt-0.5 flex items-center gap-1.5">
                                                <span className="truncate text-xs font-semibold text-[#64748B]">
                                                    {number}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(
                                                            number,
                                                            "Nomor pendaftaran disalin!"
                                                        );
                                                    }}
                                                    className="rounded p-0.5 text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]"
                                                    title="Salin Nomor Pendaftaran"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Quick Action Icons */}
                                        <div
                                            className="flex items-center gap-0.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setQuickContactTarget(reg)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#FEF3C7] hover:text-[#D97706]"
                                                title="Kontak & Orang Tua"
                                            >
                                                <Phone size={15} />
                                            </button>
                                            <Link
                                                href={`/ppdb/tiket?number=${encodeURIComponent(number)}`}
                                                target="_blank"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                                                title="Cetak Bukti Pendaftaran"
                                            >
                                                <Ticket size={15} />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => void openDetails(reg)}
                                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                                                title="Lihat Detail Siswa"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Middle Badges: Major & Document Status */}
                                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-[8px] border px-2 py-0.5 text-[11px] font-bold ${
                                                isRpl
                                                    ? "border-[#2563EB]/30 bg-[#EFF6FF] text-[#1D4ED8]"
                                                    : "border-[#F97316]/30 bg-[#FFF7ED] text-[#EA580C]"
                                            }`}
                                        >
                                            {isRpl ? <Laptop size={12} /> : <Wrench size={12} />}
                                            <span>{major.split(" - ")[0]}</span>
                                        </span>

                                        <span
                                            className={`inline-flex items-center gap-1 rounded-[8px] border px-2 py-0.5 text-[11px] font-bold ${
                                                isDocsPending
                                                    ? "border-[#F59E0B]/40 bg-[#FFFBEB] text-[#D97706]"
                                                    : "border-[#10B981]/40 bg-[#F0FDF4] text-[#15803D]"
                                            }`}
                                        >
                                            {isDocsPending ? (
                                                <FileClock size={12} />
                                            ) : (
                                                <FileCheck2 size={12} />
                                            )}
                                            <span>
                                                {isDocsPending ? "Menunggu Berkas" : "Berkas Lengkap"}
                                            </span>
                                        </span>

                                        <span className="rounded-[8px] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-semibold text-[#64748B]">
                                            NISN: {reg.nisn}
                                        </span>
                                    </div>

                                    {/* Catatan Panitia preview if present */}
                                    {reg.admin_notes && (
                                        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/30 bg-[#FFFBEB] px-2.5 py-1 text-[11px] font-semibold text-[#D97706]">
                                            <StickyNote size={12} className="shrink-0" />
                                            <span className="truncate">{reg.admin_notes}</span>
                                        </div>
                                    )}

                                    {/* Bottom Row: Status Pill Badge + Date */}
                                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#F1F5F9] pt-2.5">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setQuickStatusTarget(reg);
                                            }}
                                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-opacity hover:opacity-85"
                                            style={{
                                                backgroundColor: statusBgColor,
                                                color: statusColor,
                                            }}
                                            title="Klik untuk ubah status cepat"
                                        >
                                            <span
                                                className="h-1.5 w-1.5 rounded-full"
                                                style={{ backgroundColor: statusColor }}
                                            />
                                            <span>{status}</span>
                                            <Edit3 size={10} />
                                        </button>

                                        <span className="text-[11px] font-medium text-[#64748B]">
                                            {formatFlutterDate(reg.created_at)}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Floating Back To Top Button (Flutter FloatingActionButton.small) */}
            {showBackToTop && (
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F172A] text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
                    title="Kembali ke Atas"
                >
                    <ArrowUp size={20} />
                </button>
            )}

            {/* =====================================================================
                MODAL 1: DETAIL CALON SISWA (1:1 with Flutter DetailScreen)
               ===================================================================== */}
            {selectedRegistration && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/65 p-0 backdrop-blur-xs sm:items-center sm:p-5"
                    onClick={() => setSelectedRegistration(null)}
                >
                    <div
                        className="max-h-[93dvh] w-full max-w-2xl overflow-y-auto rounded-t-[26px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] shadow-2xl sm:max-h-[92dvh] sm:rounded-[24px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Flutter DetailScreen AppBar */}
                        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-[#0F172A] px-4 py-3 text-white sm:px-5 sm:py-3.5">
                            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRegistration(null)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                                    aria-label="Kembali"
                                >
                                    <X size={18} />
                                </button>
                                <h2 className="truncate text-sm font-bold text-white sm:text-base">
                                    Detail Calon Siswa
                                </h2>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                                <Link
                                    href={`/ppdb/tiket?number=${encodeURIComponent(selectedRegistration.registration_number)}`}
                                    target="_blank"
                                    className="inline-flex h-8 items-center gap-1 rounded-xl bg-white/10 px-2.5 text-xs font-bold text-[#38BDF8] hover:bg-white/20"
                                    title="Buka & Cetak Kartu Bukti Pendaftaran"
                                >
                                    <Ticket size={14} />
                                    <span className="hidden sm:inline">Cetak Tiket</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingProfile((prev) => !prev)}
                                    className={`inline-flex h-8 items-center gap-1 rounded-xl px-2.5 text-xs font-bold transition-colors ${
                                        isEditingProfile
                                            ? "bg-[#2563EB] text-white"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                    }`}
                                    style={isEditingProfile ? { color: "#ffffff" } : undefined}
                                    title="Edit Biodata & Catatan Panitia"
                                >
                                    <Edit3 size={14} />
                                    <span>{isEditingProfile ? "Tutup" : "Edit"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(true)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/25"
                                    title="Hapus Pendaftar"
                                >
                                    <Trash2 size={17} />
                                </button>
                            </div>
                        </div>

                        {/* Student Profile Header Card (#0F172A with rounded bottom 28px) */}
                        <div className="rounded-b-[28px] bg-[#0F172A] px-4 pt-3 pb-6 text-center text-white sm:px-5 sm:pb-7">
                            <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center overflow-hidden rounded-full border-[2.5px] border-[#38BDF8] bg-[#2563EB]/20 shadow-md sm:h-[76px] sm:w-[76px]">
                                {selectedRegistration.photo_url?.startsWith("http") ? (
                                    <img
                                        src={selectedRegistration.photo_url}
                                        alt={selectedRegistration.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[20px] font-black text-white sm:text-[22px]">
                                        {selectedRegistration.name
                                            .trim()
                                            .split(/\s+/)
                                            .map((w) => w[0] ?? "")
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase() || "S"}
                                    </span>
                                )}
                            </div>
                            <h3 className="mt-2.5 text-base font-extrabold text-white sm:mt-3 sm:text-lg">
                                {selectedRegistration.name}
                            </h3>
                            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-[8px] bg-white/10 px-3 py-1">
                                <span className="text-xs font-bold tracking-[0.5px] text-[#38BDF8]">
                                    {selectedRegistration.registration_number}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        copyToClipboard(
                                            selectedRegistration.registration_number,
                                            "Nomor registrasi disalin!"
                                        )
                                    }
                                    className="text-slate-300 hover:text-white"
                                >
                                    <Copy size={12} />
                                </button>
                            </div>
                            <div className="mt-3">
                                <span
                                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold"
                                    style={{
                                        backgroundColor: getStatusBgColor(selectedRegistration.status),
                                        color: getStatusColor(selectedRegistration.status),
                                    }}
                                >
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                            backgroundColor: getStatusColor(
                                                selectedRegistration.status
                                            ),
                                        }}
                                    />
                                    {selectedRegistration.status}
                                </span>
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="space-y-3 p-3.5 pb-8 sm:p-5">
                            {/* Action Card for Changing Status */}
                            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal size={17} className="text-[#1D4ED8]" />
                                    <h4 className="text-sm font-extrabold text-[#0F172A]">
                                        Tindakan Verifikasi
                                    </h4>
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {STATUS_OPTIONS.map((opt) => {
                                        const isCurrent = selectedRegistration.status === opt.label;
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.label}
                                                type="button"
                                                disabled={
                                                    savingNumber ===
                                                    selectedRegistration.registration_number
                                                }
                                                onClick={() =>
                                                    void updateStatus(
                                                        selectedRegistration.registration_number,
                                                        opt.label,
                                                        selectedRegistration.name
                                                    )
                                                }
                                                className="flex items-center gap-2.5 rounded-[12px] p-2.5 text-left transition-all disabled:opacity-50"
                                                style={{
                                                    backgroundColor: isCurrent ? opt.bg : "#F8FAFC",
                                                    border: `1.5px solid ${
                                                        isCurrent ? opt.color : "#E2E8F0"
                                                    }`,
                                                }}
                                            >
                                                <Icon
                                                    size={17}
                                                    style={{ color: opt.color }}
                                                    className="shrink-0"
                                                />
                                                <span
                                                    className="flex-1 text-xs font-bold"
                                                    style={{
                                                        color: isCurrent ? opt.color : "#0F172A",
                                                    }}
                                                >
                                                    {opt.label}
                                                </span>
                                                {isCurrent && (
                                                    <CheckCircle2
                                                        size={15}
                                                        style={{ color: opt.color }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* INLINE EDIT FORM FOR BIODATA & CATATAN PANITIA */}
                            {isEditingProfile ? (
                                <form
                                    onSubmit={saveProfileEdits}
                                    className="rounded-[16px] border-2 border-[#2563EB]/40 bg-white p-3.5 shadow-sm sm:p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Edit3 size={17} className="text-[#1D4ED8]" />
                                            <h4 className="text-sm font-extrabold text-[#0F172A]">
                                                Edit Biodata & Catatan Verifikasi
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingProfile(false)}
                                            className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                    <hr className="my-3 border-[#E2E8F0]" />
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label className="block text-xs font-bold sm:col-span-2">
                                            Nama Lengkap Siswa
                                            <input
                                                required
                                                value={editForm.name}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A]"
                                            />
                                        </label>
                                        <label className="block text-xs font-bold">
                                            NISN (10 Digit)
                                            <input
                                                required
                                                value={editForm.nisn}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        nisn: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A]"
                                            />
                                        </label>
                                        <label className="block text-xs font-bold">
                                            Tanggal Lahir
                                            <input
                                                type="date"
                                                value={editForm.birth_date}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        birth_date: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A]"
                                            />
                                        </label>
                                        <label className="block text-xs font-bold">
                                            Pilihan Jurusan
                                            <select
                                                value={editForm.major}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        major: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A]"
                                            >
                                                <option value="RPL - Teknik Komputer">
                                                    💻 RPL - Teknik Komputer
                                                </option>
                                                <option value="TBSM - Teknik Otomotif">
                                                    🏍️ TBSM - Teknik Otomotif
                                                </option>
                                            </select>
                                        </label>
                                        <label className="block text-xs font-bold">
                                            No. HP Siswa
                                            <input
                                                value={editForm.phone}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        phone: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A]"
                                            />
                                        </label>
                                        <label className="block text-xs font-bold">
                                            Nama Orang Tua / Wali
                                            <input
                                                value={editForm.parent_name}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        parent_name: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A]"
                                            />
                                        </label>
                                        <label className="block text-xs font-bold">
                                            No. HP Orang Tua / Wali
                                            <input
                                                value={editForm.parent_phone}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        parent_phone: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A]"
                                            />
                                        </label>
                                        <label className="block text-xs font-bold sm:col-span-2">
                                            Catatan Internal Panitia (Alasan Revisi / Keterangan Verifikasi)
                                            <textarea
                                                rows={3}
                                                placeholder="Contoh: Foto KK kurang jelas, mohon kirim ulang via WA panitia..."
                                                value={editForm.admin_notes}
                                                onChange={(e) =>
                                                    setEditForm((prev) => ({
                                                        ...prev,
                                                        admin_notes: e.target.value,
                                                    }))
                                                }
                                                className="mt-1 block w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs font-medium text-[#0F172A]"
                                            />
                                        </label>
                                    </div>
                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingProfile(false)}
                                            className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#64748B]"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white hover:bg-[#2563EB] disabled:opacity-50"
                                            style={{ color: "#ffffff" }}
                                        >
                                            <Save size={14} />
                                            <span>
                                                {savingProfile
                                                    ? "Menyimpan..."
                                                    : "Simpan Perubahan"}
                                            </span>
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {/* Catatan Verifikasi Panitia Card */}
                                    <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <StickyNote
                                                    size={17}
                                                    className="text-[#D97706]"
                                                />
                                                <h4 className="text-sm font-extrabold text-[#0F172A]">
                                                    Catatan Verifikasi Panitia
                                                </h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingProfile(true)}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-[#1D4ED8] hover:underline"
                                            >
                                                <Edit3 size={12} />
                                                <span>
                                                    {selectedRegistration.admin_notes
                                                        ? "Ubah Catatan"
                                                        : "Tambah Catatan"}
                                                </span>
                                            </button>
                                        </div>
                                        <p className="mt-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs leading-relaxed text-[#64748B]">
                                            {selectedRegistration.admin_notes ||
                                                "Belum ada catatan khusus dari panitia untuk pendaftar ini."}
                                        </p>
                                    </div>

                                    {/* Section 1: Data Calon Siswa */}
                                    <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User size={17} className="text-[#1D4ED8]" />
                                                <h4 className="text-sm font-extrabold text-[#0F172A]">
                                                    Data Calon Siswa
                                                </h4>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingProfile(true)}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-[#1D4ED8] hover:underline"
                                            >
                                                <Edit3 size={12} />
                                                <span>Edit Biodata</span>
                                            </button>
                                        </div>
                                        <hr className="my-3 border-[#E2E8F0]" />
                                        <dl className="space-y-2.5 text-xs sm:text-[13px]">
                                            {[
                                                ["Nama Lengkap", selectedRegistration.name],
                                                ["NISN", selectedRegistration.nisn],
                                                [
                                                    "Tanggal Lahir",
                                                    selectedRegistration.birth_date || "-",
                                                ],
                                                ["Pilihan Jurusan", selectedRegistration.major],
                                            ].map(([label, val]) => (
                                                <div
                                                    key={label}
                                                    className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-3"
                                                >
                                                    <dt className="shrink-0 font-semibold text-[#64748B] sm:w-36">
                                                        {label}
                                                    </dt>
                                                    <dd className="break-words font-bold text-[#0F172A]">
                                                        {val}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>

                                    {/* Section 2: Kontak & Orang Tua */}
                                    <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Phone size={17} className="text-[#1D4ED8]" />
                                                <h4 className="text-sm font-extrabold text-[#0F172A]">
                                                    Kontak & Orang Tua
                                                </h4>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {selectedRegistration.phone && (
                                                    <a
                                                        href={`https://wa.me/${formatWaNumber(selectedRegistration.phone)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-lg bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-bold text-[#15803D]"
                                                    >
                                                        <MessageCircle size={12} />
                                                        <span>WA Siswa</span>
                                                    </a>
                                                )}
                                                {selectedRegistration.parent_phone && (
                                                    <a
                                                        href={`https://wa.me/${formatWaNumber(selectedRegistration.parent_phone)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#1D4ED8]"
                                                    >
                                                        <MessageCircle size={12} />
                                                        <span>WA Wali</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <hr className="my-3 border-[#E2E8F0]" />
                                        <dl className="space-y-2.5 text-xs sm:text-[13px]">
                                            {[
                                                [
                                                    "No. Handphone Siswa",
                                                    selectedRegistration.phone,
                                                ],
                                                [
                                                    "Nama Orang Tua / Wali",
                                                    selectedRegistration.parent_name,
                                                ],
                                                [
                                                    "No. Handphone Orang Tua",
                                                    selectedRegistration.parent_phone,
                                                ],
                                            ].map(([label, val]) => (
                                                <div
                                                    key={label}
                                                    className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-3"
                                                >
                                                    <dt className="shrink-0 font-semibold text-[#64748B] sm:w-36">
                                                        {label}
                                                    </dt>
                                                    <dd className="break-words font-bold text-[#0F172A]">
                                                        {val || "-"}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </>
                            )}

                            {/* Section 3: Lampiran Berkas Dokumen (with Interactive Lightbox Zoom) */}
                            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                    <div className="flex items-center gap-2">
                                        <FileCheck2 size={17} className="text-[#1D4ED8]" />
                                        <h4 className="text-sm font-extrabold text-[#0F172A]">
                                            Dokumen Pendaftaran
                                        </h4>
                                    </div>
                                    <span className="text-[11px] font-semibold text-[#64748B]">
                                        Ketuk gambar untuk Zoom & Putar
                                    </span>
                                </div>
                                <hr className="my-3 border-[#E2E8F0]" />
                                {loadingDetails ? (
                                    <p className="py-6 text-center text-xs font-semibold text-[#64748B]">
                                        Memuat lampiran dokumen...
                                    </p>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.name}
                                                className="flex flex-col overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]"
                                            >
                                                <div className="border-b border-[#E2E8F0] bg-white px-3 py-2 text-xs font-extrabold text-[#0F172A]">
                                                    {doc.name}
                                                </div>
                                                {doc.url ? (
                                                    doc.url.includes(".pdf") ? (
                                                        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                                                            <p className="mb-2 text-[11px] font-bold text-[#64748B]">
                                                                Dokumen PDF
                                                            </p>
                                                            <a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-lg bg-[#1D4ED8] px-3 py-1.5 text-[11px] font-bold text-white"
                                                                style={{ color: "#ffffff" }}
                                                            >
                                                                <span>Buka PDF</span>
                                                                <ExternalLink size={11} />
                                                            </a>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-1 flex-col p-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setLightboxDoc({
                                                                        name: doc.name,
                                                                        url: doc.url!,
                                                                    });
                                                                    setLightboxZoom(1);
                                                                    setLightboxRotate(0);
                                                                }}
                                                                className="group/img relative flex h-36 items-center justify-center overflow-hidden rounded-lg bg-white"
                                                                title="Perbesar & Periksa Dokumen"
                                                            >
                                                                <img
                                                                    src={doc.url}
                                                                    alt={doc.name}
                                                                    className="max-h-full max-w-full object-contain transition-transform group-hover/img:scale-105"
                                                                />
                                                                <span className="absolute inset-0 flex items-center justify-center bg-[#0F172A]/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-[#0F172A] px-2.5 py-1 text-[10px] font-bold text-white">
                                                                        <ZoomIn size={12} />
                                                                        <span>Perbesar</span>
                                                                    </span>
                                                                </span>
                                                            </button>
                                                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setLightboxDoc({
                                                                            name: doc.name,
                                                                            url: doc.url!,
                                                                        });
                                                                        setLightboxZoom(1);
                                                                        setLightboxRotate(0);
                                                                    }}
                                                                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1D4ED8] px-2 py-1.5 text-[11px] font-bold text-white"
                                                                    style={{ color: "#ffffff" }}
                                                                >
                                                                    <ZoomIn size={11} />
                                                                    <span>Zoom</span>
                                                                </button>
                                                                <a
                                                                    href={doc.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-[11px] font-bold text-[#0F172A]"
                                                                >
                                                                    <span>Tab Baru</span>
                                                                    <ExternalLink size={11} />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="flex min-h-28 flex-1 items-center justify-center p-4 text-center text-[11px] font-bold text-[#64748B]">
                                                        Belum Diunggah
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section 4: Informasi Pendaftaran */}
                            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-3.5 sm:p-4">
                                <div className="flex items-center gap-2">
                                    <Info size={17} className="text-[#1D4ED8]" />
                                    <h4 className="text-sm font-extrabold text-[#0F172A]">
                                        Informasi Pendaftaran
                                    </h4>
                                </div>
                                <hr className="my-3 border-[#E2E8F0]" />
                                <dl className="space-y-2 text-xs sm:text-[13px]">
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-3">
                                        <dt className="shrink-0 font-semibold text-[#64748B] sm:w-36">
                                            Nomor Registrasi
                                        </dt>
                                        <dd className="font-bold text-[#0F172A]">
                                            {selectedRegistration.registration_number}
                                        </dd>
                                    </div>
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-3">
                                        <dt className="shrink-0 font-semibold text-[#64748B] sm:w-36">
                                            Waktu Pendaftaran
                                        </dt>
                                        <dd className="font-bold text-[#0F172A]">
                                            {formatFlutterDate(selectedRegistration.created_at)}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Danger Action: Hapus Pendaftar (Flutter _confirmDeleteStudent) */}
                            {!confirmDelete ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(true)}
                                    className="flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#FCA5A5] bg-[#FEF2F2] text-sm font-bold text-[#DC2626] transition-colors hover:bg-red-100"
                                >
                                    <Trash2 size={18} />
                                    <span>Hapus Data Pendaftar Ini</span>
                                </button>
                            ) : (
                                <div className="rounded-[16px] border border-[#FCA5A5] bg-[#FEF2F2] p-4">
                                    <div className="flex items-center gap-2 text-[#DC2626]">
                                        <Trash2 size={20} />
                                        <h4 className="text-sm font-extrabold">
                                            Konfirmasi Hapus Permanen
                                        </h4>
                                    </div>
                                    <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
                                        Apakah Anda yakin ingin menghapus data{" "}
                                        <strong className="text-[#0F172A]">
                                            {selectedRegistration.name} (
                                            {selectedRegistration.registration_number})
                                        </strong>{" "}
                                        secara permanen dari sistem PPDB?
                                    </p>
                                    <div className="mt-3 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDelete(false)}
                                            disabled={Boolean(deletingNumber)}
                                            className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-bold text-[#64748B]"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            disabled={Boolean(deletingNumber)}
                                            onClick={() =>
                                                void deleteRegistration(
                                                    selectedRegistration.registration_number,
                                                    selectedRegistration.name
                                                )
                                            }
                                            className="rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                                            style={{ color: "#ffffff" }}
                                        >
                                            {deletingNumber ? "Menghapus..." : "Ya, Hapus Data"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 2: QUICK STATUS PICKER (Flutter _showQuickStatusModal)
               ===================================================================== */}
            {quickStatusTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/60 p-3 backdrop-blur-xs sm:items-center"
                    onClick={() => setQuickStatusTarget(null)}
                >
                    <div
                        className="w-full max-w-md rounded-[24px] bg-white p-5 text-[#0F172A] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E2E8F0]" />
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#EFF6FF] text-[#1D4ED8]">
                                    <Edit3 size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0F172A]">
                                        Ubah Status Cepat
                                    </h3>
                                    <p className="text-xs font-semibold text-[#64748B]">
                                        {quickStatusTarget.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuickStatusTarget(null)}
                                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-2">
                            {STATUS_OPTIONS.map((item) => {
                                const isSelected = quickStatusTarget.status === item.label;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        disabled={
                                            savingNumber === quickStatusTarget.registration_number
                                        }
                                        onClick={() =>
                                            void updateStatus(
                                                quickStatusTarget.registration_number,
                                                item.label,
                                                quickStatusTarget.name
                                            )
                                        }
                                        className="flex w-full items-center gap-3 rounded-[12px] px-3.5 py-3 text-left transition-all disabled:opacity-50"
                                        style={{
                                            backgroundColor: isSelected ? item.bg : "#FFFFFF",
                                            border: `${isSelected ? "1.5px" : "1px"} solid ${
                                                isSelected ? item.color : "#E2E8F0"
                                            }`,
                                        }}
                                    >
                                        <Icon size={19} style={{ color: item.color }} />
                                        <div className="flex-1">
                                            <div
                                                className="text-[13px] font-bold"
                                                style={{
                                                    color: isSelected ? item.color : "#0F172A",
                                                }}
                                            >
                                                {item.label}
                                            </div>
                                            <div className="text-[11px] text-[#64748B]">
                                                {item.desc}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 size={18} style={{ color: item.color }} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 3: QUICK CONTACT MODAL (Flutter _showQuickContactModal)
               ===================================================================== */}
            {quickContactTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/60 p-3 backdrop-blur-xs sm:items-center"
                    onClick={() => setQuickContactTarget(null)}
                >
                    <div
                        className="w-full max-w-md rounded-[24px] bg-white p-5 text-[#0F172A] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E2E8F0]" />
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-extrabold text-[#0F172A]">
                                    Hubungi Siswa / Wali
                                </h3>
                                <p className="text-xs font-semibold text-[#64748B]">
                                    {quickContactTarget.name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuickContactTarget(null)}
                                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-2.5">
                            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                                <p className="text-[11px] font-bold uppercase text-[#64748B]">
                                    Kontak Calon Siswa
                                </p>
                                <p className="mt-0.5 text-sm font-extrabold text-[#0F172A]">
                                    {quickContactTarget.phone || "-"}
                                </p>
                                {quickContactTarget.phone && (
                                    <div className="mt-2.5 flex gap-2">
                                        <a
                                            href={`https://wa.me/${formatWaNumber(quickContactTarget.phone)}?text=${encodeURIComponent(`Halo ${quickContactTarget.name}, kami dari Panitia PPDB SMK Bani Masum terkait pendaftaran nomor ${quickContactTarget.registration_number}.`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#16A34A] py-2 text-xs font-bold text-white"
                                            style={{ color: "#ffffff" }}
                                        >
                                            <MessageCircle size={14} />
                                            <span>Chat WhatsApp</span>
                                        </a>
                                        <a
                                            href={`tel:${quickContactTarget.phone}`}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#0F172A]"
                                        >
                                            <Phone size={14} />
                                            <span>Telepon</span>
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                                <p className="text-[11px] font-bold uppercase text-[#64748B]">
                                    Orang Tua / Wali: {quickContactTarget.parent_name || "-"}
                                </p>
                                <p className="mt-0.5 text-sm font-extrabold text-[#0F172A]">
                                    {quickContactTarget.parent_phone || "-"}
                                </p>
                                {quickContactTarget.parent_phone && (
                                    <div className="mt-2.5 flex gap-2">
                                        <a
                                            href={`https://wa.me/${formatWaNumber(quickContactTarget.parent_phone)}?text=${encodeURIComponent(`Yth. Bapak/Ibu ${quickContactTarget.parent_name}, kami dari Panitia PPDB SMK Bani Masum menginformasikan terkait pendaftaran putra/putri Anda (${quickContactTarget.name}).`)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1D4ED8] py-2 text-xs font-bold text-white"
                                            style={{ color: "#ffffff" }}
                                        >
                                            <MessageCircle size={14} />
                                            <span>WA Orang Tua</span>
                                        </a>
                                        <a
                                            href={`tel:${quickContactTarget.parent_phone}`}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#0F172A]"
                                        >
                                            <Phone size={14} />
                                            <span>Telepon</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 4: SORT OPTIONS (Flutter _showSortModal)
               ===================================================================== */}
            {showSortModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/60 p-3 backdrop-blur-xs sm:items-center"
                    onClick={() => setShowSortModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-[24px] bg-white p-5 text-[#0F172A] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E2E8F0]" />
                        <h3 className="text-lg font-extrabold text-[#0F172A]">
                            Urutkan Daftar Pendaftar
                        </h3>
                        <div className="mt-3.5 space-y-2">
                            {(
                                [
                                    [
                                        "newest",
                                        "Pendaftaran Terbaru (Default)",
                                        "Berdasarkan waktu pendaftaran terbaru",
                                    ],
                                    [
                                        "oldest",
                                        "Pendaftaran Terlama",
                                        "Berdasarkan pendaftar yang masuk lebih awal",
                                    ],
                                    [
                                        "name_asc",
                                        "Nama Siswa (A - Z)",
                                        "Urutkan sesuai alfabet nama siswa",
                                    ],
                                    [
                                        "name_desc",
                                        "Nama Siswa (Z - A)",
                                        "Urutan terbalik dari Z ke A",
                                    ],
                                ] as const
                            ).map(([val, title, subtitle]) => {
                                const isSelected = sortBy === val;
                                return (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => {
                                            setSortBy(val);
                                            setShowSortModal(false);
                                        }}
                                        className={`flex w-full items-center justify-between rounded-[12px] border px-3.5 py-2.5 text-left ${
                                            isSelected
                                                ? "border-[#2563EB] bg-[#EFF6FF]"
                                                : "border-transparent hover:bg-slate-50"
                                        }`}
                                    >
                                        <div>
                                            <div
                                                className={`text-sm ${
                                                    isSelected
                                                        ? "font-extrabold text-[#1D4ED8]"
                                                        : "font-semibold text-[#0F172A]"
                                                }`}
                                            >
                                                {title}
                                            </div>
                                            <div className="text-[11px] text-[#64748B]">
                                                {subtitle}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 size={18} className="text-[#1D4ED8]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 5: PUSAT SIARAN & TEMPLATE WA (Flutter _showBroadcastTemplatesModal)
               ===================================================================== */}
            {showBroadcastModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/60 p-0 backdrop-blur-xs sm:items-center sm:p-3"
                    onClick={() => setShowBroadcastModal(false)}
                >
                    <div
                        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[24px] bg-white p-5 text-[#0F172A] shadow-2xl sm:rounded-[24px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E2E8F0] sm:hidden" />
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/15 text-[#16A34A]">
                                    <Megaphone size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0F172A]">
                                        Pusat Siaran & Template WA
                                    </h3>
                                    <p className="text-[11px] text-[#64748B]">
                                        Format pengumuman resmi siap broadcast ke grup/wali murid
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowBroadcastModal(false)}
                                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                            {WA_TEMPLATES.map((tpl, idx) => {
                                const isSelected = selectedTplIdx === idx;
                                return (
                                    <button
                                        key={tpl.title}
                                        type="button"
                                        onClick={() => setSelectedTplIdx(idx)}
                                        className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs transition-colors ${
                                            isSelected
                                                ? "border-[#0F172A] bg-[#0F172A] font-bold text-white"
                                                : "border-[#E2E8F0] bg-[#F8FAFC] font-medium text-[#0F172A]"
                                        }`}
                                        style={isSelected ? { color: "#ffffff" } : undefined}
                                    >
                                        {tpl.title}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-3 rounded-[16px] border border-[#22C55E]/30 bg-[#F0FDF4] p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-bold text-[#15803D]">
                                    Pratinjau Pesan WhatsApp
                                </span>
                                <span
                                    className="rounded px-2 py-0.5 text-[10px] font-bold text-white"
                                    style={{
                                        backgroundColor: WA_TEMPLATES[selectedTplIdx].tagColor,
                                    }}
                                >
                                    {WA_TEMPLATES[selectedTplIdx].tag}
                                </span>
                            </div>
                            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#0F172A]">
                                {WA_TEMPLATES[selectedTplIdx].text}
                            </pre>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() =>
                                    copyToClipboard(
                                        WA_TEMPLATES[selectedTplIdx].text,
                                        "Format pesan berhasil disalin!"
                                    )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white py-3 text-xs font-bold text-[#0F172A] hover:bg-slate-50"
                            >
                                <Copy size={15} className="text-[#16A34A]" />
                                <span>Salin Format</span>
                            </button>
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(WA_TEMPLATES[selectedTplIdx].text)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] py-3 text-xs font-bold text-white hover:bg-[#15803D]"
                                style={{ color: "#ffffff" }}
                            >
                                <Share2 size={15} />
                                <span>Buka WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 6: ANALISIS DETAIL & STATISTIK (Flutter _showAnalyticsModal)
               ===================================================================== */}
            {showAnalyticsModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/60 p-0 backdrop-blur-xs sm:items-center sm:p-3"
                    onClick={() => setShowAnalyticsModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-t-[24px] bg-white p-5 text-[#0F172A] shadow-2xl sm:rounded-[24px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E2E8F0] sm:hidden" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0F172A]">
                                        Analisis Detail PPDB
                                    </h3>
                                    <p className="text-xs text-[#64748B]">
                                        Ringkasan statistik penerimaan siswa baru
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAnalyticsModal(false)}
                                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span>Pencapaian Target Kuota</span>
                                    <span className="text-[#15803D]">
                                        {approvedCount} / {TARGET_QUOTA} ({quotaPercentage}%)
                                    </span>
                                </div>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                                    <div
                                        className="h-full rounded-full bg-[#15803D]"
                                        style={{ width: `${quotaPercentage}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 text-xs">
                                <div className="rounded-2xl border border-[#2563EB]/25 bg-[#EFF6FF] p-3.5">
                                    <div className="font-extrabold text-[#1D4ED8]">💻 Jurusan RPL</div>
                                    <div className="mt-1 text-xl font-black text-[#0F172A]">
                                        {rplTotal} Siswa
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-semibold text-[#15803D]">
                                        {rplApproved} Lulus Verifikasi
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-[#F97316]/25 bg-[#FFF7ED] p-3.5">
                                    <div className="font-extrabold text-[#EA580C]">
                                        🏍️ Jurusan TBSM
                                    </div>
                                    <div className="mt-1 text-xl font-black text-[#0F172A]">
                                        {tbsmTotal} Siswa
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-semibold text-[#15803D]">
                                        {tbsmApproved} Lulus Verifikasi
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#E2E8F0] p-3.5 text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-[#64748B]">
                                        Menunggu Verifikasi
                                    </span>
                                    <span className="font-extrabold text-[#D97706]">
                                        {pendingCount} Pendaftar
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-[#64748B]">
                                        Berkas Bermasalah / Revisi
                                    </span>
                                    <span className="font-extrabold text-[#DC2626]">
                                        {problematicCount} Pendaftar
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-[#64748B]">
                                        Belum Unggah Berkas Lengkap
                                    </span>
                                    <span className="font-extrabold text-[#EA580C]">
                                        {pendingDocsCount} Pendaftar
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 7: JADWAL & GELOMBANG (Flutter _showScheduleAndWavesModal)
               ===================================================================== */}
            {showScheduleModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/60 p-0 backdrop-blur-xs sm:items-center sm:p-3"
                    onClick={() => setShowScheduleModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-t-[24px] bg-white p-5 text-[#0F172A] shadow-2xl sm:rounded-[24px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E2E8F0] sm:hidden" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0F172A]">
                                        Jadwal & Gelombang PPDB
                                    </h3>
                                    <p className="text-xs text-[#64748B]">
                                        Tahun Ajaran 2026/2027
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowScheduleModal(false)}
                                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-2.5 text-xs">
                            {[
                                ["Pendaftaran Online", "2 Feb – 28 Feb", "3 Mar – 30 Apr"],
                                ["Verifikasi Berkas", "1 Mar – 5 Mar", "1 Mei – 5 Mei"],
                                ["Pengumuman Resmi", "10 Mar", "10 Mei"],
                                ["Daftar Ulang Siswa", "11 – 15 Mar", "11 – 15 Mei"],
                            ].map(([stage, g1, g2]) => (
                                <div
                                    key={stage}
                                    className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3"
                                >
                                    <div className="font-extrabold text-[#0F172A]">{stage}</div>
                                    <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-[#64748B]">
                                        <span>Gelombang 1: {g1}</span>
                                        <span className="text-[#1D4ED8]">Gelombang 2: {g2}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 8: TAMBAH PENDAFTAR MANUAL
               ===================================================================== */}
            {addDialogOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/65 p-0 backdrop-blur-xs sm:items-center sm:p-3"
                    onClick={() => setAddDialogOpen(false)}
                >
                    <div
                        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[24px] bg-white text-[#0F172A] shadow-2xl sm:rounded-[24px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between rounded-b-[20px] bg-[#0F172A] px-5 py-4 text-white">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                                    Entri Manual Panitia
                                </span>
                                <h2 className="text-lg font-extrabold text-white">
                                    Tambah Pendaftar Baru
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAddDialogOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={addRegistration} className="space-y-4 p-4 sm:p-5">
                            <div className="grid gap-3.5 sm:grid-cols-2">
                                <label className="block text-xs font-bold sm:col-span-2">
                                    Nama Lengkap Calon Siswa
                                    <input
                                        required
                                        name="name"
                                        maxLength={120}
                                        placeholder="Masukkan nama sesuai ijazah"
                                        className="mt-1.5 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-normal"
                                    />
                                </label>
                                <label className="block text-xs font-bold">
                                    NISN
                                    <input
                                        required
                                        name="nisn"
                                        inputMode="numeric"
                                        placeholder="10 digit NISN"
                                        className="mt-1.5 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-normal"
                                    />
                                </label>
                                <label className="block text-xs font-bold">
                                    Tanggal Lahir
                                    <input
                                        required
                                        name="birth_date"
                                        type="date"
                                        className="mt-1.5 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-normal"
                                    />
                                </label>
                                <label className="block text-xs font-bold">
                                    No. HP Siswa
                                    <input
                                        required
                                        name="phone"
                                        type="tel"
                                        maxLength={30}
                                        placeholder="08xxxxxxxxxx"
                                        className="mt-1.5 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-normal"
                                    />
                                </label>
                                <label className="block text-xs font-bold">
                                    Pilihan Jurusan
                                    <select
                                        required
                                        name="major"
                                        defaultValue=""
                                        className="mt-1.5 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-semibold"
                                    >
                                        <option value="" disabled>
                                            Pilih jurusan
                                        </option>
                                        <option value="RPL - Teknik Komputer">
                                            💻 RPL - Teknik Komputer
                                        </option>
                                        <option value="TBSM - Teknik Otomotif">
                                            🏍️ TBSM - Teknik Otomotif
                                        </option>
                                    </select>
                                </label>
                                <label className="block text-xs font-bold">
                                    Nama Orang Tua / Wali
                                    <input
                                        required
                                        name="parent_name"
                                        maxLength={120}
                                        className="mt-1.5 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-normal"
                                    />
                                </label>
                                <label className="block text-xs font-bold">
                                    No. HP Orang Tua / Wali
                                    <input
                                        required
                                        name="parent_phone"
                                        type="tel"
                                        maxLength={30}
                                        placeholder="08xxxxxxxxxx"
                                        className="mt-1.5 block w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm font-normal"
                                    />
                                </label>
                            </div>

                            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                                <h3 className="text-xs font-extrabold text-[#0F172A]">
                                    Unggah Dokumen (Opsional)
                                </h3>
                                <div className="mt-2.5 grid gap-3 sm:grid-cols-3">
                                    {[
                                        ["kk", "Kartu Keluarga"],
                                        ["ijazah", "Ijazah / SKL"],
                                        ["photo", "Pas Foto"],
                                    ].map(([name, label]) => (
                                        <label key={name} className="block text-[11px] font-bold">
                                            {label}
                                            <input
                                                name={name}
                                                type="file"
                                                accept=".pdf,image/jpeg,image/png"
                                                className="mt-1 block w-full rounded-lg border border-[#E2E8F0] bg-white p-1.5 text-[11px] font-normal"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {addError && (
                                <p
                                    role="alert"
                                    className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs font-bold text-[#DC2626]"
                                >
                                    {addError}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAddDialogOpen(false)}
                                    className="rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-xs font-bold text-[#64748B]"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingNewRegistration}
                                    className="rounded-xl bg-[#1D4ED8] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#2563EB] disabled:opacity-60"
                                    style={{ color: "#ffffff" }}
                                >
                                    {savingNewRegistration ? "Menyimpan..." : "Simpan Pendaftar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 9: KONFIRMASI KELUAR (Flutter _showLogoutDialog)
               ===================================================================== */}
            {showLogoutConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-xs"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-[20px] bg-white p-5 text-[#0F172A] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2.5">
                            <LogOut size={20} className="text-[#0F172A]" />
                            <h3 className="text-lg font-bold text-[#0F172A]">Konfirmasi Keluar</h3>
                        </div>
                        <p className="mt-2 text-sm text-[#64748B]">
                            Apakah Anda yakin ingin keluar dari portal admin PPDB?
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="rounded-xl px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-slate-100"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => void signOut()}
                                className="rounded-[10px] bg-[#DC2626] px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                                style={{ color: "#ffffff" }}
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 10: INTERACTIVE DOCUMENT LIGHTBOX VIEWER (ZOOM & ROTATE)
               ===================================================================== */}
            {lightboxDoc && (
                <div
                    className="fixed inset-0 z-[60] flex flex-col bg-[#0F172A]/95 p-3 backdrop-blur-sm sm:p-5"
                    onClick={() => setLightboxDoc(null)}
                >
                    <div
                        className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/15 bg-[#1E293B] px-3.5 py-2.5 text-white sm:px-4 sm:py-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <FileCheck2 size={18} className="shrink-0 text-[#38BDF8]" />
                            <div className="min-w-0">
                                <h3 className="truncate text-xs font-extrabold text-white sm:text-sm">
                                    {lightboxDoc.name}
                                </h3>
                                <p className="text-[10px] text-[#94A3B8] sm:text-[11px]">
                                    Zoom: {Math.round(lightboxZoom * 100)}% • Rotasi:{" "}
                                    {lightboxRotate}°
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() =>
                                    setLightboxZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                                title="Perkecil"
                            >
                                <ZoomOut size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setLightboxZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                                title="Perbesar"
                            >
                                <ZoomIn size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setLightboxRotate((r) => (r + 90) % 360)}
                                className="inline-flex h-8 items-center gap-1 rounded-xl bg-white/10 px-2.5 text-xs font-bold text-white hover:bg-white/20"
                                title="Putar 90 Derajat"
                            >
                                <RotateCw size={14} />
                                <span className="hidden sm:inline">Putar</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setLightboxZoom(1);
                                    setLightboxRotate(0);
                                }}
                                className="inline-flex h-8 items-center gap-1 rounded-xl bg-white/10 px-2.5 text-xs font-bold text-white hover:bg-white/20"
                                title="Reset Tampilan"
                            >
                                <RotateCcw size={14} />
                                <span className="hidden sm:inline">Reset</span>
                            </button>
                            <a
                                href={lightboxDoc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 items-center gap-1 rounded-xl bg-[#2563EB] px-2.5 text-xs font-bold text-white hover:bg-[#1D4ED8]"
                                style={{ color: "#ffffff" }}
                            >
                                <span>Asli</span>
                                <ExternalLink size={13} />
                            </a>
                            <button
                                type="button"
                                onClick={() => setLightboxDoc(null)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                title="Tutup Pratinjau"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    </div>

                    <div
                        className="mt-3 flex flex-1 items-center justify-center overflow-auto rounded-2xl border border-white/10 bg-[#0B1120] p-3 sm:p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={lightboxDoc.url}
                            alt={lightboxDoc.name}
                            className="max-h-[75dvh] max-w-full object-contain transition-transform duration-200"
                            style={{
                                transform: `scale(${lightboxZoom}) rotate(${lightboxRotate}deg)`,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 11: LAPORAN REKAPITULASI RESMI PPDB (SIAP CETAK / PDF)
               ===================================================================== */}
            {showReportModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/70 p-0 backdrop-blur-xs sm:items-center sm:p-5"
                    onClick={() => setShowReportModal(false)}
                >
                    <div
                        className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-[24px] bg-white p-4 text-[#0F172A] shadow-2xl sm:rounded-[24px] sm:p-7"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E2E8F0] sm:hidden" />
                        {/* Modal Top Action Bar */}
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
                                    <Printer size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0F172A]">
                                        Laporan Rekapitulasi Resmi PPDB
                                    </h3>
                                    <p className="text-xs text-[#64748B]">
                                        Dokumen rekapitulasi panitia siap cetak atau simpan PDF
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        logActivity(
                                            "Cetak Laporan Rekapitulasi",
                                            `${filteredRegistrations.length} siswa ditampilkan`
                                        );
                                        window.print();
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D4ED8] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#2563EB]"
                                    style={{ color: "#ffffff" }}
                                >
                                    <Printer size={15} />
                                    <span>Cetak / PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReportModal(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-100"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Official Letterhead Summary */}
                        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:p-5">
                            <div className="text-center">
                                <p className="text-xs font-extrabold uppercase tracking-widest text-[#1D4ED8]">
                                    PANITIA PENERIMAAN PESERTA DIDIK BARU (PPDB)
                                </p>
                                <h2 className="mt-0.5 text-base font-black text-[#0F172A] sm:text-xl">
                                    SMK BANI MASUM TAHUN AJARAN 2026/2027
                                </h2>
                                <p className="mt-0.5 text-xs text-[#64748B]">
                                    NPSN: 69888774 • Dicetak pada:{" "}
                                    {new Date().toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 text-center">
                                    <div className="text-[11px] font-bold text-[#64748B]">
                                        Total Pendaftar
                                    </div>
                                    <div className="mt-1 text-xl font-black text-[#0F172A]">
                                        {totalCount}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 text-center">
                                    <div className="text-[11px] font-bold text-[#64748B]">
                                        Lulus Verifikasi
                                    </div>
                                    <div className="mt-1 text-xl font-black text-[#15803D]">
                                        {approvedCount} / {TARGET_QUOTA}
                                    </div>
                                </div>
                                <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 text-center">
                                    <div className="text-[11px] font-bold text-[#64748B]">
                                        Jurusan RPL
                                    </div>
                                    <div className="mt-1 text-xl font-black text-[#1D4ED8]">
                                        {rplTotal} ({rplApproved}✓)
                                    </div>
                                </div>
                                <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 text-center">
                                    <div className="text-[11px] font-bold text-[#64748B]">
                                        Jurusan TBSM
                                    </div>
                                    <div className="mt-1 text-xl font-black text-[#EA580C]">
                                        {tbsmTotal} ({tbsmApproved}✓)
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student Table in Report */}
                        <div className="mt-4 overflow-x-auto rounded-xl border border-[#E2E8F0]">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-extrabold uppercase text-[#64748B]">
                                        <th className="px-3 py-2.5">No</th>
                                        <th className="px-3 py-2.5">No. Registrasi</th>
                                        <th className="px-3 py-2.5">Nama Calon Siswa</th>
                                        <th className="px-3 py-2.5">NISN</th>
                                        <th className="px-3 py-2.5">Jurusan</th>
                                        <th className="px-3 py-2.5">No. HP / Wali</th>
                                        <th className="px-3 py-2.5">Status Seleksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E2E8F0]">
                                    {filteredRegistrations.map((reg, index) => (
                                        <tr key={reg.registration_number}>
                                            <td className="px-3 py-2 font-semibold text-[#64748B]">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 font-mono font-bold text-[#0F172A]">
                                                {reg.registration_number}
                                            </td>
                                            <td className="px-3 py-2 font-bold text-[#0F172A]">
                                                {reg.name}
                                            </td>
                                            <td className="px-3 py-2 font-mono text-[#64748B]">
                                                {reg.nisn}
                                            </td>
                                            <td className="px-3 py-2 font-semibold text-[#0F172A]">
                                                {(reg.major || "RPL").split(" - ")[0]}
                                            </td>
                                            <td className="px-3 py-2 text-[#64748B]">
                                                {reg.phone || reg.parent_phone || "-"}
                                            </td>
                                            <td className="px-3 py-2 font-bold text-[#0F172A]">
                                                {reg.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* =====================================================================
                MODAL 12: RIWAYAT AKTIVITAS PANITIA (AUDIT LOG)
               ===================================================================== */}
            {showActivityModal && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/65 p-0 backdrop-blur-xs sm:items-center sm:p-3"
                    onClick={() => setShowActivityModal(false)}
                >
                    <div
                        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-[24px] bg-white p-5 text-[#0F172A] shadow-2xl sm:rounded-[24px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E2E8F0] sm:hidden" />
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3E8FF] text-[#9333EA]">
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-[#0F172A]">
                                        Riwayat Aktivitas Panitia
                                    </h3>
                                    <p className="text-xs text-[#64748B]">
                                        Catatan tindakan verifikasi & perubahan data terbaru
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowActivityModal(false)}
                                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-2">
                            {activityLogs.length === 0 ? (
                                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center">
                                    <p className="text-xs font-bold text-[#64748B]">
                                        Belum ada aktivitas tercatat pada sesi ini.
                                    </p>
                                </div>
                            ) : (
                                activityLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-extrabold text-[#0F172A]">
                                                {log.action}
                                            </span>
                                            <span className="text-[10px] font-semibold text-[#64748B]">
                                                {formatFlutterDate(log.timestamp)}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[11px] font-medium text-[#1D4ED8]">
                                            {log.target}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {activityLogs.length > 0 && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActivityLogs([]);
                                        try {
                                            window.localStorage.removeItem(ACTIVITY_LOG_KEY);
                                        } catch {
                                            // ignore
                                        }
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2 text-xs font-bold text-[#DC2626] hover:bg-red-100"
                                >
                                    <Trash2 size={13} />
                                    <span>Bersihkan Riwayat</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* =====================================================================
                MOBILE BOTTOM NAVIGATION BAR (KHUSUS LAYAR < 640px / sm:hidden)
               ===================================================================== */}
            <nav
                aria-label="Navigasi Cepat Mobile Admin"
                className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0F172A]/95 px-2 pt-1.5 text-white shadow-[0_-8px_24px_rgba(2,6,23,0.35)] backdrop-blur-md sm:hidden"
            >
                <div className="mx-auto grid max-w-md grid-cols-5 items-center gap-1">
                    <Link
                        href="/"
                        className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-[#94A3B8] transition-colors active:bg-white/10 active:text-white"
                    >
                        <Home size={17} />
                        <span>Beranda</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setShowBroadcastModal(true)}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-[#4ADE80] transition-colors active:bg-white/10"
                    >
                        <Megaphone size={17} />
                        <span>Siaran WA</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setAddDialogOpen(true)}
                        className="-mt-4 flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#2563EB] py-2 text-[10px] font-extrabold text-white shadow-lg shadow-blue-600/40 transition-transform active:scale-95"
                        style={{ color: "#ffffff" }}
                    >
                        <Plus size={19} strokeWidth={2.5} />
                        <span>Tambah</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-[#38BDF8] transition-colors active:bg-white/10"
                    >
                        <Printer size={17} />
                        <span>Laporan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => exportCsv(false)}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-bold text-[#94A3B8] transition-colors active:bg-white/10 active:text-white"
                    >
                        <Download size={17} />
                        <span>CSV</span>
                    </button>
                </div>
            </nav>
        </main>
    );
}
