"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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
      return "border-amber-500/30 bg-amber-500/15 text-amber-400";
    case "Diproses Koperasi":
      return "border-sky-500/30 bg-sky-500/15 text-sky-400";
    case "Siap Diambil / Diantar":
      return "border-indigo-500/30 bg-indigo-500/15 text-indigo-300";
    case "Selesai":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-400";
    case "Dibatalkan":
      return "border-rose-500/30 bg-rose-500/15 text-rose-400";
    default:
      return "border-slate-500/30 bg-slate-500/15 text-slate-300";
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

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("ppdb_admin_dark_mode");
      if (savedTheme !== null) setDarkMode(savedTheme === "true");
    } catch {
      // ignore
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ppdb_admin_dark_mode", String(next));
      } catch {
        // ignore
      }
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
      {/* Top AppBar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0F172A]/95 text-white shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white p-1.5 shadow-inner">
              <Image
                src="/logo.png"
                alt="SMK Bani Ma'sum"
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#2563EB] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  Admin E-Kantin
                </span>
                <span className="hidden items-center gap-1.5 text-xs font-medium text-emerald-400 sm:inline-flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Firebase Firestore Connected
                </span>
              </div>
              <h1 className="text-base font-extrabold tracking-tight sm:text-lg">
                Manajemen Koperasi & E-Kantin SMK Bani Ma&apos;sum
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/15"
            >
              <span>← Admin PPDB</span>
            </Link>
            <Link
              href="/ekantin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 px-3.5 py-2 text-xs font-bold text-[#38BDF8] transition hover:bg-[#38BDF8]/20"
            >
              <span>Lihat Toko E-Kantin ↗</span>
            </Link>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15"
              title="Ubah Tema"
            >
              {darkMode ? "☀ Light" : "🌙 Dark"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-rose-500/30 bg-rose-500/15 px-3.5 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/25"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Notifications */}
        {notice && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-xs font-bold text-emerald-300">
            <span>✓ {notice}</span>
            <button type="button" onClick={() => setNotice("")} className="text-emerald-200">
              ✕
            </button>
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/15 px-4 py-3 text-xs font-bold text-rose-300">
            <span>⚠ {error}</span>
            <button type="button" onClick={() => setError("")} className="text-rose-200">
              ✕
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0F172A]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Omzet Koperasi
            </p>
            <p className="mt-1.5 text-xl font-extrabold text-[#2563EB] dark:text-[#38BDF8] sm:text-2xl">
              {formatRupiah(stats.revenue)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {stats.completedCount} pesanan selesai
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0F172A]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pesanan Perlu Diproses
            </p>
            <p className="mt-1.5 text-xl font-extrabold text-amber-500 sm:text-2xl">
              {stats.pendingCount} Pesanan
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {stats.readyCount} siap diambil / diantar
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0F172A]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Pesanan Masuk
            </p>
            <p className="mt-1.5 text-xl font-extrabold text-[#0F172A] dark:text-white sm:text-2xl">
              {stats.totalOrders} Invoice
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Tersimpan di Firebase
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0F172A]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Katalog Produk Aktif
            </p>
            <p className="mt-1.5 text-xl font-extrabold text-emerald-500 sm:text-2xl">
              {stats.totalProducts} Produk
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Total {stats.totalStock} stok ({stats.lowStockCount} stok tipis)
            </p>
          </div>
        </div>

        {/* Workspace Navigation Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#0F172A]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === "orders"
                  ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              }`}
            >
              📦 Pesanan Siswa ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === "products"
                  ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              }`}
            >
              🍱 Katalog Produk Firebase ({products.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAddProductModal}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-500"
            >
              + Tambah Produk Baru
            </button>
            <button
              type="button"
              onClick={exportOrdersCsv}
              disabled={!orders.length}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-[#2563EB] disabled:opacity-40 dark:border-white/15 dark:text-slate-200"
            >
              ⬇ Export CSV
            </button>
            <button
              type="button"
              onClick={() => void loadAllData()}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-[#2563EB] dark:border-white/15 dark:text-slate-200"
            >
              ↻ Segarkan Firebase
            </button>
          </div>
        </div>

        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <section className="mt-6">
            {/* Search & Filters */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari nomor invoice (EK-...), nama siswa, kelas, atau menu..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-[#0F172A] dark:text-white"
                />
              </div>
              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-[#0F172A] dark:text-white"
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-[#0F172A] dark:text-white"
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
                    className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-[#0F172A]">
                <p className="text-base font-extrabold">Belum Ada Data Pesanan E-Kantin</p>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
                  Setiap pesanan yang dibuat oleh siswa/guru di halaman{" "}
                  <Link href="/ekantin" className="font-bold text-[#38BDF8] underline">
                    /ekantin
                  </Link>{" "}
                  akan langsung muncul secara otomatis di sini dari Firebase Firestore.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const isBusy = updatingOrderInvoice === ord.invoice;
                  return (
                    <div
                      key={ord.invoice}
                      className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-[#38BDF8]/50 dark:border-white/10 dark:bg-[#0F172A]"
                    >
                      <div className="flex flex-col justify-between gap-3 border-b border-slate-200/70 pb-3.5 dark:border-white/10 sm:flex-row sm:items-center">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="rounded-lg bg-[#2563EB]/15 px-3 py-1 font-mono text-xs font-extrabold text-[#2563EB] dark:text-[#38BDF8]">
                            {ord.invoice}
                          </span>
                          <span
                            className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadgeStyle(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                          <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
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
                          <span className="text-base font-extrabold text-[#2563EB] dark:text-[#38BDF8]">
                            {formatRupiah(ord.total)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3.5 grid gap-4 lg:grid-cols-12 lg:items-center">
                        <div className="lg:col-span-4">
                          <p className="text-sm font-extrabold">{ord.buyer_name}</p>
                          <p className="text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8]">
                            Kelas / Ruangan: {ord.buyer_class}
                          </p>
                          {ord.notes && (
                            <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
                              Catatan Siswa: &ldquo;{ord.notes}&rdquo;
                            </p>
                          )}
                          {ord.admin_notes && (
                            <p className="mt-1 text-xs font-semibold text-emerald-400">
                              Catatan Koperasi: {ord.admin_notes}
                            </p>
                          )}
                        </div>

                        <div className="lg:col-span-4">
                          <div className="flex flex-wrap gap-1.5">
                            {ord.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold dark:border-white/10 dark:bg-[#1E293B]"
                              >
                                {item.qty}x {item.name}{" "}
                                <span className="font-normal text-slate-400">({item.variant})</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-2 lg:col-span-4">
                          {ord.status === "Menunggu Konfirmasi" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleUpdateOrderStatus(ord.invoice, "Diproses Koperasi")}
                              className="rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-sky-500 disabled:opacity-50"
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
                              className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                            >
                              Siap Diambil / Diantar
                            </button>
                          )}
                          {ord.status !== "Selesai" && ord.status !== "Dibatalkan" && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleUpdateOrderStatus(ord.invoice, "Selesai")}
                              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                              ✓ Selesai
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderModal(ord);
                              setAdminNotesInput(ord.admin_notes || "");
                            }}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:border-[#2563EB] dark:border-white/15"
                          >
                            Detail & Ubah
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleDeleteOrder(ord.invoice)}
                            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                          >
                            Hapus
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
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Cari nama produk, ID, atau unit koperasi..."
                  className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-[#0F172A] dark:text-white"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-[#0F172A] dark:text-white"
                >
                  <option value="Semua">Semua Kategori</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={seedingCatalog}
                  onClick={() => void handleSeedDefaultCatalog()}
                  className="rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-4 py-2.5 text-xs font-bold text-[#38BDF8] transition hover:bg-[#38BDF8]/20 disabled:opacity-50"
                >
                  {seedingCatalog
                    ? "Menyimpan ke Firebase..."
                    : "⚡ Muat 8 Produk Standar ke Firebase"}
                </button>
                <button
                  type="button"
                  onClick={openAddProductModal}
                  className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-[#2563EB]/25 transition hover:bg-[#1D4ED8]"
                >
                  + Tambah Produk Baru
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-[#0F172A]">
                <p className="text-base font-extrabold">
                  Katalog Produk di Firebase Masih Kosong
                </p>
                <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
                  Klik tombol di bawah untuk mengimpor 8 produk standar Koperasi SMK Bani Ma&apos;sum ke
                  Firebase Firestore atau tambahkan produk baru secara manual beserta fotonya.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    disabled={seedingCatalog}
                    onClick={() => void handleSeedDefaultCatalog()}
                    className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#2563EB]/25"
                  >
                    {seedingCatalog
                      ? "Menyimpan ke Firebase..."
                      : "⚡ Muat 8 Produk Standar ke Firebase"}
                  </button>
                  <button
                    type="button"
                    onClick={openAddProductModal}
                    className="rounded-xl border border-white/15 px-5 py-2.5 text-xs font-bold"
                  >
                    + Tambah Produk Manual
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0F172A]"
                  >
                    <div className="relative h-44 w-full bg-slate-900">
                      {prod.image_url ? (
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                          Tanpa Foto
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-lg bg-[#0F172A]/85 px-2.5 py-1 text-[10px] font-bold uppercase text-[#38BDF8] backdrop-blur-sm">
                        {prod.category}
                      </span>
                      <span
                        className={`absolute right-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                          prod.stock > 0
                            ? "bg-emerald-600/90 text-white"
                            : "bg-rose-600/90 text-white"
                        }`}
                      >
                        Stok: {prod.stock}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-semibold text-[#2563EB] dark:text-[#38BDF8]">
                        {prod.seller}
                      </p>
                      <h3 className="mt-0.5 text-sm font-extrabold leading-snug">{prod.name}</h3>
                      <p className="mt-1 text-base font-extrabold text-[#2563EB] dark:text-[#38BDF8]">
                        {formatRupiah(prod.price)}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        Terjual: {prod.sold} • Varian: {prod.variants.join(", ")}
                      </p>

                      {/* Quick Stock Controls */}
                      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-1.5 text-xs dark:border-white/10">
                        <span className="font-semibold text-slate-400">Atur Stok:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleQuickStockChange(prod, prod.stock - 1)}
                            className="rounded-md bg-slate-200 px-2 py-0.5 font-bold dark:bg-white/10"
                          >
                            −
                          </button>
                          <span className="font-extrabold">{prod.stock}</span>
                          <button
                            type="button"
                            onClick={() => void handleQuickStockChange(prod, prod.stock + 5)}
                            className="rounded-md bg-slate-200 px-2 py-0.5 font-bold dark:bg-white/10"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => openEditProductModal(prod)}
                          className="rounded-xl bg-[#2563EB] py-2 text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
                        >
                          Edit Produk
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteProduct(prod)}
                          className="rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20"
                        >
                          Hapus
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
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-[#1E293B] sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                  Kelola Pesanan Siswa
                </span>
                <h3 className="text-xl font-extrabold">{selectedOrderModal.invoice}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderModal(null)}
                className="rounded-full bg-white/10 p-2 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-2xl bg-slate-100 p-4 dark:bg-[#0F172A]">
                <p className="font-bold text-sm">{selectedOrderModal.buyer_name}</p>
                <p className="text-[#38BDF8]">
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
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-[#1E293B] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                  Firebase Firestore Katalog
                </span>
                <h3 className="text-xl font-extrabold">
                  {editingProduct ? `Edit Produk: ${editingProduct.name}` : "Tambah Produk E-Kantin Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-full bg-white/10 p-2 text-sm"
              >
                ✕
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
                className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold dark:border-white/15"
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-[#0F172A]/95 py-2.5 text-[11px] font-bold text-slate-300 backdrop-blur-md sm:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === "orders" ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <span>📦</span>
          <span>Pesanan ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === "products" ? "text-[#38BDF8]" : "text-slate-400"
          }`}
        >
          <span>🍱</span>
          <span>Produk ({products.length})</span>
        </button>
        <button
          type="button"
          onClick={openAddProductModal}
          className="flex flex-col items-center gap-0.5 text-emerald-400"
        >
          <span>＋</span>
          <span>Tambah</span>
        </button>
        <Link href="/admin" className="flex flex-col items-center gap-0.5 text-slate-400">
          <span>🎓</span>
          <span>Admin PPDB</span>
        </Link>
      </nav>
    </div>
  );
}
