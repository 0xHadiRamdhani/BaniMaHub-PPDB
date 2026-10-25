"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Store,
  Sun,
  Moon,
  LogOut,
  Package,
  UtensilsCrossed,
  Plus,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Download,
  RefreshCw,
  Edit3,
  Trash2,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";

type CategoryId = "makanan" | "minuman" | "alat-tulis" | "seragam" | "atribut";

type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  original_price?: number | null;
  rating: number;
  sold: number;
  stock: number;
  seller: string;
  badge?: string;
  estimate: string;
  description: string;
  variants: string[];
  image_url: string;
  available: boolean;
  created_at?: string;
};

type OrderStatus =
  | "Menunggu Konfirmasi"
  | "Diproses Koperasi"
  | "Siap Diambil / Diantar"
  | "Selesai"
  | "Dibatalkan";

type OrderItemRecord = {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  variant: string;
  image_url: string;
  seller: string;
};

type OrderRecord = {
  invoice: string;
  buyer_name: string;
  buyer_class: string;
  buyer_phone?: string;
  delivery_method: "Ambil di Koperasi" | "Antar ke Kelas";
  payment_method: string;
  notes?: string;
  admin_notes?: string;
  status: OrderStatus;
  subtotal: number;
  service_fee: number;
  total: number;
  items: OrderItemRecord[];
  created_at: string;
};

const ORDER_STATUSES: OrderStatus[] = [
  "Menunggu Konfirmasi",
  "Diproses Koperasi",
  "Siap Diambil / Diantar",
  "Selesai",
  "Dibatalkan",
];

const CATEGORIES: Array<{ id: CategoryId; label: string }> = [
  { id: "makanan", label: "Makanan & Snack" },
  { id: "minuman", label: "Minuman Segar" },
  { id: "alat-tulis", label: "Alat Tulis (ATK)" },
  { id: "seragam", label: "Seragam & Wearpack" },
  { id: "atribut", label: "Atribut Sekolah" },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadgeStyle(status: OrderStatus) {
  switch (status) {
    case "Menunggu Konfirmasi":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300";
    case "Diproses Koperasi":
      return "border-blue-200 bg-blue-50 text-blue-800 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300";
    case "Siap Diambil / Diantar":
      return "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300";
    case "Selesai":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300";
    case "Dibatalkan":
      return "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

export default function AdminEKantinPage() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Order Filters
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Semua");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("Semua");
  const [updatingOrderInvoice, setUpdatingOrderInvoice] = useState("");
  const [selectedOrderModal, setSelectedOrderModal] = useState<OrderRecord | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState("");

  // Product Filters & Form Modal
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Semua");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [seedingCatalog, setSeedingCatalog] = useState(false);

  // Product Form Fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<CategoryId>("makanan");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formStock, setFormStock] = useState("25");
  const [formSeller, setFormSeller] = useState("Kantin Sehat Bani Ma'sum");
  const [formBadge, setFormBadge] = useState("");
  const [formEstimate, setFormEstimate] = useState("Siap 5 Menit");
  const [formVariants, setFormVariants] = useState("Standar");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);

  const THEME_STORAGE_KEY = "ppdb:theme";

  const applyTheme = (isDark: boolean) => {
    const theme = isDark ? "dark" : "light";
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      document.documentElement.classList.toggle("dark", isDark);
    }
  };

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem("ppdb_admin_dark_mode");
      const isDark = savedTheme !== null ? (savedTheme === "dark" || savedTheme === "true") : true;
      setDarkMode(isDark);
      applyTheme(isDark);
    } catch {
      // ignore
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
        localStorage.setItem("ppdb_admin_dark_mode", String(next));
      } catch {
        // ignore
      }
      applyTheme(next);
      return next;
    });
  };

  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((prev) => (prev === msg ? "" : prev));
    }, 3500);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/ekantin/orders", { cache: "no-store" }),
        fetch("/api/ekantin/products", { cache: "no-store" }),
      ]);

      if (ordersRes.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const ordersData = (await ordersRes.json()) as { orders?: OrderRecord[]; error?: string };
      const productsData = (await productsRes.json()) as { products?: Product[]; error?: string };

      if (!ordersRes.ok) throw new Error(ordersData.error || "Gagal memuat pesanan E-Kantin.");
      if (!productsRes.ok) throw new Error(productsData.error || "Gagal memuat produk E-Kantin.");

      setOrders(ordersData.orders ?? []);
      setProducts(productsData.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data Firebase E-Kantin.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadAllData();
  }, [loadAllData]);

  // Summary Metrics
  const stats = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "Dibatalkan");
    const revenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingCount = orders.filter(
      (o) => o.status === "Menunggu Konfirmasi" || o.status === "Diproses Koperasi"
    ).length;
    const readyCount = orders.filter((o) => o.status === "Siap Diambil / Diantar").length;
    const completedCount = orders.filter((o) => o.status === "Selesai").length;
    const lowStockCount = products.filter((p) => p.stock <= 5).length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

    return {
      revenue,
      totalOrders: orders.length,
      pendingCount,
      readyCount,
      completedCount,
      totalProducts: products.length,
      lowStockCount,
      totalStock,
    };
  }, [orders, products]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((ord) => {
      const matchStatus = statusFilter === "Semua" || ord.status === statusFilter;
      const matchDelivery = deliveryFilter === "Semua" || ord.delivery_method === deliveryFilter;
      const matchQuery =
        !q ||
        ord.invoice.toLowerCase().includes(q) ||
        ord.buyer_name.toLowerCase().includes(q) ||
        ord.buyer_class.toLowerCase().includes(q) ||
        ord.items.some((i) => i.name.toLowerCase().includes(q));
      return matchStatus && matchDelivery && matchQuery;
    });
  }, [orders, orderSearch, statusFilter, deliveryFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter((prod) => {
      const matchCat = categoryFilter === "Semua" || prod.category === categoryFilter;
      const matchQuery =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.seller.toLowerCase().includes(q) ||
        prod.id.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, productSearch, categoryFilter]);

  // Order Actions
  const handleUpdateOrderStatus = async (invoice: string, nextStatus: OrderStatus, adminNotes?: string) => {
    setUpdatingOrderInvoice(invoice);
    setError("");
    try {
      const response = await fetch("/api/ekantin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice,
          status: nextStatus,
          ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}),
        }),
      });
      const data = (await response.json()) as { order?: OrderRecord; error?: string };
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok || !data.order) {
        throw new Error(data.error || "Gagal memperbarui status pesanan.");
      }
      setOrders((prev) => prev.map((o) => (o.invoice === invoice ? data.order! : o)));
      if (selectedOrderModal?.invoice === invoice) {
        setSelectedOrderModal(data.order);
      }
      showNotice(`Status pesanan ${invoice} diubah ke "${nextStatus}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status pesanan.");
    } finally {
      setUpdatingOrderInvoice("");
    }
  };

  const handleDeleteOrder = async (invoice: string) => {
    if (!window.confirm(`Hapus permanen data pesanan ${invoice} dari Firebase?`)) return;
    setUpdatingOrderInvoice(invoice);
    try {
      const response = await fetch(`/api/ekantin/orders?invoice=${encodeURIComponent(invoice)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal menghapus pesanan.");
      setOrders((prev) => prev.filter((o) => o.invoice !== invoice));
      if (selectedOrderModal?.invoice === invoice) setSelectedOrderModal(null);
      showNotice(`Pesanan ${invoice} berhasil dihapus dari Firebase.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus pesanan.");
    } finally {
      setUpdatingOrderInvoice("");
    }
  };

  // Product Modal Openers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("makanan");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStock("25");
    setFormSeller("Kantin Sehat Bani Ma'sum");
    setFormBadge("");
    setFormEstimate("Siap 5 Menit");
    setFormVariants("Standar");
    setFormDescription("");
    setFormImageUrl("");
    setFormImageFile(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(String(prod.price));
    setFormOriginalPrice(prod.original_price ? String(prod.original_price) : "");
    setFormStock(String(prod.stock));
    setFormSeller(prod.seller);
    setFormBadge(prod.badge || "");
    setFormEstimate(prod.estimate || "Siap 5 Menit");
    setFormVariants(prod.variants.join(", "));
    setFormDescription(prod.description);
    setFormImageUrl(prod.image_url || "");
    setFormImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || savingProduct) return;

    setSavingProduct(true);
    setError("");
    try {
      const formData = new FormData();
      if (editingProduct) formData.append("id", editingProduct.id);
      formData.append("name", formName.trim());
      formData.append("category", formCategory);
      formData.append("price", formPrice);
      formData.append("original_price", formOriginalPrice);
      formData.append("stock", formStock);
      formData.append("seller", formSeller.trim());
      formData.append("badge", formBadge.trim());
      formData.append("estimate", formEstimate.trim());
      formData.append("variants", formVariants.trim());
      formData.append("description", formDescription.trim());
      formData.append("image_url", formImageUrl.trim());
      if (formImageFile) {
        formData.append("image_file", formImageFile);
      }

      const response = await fetch("/api/ekantin/products", {
        method: editingProduct ? "PATCH" : "POST",
        body: formData,
      });
      const data = (await response.json()) as { product?: Product; error?: string };
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok || !data.product) {
        throw new Error(data.error || "Gagal menyimpan produk ke Firebase.");
      }

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === data.product!.id ? data.product! : p)));
        showNotice(`Produk "${data.product.name}" berhasil diperbarui di Firebase.`);
      } else {
        setProducts((prev) => [data.product!, ...prev]);
        showNotice(`Produk baru "${data.product.name}" berhasil ditambahkan ke Firebase.`);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleQuickStockChange = async (prod: Product, nextStock: number) => {
    const safeStock = Math.max(0, nextStock);
    try {
      const response = await fetch("/api/ekantin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prod.id,
          stock: safeStock,
          available: safeStock > 0,
        }),
      });
      const data = (await response.json()) as { product?: Product; error?: string };
      if (!response.ok || !data.product) throw new Error(data.error);
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? data.product! : p)));
      showNotice(`Stok ${prod.name} diperbarui menjadi ${safeStock}.`);
    } catch {
      setError("Gagal memperbarui stok produk di Firebase.");
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`Hapus permanen produk "${prod.name}" dari Firebase Firestore?`)) return;
    try {
      const response = await fetch(`/api/ekantin/products?id=${encodeURIComponent(prod.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal menghapus produk.");
      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
      showNotice(`Produk "${prod.name}" telah dihapus dari Firebase.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus produk.");
    }
  };

  const handleSeedDefaultCatalog = async () => {
    setSeedingCatalog(true);
    setError("");
    try {
      const response = await fetch("/api/ekantin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_default" }),
      });
      const data = (await response.json()) as { products?: Product[]; message?: string; error?: string };
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Gagal memuat katalog awal.");
      await loadAllData();
      showNotice(data.message || "Katalog standar koperasi berhasil disimpan ke Firebase!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan katalog awal.");
    } finally {
      setSeedingCatalog(false);
    }
  };

  const exportOrdersCsv = () => {
    if (!orders.length) return;
    const headers = [
      "Invoice",
      "Waktu",
      "Nama Pemesan",
      "Kelas",
      "WhatsApp",
      "Metode Ambil",
      "Pembayaran",
      "Status",
      "Total (Rp)",
      "Rincian Item",
    ];
    const rows = orders.map((o) => [
      o.invoice,
      new Date(o.created_at).toLocaleString("id-ID"),
      `"${o.buyer_name.replace(/"/g, '""')}"`,
      `"${o.buyer_class}"`,
      o.buyer_phone || "-",
      o.delivery_method,
      o.payment_method,
      o.status,
      o.total,
      `"${o.items.map((i) => `${i.qty}x ${i.name} (${i.variant})`).join("; ")}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-ekantin-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  };

  return (
    <div
      className={
        darkMode
          ? "dark min-h-screen bg-[#020617] text-slate-100 pb-24 sm:pb-12"
          : "min-h-screen bg-[#F1F5F9] text-[#0F172A] pb-24 sm:pb-12"
      }
    >
      {/* Admin Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 text-slate-900 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-[#0F172A] dark:text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* School & Module Identity */}
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-xs dark:border-sky-400/40 sm:h-10 sm:w-10">
              <Image
                src="/logo.png"
                alt="Logo SMK Bani Masum"
                fill
                sizes="40px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="truncate font-black tracking-tight text-[13px] sm:text-base text-slate-900 leading-tight dark:text-white">
                SMK BANI MASUM
              </div>
              <div className="truncate text-[9.5px] sm:text-[10px] font-semibold tracking-wider text-blue-600 uppercase dark:text-sky-400">
                Admin E-Kantin & Koperasi
              </div>
            </div>
          </div>

          {/* Compact Segmented Control Bar */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Segment 1: Navigasi Modul */}
            <div className="flex items-center gap-1.5">
              <Link
                href="/admin"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:hover:text-white sm:px-3"
                title="Buka Panel Admin PPDB"
                aria-label="Panel Admin PPDB"
              >
                <GraduationCap size={15} className="text-slate-500 dark:text-slate-300" />
                <span className="hidden xs:inline">Admin PPDB</span>
              </Link>
              <Link
                href="/ekantin"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80 dark:hover:text-white sm:px-3"
                title="Buka Halaman Toko E-Kantin Publik"
                aria-label="Toko Publik E-Kantin"
              >
                <Store size={15} className="text-slate-500 dark:text-slate-300" />
                <span className="hidden sm:inline">Toko Publik</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700/80 mx-0.5" aria-hidden="true" />

            {/* Segment 2: Tampilan & Sesi */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/80 dark:hover:text-white"
                title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                aria-label="Ubah Tema Tampilan"
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100 hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-100"
                title="Keluar Akun Admin E-Kantin"
                aria-label="Keluar dari Akun Admin"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Notifications */}
        {notice && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-300/70 dark:hover:text-emerald-200"
              aria-label="Tutup notifikasi"
            >
              <X size={15} />
            </button>
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-rose-600 hover:text-rose-800 dark:text-rose-300/70 dark:hover:text-rose-200"
              aria-label="Tutup pesan error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Omzet
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <TrendingUp size={14} />
              </div>
            </div>
            <p className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {formatRupiah(stats.revenue)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {stats.completedCount} pesanan selesai
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Perlu Diproses
              </span>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  stats.pendingCount > 0
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                <Clock size={14} />
              </div>
            </div>
            <p
              className={`mt-2 text-xl font-black tracking-tight sm:text-2xl ${
                stats.pendingCount > 0
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {stats.pendingCount} Pesanan
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {stats.readyCount} siap diambil atau diantar
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Transaksi
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Package size={14} />
              </div>
            </div>
            <p className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {stats.totalOrders} Invoice
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Total pesanan siswa tercatat
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Katalog Produk
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <UtensilsCrossed size={14} />
              </div>
            </div>
            <p className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {stats.totalProducts} Item
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {stats.totalStock} unit ({stats.lowStockCount} stok menipis)
            </p>
          </div>
        </div>

        {/* Workspace Toolbar: Segmented Tabs & Action Buttons */}
        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          {/* Segmented Tab Switcher */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === "orders"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Package size={14} />
              <span>Pesanan Siswa</span>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {orders.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === "products"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <UtensilsCrossed size={14} />
              <span>Katalog Produk</span>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {products.length}
              </span>
            </button>
          </div>

          {/* Action Buttons for Current Tab */}
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "orders" ? (
              <>
                <button
                  type="button"
                  onClick={exportOrdersCsv}
                  disabled={!orders.length}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  title="Export Data Pesanan ke File CSV"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => void loadAllData()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  title="Muat Ulang Data Pesanan"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  <span>Muat Ulang</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void loadAllData()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  title="Muat Ulang Katalog Produk"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  <span>Muat Ulang</span>
                </button>
                {products.length === 0 && (
                  <button
                    type="button"
                    disabled={seedingCatalog}
                    onClick={() => void handleSeedDefaultCatalog()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
                  >
                    <Layers size={14} />
                    <span>{seedingCatalog ? "Menyimpan..." : "Muat Data Standar"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={openAddProductModal}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-500 active:bg-blue-700"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Tambah Produk</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <section className="mt-6">
            {/* Search & Filters */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="relative sm:col-span-6">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari nomor invoice (EK-...), nama siswa, kelas, atau menu..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="Semua">Semua Status Pesanan</option>
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="Semua">Semua Metode Ambil</option>
                  <option value="Ambil di Koperasi">Ambil di Koperasi</option>
                  <option value="Antar ke Kelas">Antar ke Kelas</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-32 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                  />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-base font-bold text-slate-900 dark:text-white">Belum Ada Data Pesanan</p>
                <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
                  Setiap pesanan yang dibuat oleh siswa atau guru di katalog toko publik akan otomatis ditampilkan di sini.
                </p>
                <div className="mt-4">
                  <Link
                    href="/ekantin"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Store size={14} />
                    <span>Lihat Toko Publik</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredOrders.map((ord) => {
                  const isBusy = updatingOrderInvoice === ord.invoice;
                  return (
                    <div
                      key={ord.invoice}
                      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-900 dark:bg-slate-800 dark:text-slate-200">
                            {ord.invoice}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadgeStyle(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {ord.delivery_method}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(ord.created_at).toLocaleString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{ord.payment_method} •</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {formatRupiah(ord.total)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 grid gap-4 lg:grid-cols-12 lg:items-center">
                        <div className="lg:col-span-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{ord.buyer_name}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Kelas / Ruangan: <span className="text-slate-700 dark:text-slate-200">{ord.buyer_class}</span>
                          </p>
                          {ord.notes && (
                            <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
                              Catatan Siswa: &ldquo;{ord.notes}&rdquo;
                            </p>
                          )}
                          {ord.admin_notes && (
                            <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              Catatan Petugas: {ord.admin_notes}
                            </p>
                          )}
                        </div>

                        <div className="lg:col-span-4">
                          <div className="flex flex-wrap gap-1.5">
                            {ord.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {item.qty}x {item.name}{" "}
                                <span className="text-slate-400">({item.variant})</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Order Workflow Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-2 lg:col-span-4">
                          {ord.status === "Menunggu Konfirmasi" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleUpdateOrderStatus(ord.invoice, "Diproses Koperasi")}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                            >
                              Proses Pesanan
                            </button>
                          )}
                          {ord.status === "Diproses Koperasi" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                void handleUpdateOrderStatus(ord.invoice, "Siap Diambil / Diantar")
                              }
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                            >
                              Siap Diambil
                            </button>
                          )}
                          {ord.status !== "Selesai" && ord.status !== "Dibatalkan" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleUpdateOrderStatus(ord.invoice, "Selesai")}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                              Selesaikan
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderModal(ord);
                              setAdminNotesInput(ord.admin_notes || "");
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleDeleteOrder(ord.invoice)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                            title="Hapus Pesanan"
                            aria-label={`Hapus invoice ${ord.invoice}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: PRODUCTS CATALOG MANAGEMENT */}
        {activeTab === "products" && (
          <section className="mt-6">
            {/* Search & Category Filter Toolbar */}
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <div className="relative w-full max-w-md">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari nama produk, kategori, atau unit..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="Semua">Semua Kategori</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Menampilkan <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span> dari {products.length} produk
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-80 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  Katalog Produk Masih Kosong
                </p>
                <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
                  Tambahkan produk baru ke dalam katalog atau impor 8 data contoh standar Koperasi SMK Bani Masum.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    disabled={seedingCatalog}
                    onClick={() => void handleSeedDefaultCatalog()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
                  >
                    <Layers size={14} />
                    <span>{seedingCatalog ? "Menyimpan..." : "Muat 8 Produk Standar"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openAddProductModal}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Tambah Produk Manual</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  >
                    {/* Product Image & Badges */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          Tanpa Foto
                        </div>
                      )}
                      {/* Category Badge */}
                      <span className="absolute left-2.5 top-2.5 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
                        {prod.category}
                      </span>
                      {/* Stock Badge */}
                      <span
                        className={`absolute right-2.5 top-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs ${
                          prod.stock === 0
                            ? "bg-rose-600/90 text-white"
                            : prod.stock <= 5
                            ? "bg-amber-600/90 text-white"
                            : "bg-slate-900/80 text-emerald-400"
                        }`}
                      >
                        {prod.stock === 0 ? "Habis" : `Stok: ${prod.stock}`}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col p-4">
                      <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {prod.seller}
                      </p>
                      <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-900 dark:text-white">
                        {prod.name}
                      </h3>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {formatRupiah(prod.price)}
                        </span>
                        {prod.original_price && prod.original_price > prod.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatRupiah(prod.original_price)}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                        Terjual {prod.sold} • {prod.variants.length} varian
                      </p>

                      {/* Quick Stock Controls */}
                      <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Ubah Stok
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void handleQuickStockChange(prod, prod.stock - 1)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            title="Kurang 1 stok"
                            aria-label="Kurang 1 stok"
                          >
                            -1
                          </button>
                          <span className="min-w-6 text-center font-bold text-slate-900 dark:text-white">
                            {prod.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleQuickStockChange(prod, prod.stock + 5)}
                            className="inline-flex h-6 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            title="Tambah 5 stok"
                            aria-label="Tambah 5 stok"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-3 flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(prod)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteProduct(prod)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                          title="Hapus Produk"
                          aria-label={`Hapus produk ${prod.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Order Detail & Status Edit Modal */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1E293B] sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-[#38BDF8]">
                  Kelola Pesanan Siswa
                </span>
                <h3 className="text-xl font-extrabold">{selectedOrderModal.invoice}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 dark:hover:text-white"
                aria-label="Tutup detail pesanan"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl bg-slate-100 p-4 dark:bg-[#0F172A]">
                <p className="font-bold text-sm">{selectedOrderModal.buyer_name}</p>
                <p className="text-blue-600 dark:text-[#38BDF8]">
                  Kelas: {selectedOrderModal.buyer_class} • {selectedOrderModal.delivery_method}
                </p>
                {selectedOrderModal.buyer_phone && (
                  <p className="mt-1">WhatsApp: {selectedOrderModal.buyer_phone}</p>
                )}
                {selectedOrderModal.notes && (
                  <p className="mt-1 italic text-slate-400">
                    Catatan Siswa: {selectedOrderModal.notes}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {selectedOrderModal.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-white/10"
                  >
                    <span>
                      <strong>
                        {item.qty}x {item.name}
                      </strong>{" "}
                      ({item.variant})
                    </span>
                    <span className="font-bold">{formatRupiah(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider">
                  Catatan Petugas Koperasi (Tampil di Bukti Siswa)
                </label>
                <input
                  type="text"
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="Contoh: Pesanan sudah siap di loket 1 koperasi"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 text-xs outline-none focus:border-[#2563EB] dark:border-white/15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider">
                  Ubah Status Pesanan
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ORDER_STATUSES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() =>
                        void handleUpdateOrderStatus(
                          selectedOrderModal.invoice,
                          st,
                          adminNotesInput
                        )
                      }
                      className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                        selectedOrderModal.status === st
                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                          : "border-slate-200 hover:border-[#38BDF8] dark:border-white/15"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={handleSaveProduct}
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1E293B] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-[#38BDF8]">
                  Firebase Firestore Katalog
                </span>
                <h3 className="text-xl font-extrabold">
                  {editingProduct ? `Edit Produk: ${editingProduct.name}` : "Tambah Produk E-Kantin Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 dark:hover:text-white"
                aria-label="Tutup form produk"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Paket Nasi Ayam Geprek Koperasi"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as CategoryId)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-bold outline-none dark:border-white/15 dark:bg-[#0F172A]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="15000"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider">Stok Tersedia *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider">
                    Harga Coret (Opsional)
                  </label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="18000"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider">Unit Penjual</label>
                  <input
                    type="text"
                    value={formSeller}
                    onChange={(e) => setFormSeller(e.target.value)}
                    placeholder="Kantin Sehat / Koperasi"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider">Estimasi / Label</label>
                  <input
                    type="text"
                    value={formEstimate}
                    onChange={(e) => setFormEstimate(e.target.value)}
                    placeholder="Siap 5 Menit"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider">
                    Pilihan Varian (Pisahkan Koma)
                  </label>
                  <input
                    type="text"
                    value={formVariants}
                    onChange={(e) => setFormVariants(e.target.value)}
                    placeholder="Level 1, Level 3, Tanpa Sambal"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider">
                    Badge Promo (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Best Seller / Wajib Praktik"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider">Deskripsi Produk</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan detail menu atau spesifikasi perlengkapan sekolah..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 outline-none focus:border-[#2563EB] dark:border-white/15"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider">
                    Upload Foto Produk (ImgBB / Storage)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setFormImageFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider">
                    Atau Gunakan URL Gambar
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2.5 outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingProduct}
                className="flex-1 rounded-xl bg-[#2563EB] py-3 text-xs font-extrabold text-white shadow-lg shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {savingProduct
                  ? "Menyimpan ke Firebase..."
                  : editingProduct
                  ? "Simpan Perubahan Produk"
                  : "Simpan Produk ke Firebase"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi Cepat Mobile E-Kantin"
        className="pb-safe fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-1.5 text-slate-700 shadow-[0_-8px_24px_rgba(2,6,23,0.06)] backdrop-blur-md dark:border-slate-800 dark:bg-[#0F172A]/95 dark:text-white dark:shadow-[0_-8px_24px_rgba(2,6,23,0.35)] sm:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors ${
              activeTab === "orders"
                ? "bg-blue-50 text-blue-700 font-bold dark:bg-slate-800 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-800 active:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:active:bg-slate-800 dark:active:text-white"
            }`}
            title="Daftar Pesanan"
          >
            <Package size={17} />
            <span>Pesanan ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors ${
              activeTab === "products"
                ? "bg-blue-50 text-blue-700 font-bold dark:bg-slate-800 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-800 active:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:active:bg-slate-800 dark:active:text-white"
            }`}
            title="Katalog Produk"
          >
            <UtensilsCrossed size={17} />
            <span>Produk ({products.length})</span>
          </button>
          <button
            type="button"
            onClick={openAddProductModal}
            className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-bold text-blue-600 transition-colors hover:text-blue-700 active:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:active:bg-slate-800"
            title="Tambah Produk Baru"
          >
            <Plus size={17} strokeWidth={2.5} />
            <span>Tambah</span>
          </button>
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-medium text-slate-500 transition-colors hover:text-slate-800 active:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:active:bg-slate-800 dark:active:text-white"
            title="Ke Panel Admin PPDB"
          >
            <GraduationCap size={17} />
            <span>Admin PPDB</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
