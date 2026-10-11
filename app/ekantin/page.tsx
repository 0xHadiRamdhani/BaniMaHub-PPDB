"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "../components/header";
import FoodBackground from "../components/food-background";

type CategoryId = "semua" | "makanan" | "minuman" | "alat-tulis" | "seragam" | "atribut";

type Product = {
  id: string;
  name: string;
  category: Exclude<CategoryId, "semua">;
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

type CartItem = {
  product: Product;
  variant: string;
  qty: number;
  note: string;
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

const CATEGORIES: Array<{ id: CategoryId; label: string; desc: string; icon: string }> = [
  { id: "semua", label: "Semua Produk", desc: "Katalog Lengkap", icon: "grid" },
  { id: "makanan", label: "Makanan & Snack", desc: "Kantin Sehat", icon: "food" },
  { id: "minuman", label: "Minuman Segar", desc: "Dingin & Hangat", icon: "drink" },
  { id: "alat-tulis", label: "Alat Tulis (ATK)", desc: "Kebutuhan Kelas", icon: "atk" },
  { id: "seragam", label: "Seragam & Praktik", desc: "RPL & TBSM", icon: "shirt" },
  { id: "atribut", label: "Atribut Sekolah", desc: "Dasi, Topi, Bet", icon: "badge" },
];

const PAYMENT_METHODS = [
  { id: "QRIS Koperasi", label: "QRIS Koperasi Sekolah", desc: "Scan GoPay, OVO, DANA, ShopeePay, m-Banking" },
  { id: "Kartu Pelajar Digital", label: "Saldo Kartu Pelajar Bani Ma'sum", desc: "Potong otomatis saldo siswa" },
  { id: "Bayar di Koperasi (COD)", label: "Tunai Saat Ambil / COD Kelas", desc: "Bayar langsung ke petugas koperasi" },
];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function CategoryIcon({ type, className = "h-5 w-5" }: { type: string; className?: string }) {
  switch (type) {
    case "food":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14a2 2 0 012 2v8a4 4 0 01-4 4H7a4 4 0 01-4-4V8a2 2 0 012-2z" />
        </svg>
      );
    case "drink":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8l-1 16a2 2 0 01-2 2h-2a2 2 0 01-2-2L8 3zM6 7h12M12 3v4" />
        </svg>
      );
    case "atk":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      );
    case "shirt":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3l5 4-3 4-2-1v11H8V10l-2 1-3-4 5-4a4 4 0 008 0z" />
        </svg>
      );
    case "badge":
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
  }
}

export default function EKantinPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  const [activeCategory, setActiveCategory] = useState<CategoryId>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"populer" | "termurah" | "termahal">("populer");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [savedInvoices, setSavedInvoices] = useState<string[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [invoiceSearchInput, setInvoiceSearchInput] = useState("");

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [detailQty, setDetailQty] = useState<number>(1);
  const [detailNote, setDetailNote] = useState<string>("");

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [activeOrderModal, setActiveOrderModal] = useState<OrderRecord | null>(null);

  // Checkout Form
  const [buyerName, setBuyerName] = useState("");
  const [buyerClass, setBuyerClass] = useState("X RPL 1");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"Ambil di Koperasi" | "Antar ke Kelas">("Ambil di Koperasi");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [orderNotes, setOrderNotes] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Load real products from Firebase Firestore
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductError("");
    try {
      const response = await fetch("/api/ekantin/products", { cache: "no-store" });
      const data = (await response.json()) as { products?: Product[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat produk dari Firebase.");
      }
      setProducts(data.products ?? []);
    } catch (err) {
      setProductError(err instanceof Error ? err.message : "Gagal memuat produk dari Firebase.");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Load student's saved invoices from Firebase Firestore
  const fetchOrdersByInvoices = useCallback(async (invoiceList: string[]) => {
    if (!invoiceList.length) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const response = await fetch(
        `/api/ekantin/orders?invoices=${encodeURIComponent(invoiceList.join(","))}`,
        { cache: "no-store" }
      );
      const data = (await response.json()) as { orders?: OrderRecord[] };
      if (response.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch {
      // ignore background error
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
    try {
      const savedCart = localStorage.getItem("banimahub-ekantin-cart-v2");
      const savedWish = localStorage.getItem("banimahub-ekantin-wish-v2");
      const savedInvs = localStorage.getItem("banimahub-ekantin-invoices-v1");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedWish) setWishlist(JSON.parse(savedWish));
      if (savedInvs) {
        const parsed = JSON.parse(savedInvs) as string[];
        setSavedInvoices(parsed);
        void fetchOrdersByInvoices(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, [fetchProducts, fetchOrdersByInvoices]);

  useEffect(() => {
    try {
      localStorage.setItem("banimahub-ekantin-cart-v2", JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("banimahub-ekantin-wish-v2", JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products
      .filter((item) => {
        const matchCategory = activeCategory === "semua" || item.category === activeCategory;
        const matchQuery =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.seller.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query);
        return matchCategory && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === "termurah") return a.price - b.price;
        if (sortBy === "termahal") return b.price - a.price;
        return b.sold - a.sold;
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [cart]
  );
  const serviceFee = deliveryMethod === "Antar ke Kelas" && cart.length > 0 ? 2000 : 0;
  const grandTotal = subtotal + serviceFee;

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants[0] || "Standar");
    setDetailQty(1);
    setDetailNote("");
  };

  const addToCart = (product: Product, variant = product.variants[0] || "Standar", qty = 1, note = "") => {
    if (!product.available || product.stock <= 0) {
      showToast("Maaf, stok produk ini sedang habis.");
      return;
    }
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant === variant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        const nextQty = Math.min(product.stock, updated[existingIndex].qty + qty);
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: nextQty,
          note: note || updated[existingIndex].note,
        };
        return updated;
      }
      return [...prev, { product, variant, qty: Math.min(product.stock, qty), note }];
    });
    showToast(`${product.name} ditambahkan ke keranjang`);
  };

  const updateCartQty = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const nextQty = updated[index].qty + delta;
      if (nextQty <= 0) {
        updated.splice(index, 1);
      } else if (nextQty <= updated[index].product.stock) {
        updated[index] = { ...updated[index], qty: nextQty };
      }
      return updated;
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Create real order in Firebase Firestore
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length || !buyerName.trim() || isSubmittingOrder) return;

    setIsSubmittingOrder(true);
    try {
      const response = await fetch("/api/ekantin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyerName.trim(),
          buyer_class: buyerClass,
          buyer_phone: buyerPhone.trim(),
          delivery_method: deliveryMethod,
          payment_method: paymentMethod,
          notes: orderNotes.trim(),
          items: cart.map((item) => ({
            product_id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            qty: item.qty,
            variant: item.variant,
            image_url: item.product.image_url,
            seller: item.product.seller,
          })),
        }),
      });
      const data = (await response.json()) as { order?: OrderRecord; error?: string };
      if (!response.ok || !data.order) {
        throw new Error(data.error || "Gagal membuat pesanan di Firebase.");
      }

      const newOrder = data.order;
      const nextInvoices = [newOrder.invoice, ...savedInvoices.filter((inv) => inv !== newOrder.invoice)].slice(0, 20);
      setSavedInvoices(nextInvoices);
      try {
        localStorage.setItem("banimahub-ekantin-invoices-v1", JSON.stringify(nextInvoices));
      } catch {
        // ignore
      }

      setOrders((prev) => [newOrder, ...prev.filter((o) => o.invoice !== newOrder.invoice)]);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setActiveOrderModal(newOrder);
      showToast(`Pesanan ${newOrder.invoice} berhasil disimpan ke Firebase!`);
      void fetchProducts(); // Refresh product stock from Firebase
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal membuat pesanan.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Track order by Invoice from Firebase
  const handleTrackInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoiceSearchInput.trim().toUpperCase();
    if (!inv) return;

    try {
      const response = await fetch(`/api/ekantin/orders?invoice=${encodeURIComponent(inv)}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as { order?: OrderRecord; error?: string };
      if (!response.ok || !data.order) {
        showToast(data.error || "Invoice tidak ditemukan di Firebase.");
        return;
      }
      setActiveOrderModal(data.order);
      if (!savedInvoices.includes(data.order.invoice)) {
        const next = [data.order.invoice, ...savedInvoices].slice(0, 20);
        setSavedInvoices(next);
        localStorage.setItem("banimahub-ekantin-invoices-v1", JSON.stringify(next));
      }
      setOrders((prev) => [data.order!, ...prev.filter((o) => o.invoice !== data.order!.invoice)]);
      setInvoiceSearchInput("");
    } catch {
      showToast("Gagal memeriksa status invoice di Firebase.");
    }
  };

  // Student confirms receipt in Firebase
  const confirmOrderReceived = async (invoice: string) => {
    try {
      const response = await fetch("/api/ekantin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice, status: "Selesai" }),
      });
      const data = (await response.json()) as { order?: OrderRecord; error?: string };
      if (!response.ok || !data.order) {
        throw new Error(data.error || "Gagal memperbarui status pesanan.");
      }
      setOrders((prev) => prev.map((o) => (o.invoice === invoice ? data.order! : o)));
      setActiveOrderModal(data.order);
      showToast(`Pesanan ${invoice} telah dikonfirmasi Selesai.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Gagal mengonfirmasi pesanan.");
    }
  };

  return (
    <div className="min-h-screen bg-paper-soft text-[#0F172A] dark:bg-[#020617] dark:text-[#F8FAFC]">
      <Header />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#38BDF8]/40 bg-[#0F172A]/95 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl backdrop-blur-md">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-xs text-white">
            ✓
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section (identik dengan halaman utama + animasi background makanan) */}
      <section className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-[#0F172A] via-[#0F172A] to-[#1E3A8A] py-12 text-white shadow-xl sm:rounded-b-[44px] sm:py-16 lg:py-20">
        <FoodBackground />

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
                E-Kantin & Koperasi Digital{" "}
                <span className="bg-gradient-to-r from-[#38BDF8] to-[#2563EB] bg-clip-text text-transparent">
                  SMK Bani Ma&apos;sum
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
                Layanan pemesanan makanan kantin sehat, minuman segar, alat tulis (ATK), seragam
                praktik, hingga atribut sekolah bagi Siswa dan Orang Tua Siswa SMK Bani Ma&apos;sum
                secara praktis tanpa antre.
              </p>

              {/* Search Bar & Quick Actions */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nasi ayam, es cokelat, wearpack RPL, seragam batik, ATK..."
                    className="w-full rounded-xl border border-white/15 bg-[#1E293B]/90 py-3.5 pl-12 pr-4 text-sm text-white placeholder-[#94A3B8] outline-none transition focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-0.5 text-xs text-[#94A3B8] hover:bg-white/10 hover:text-white"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(true)}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#2563EB] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-6-4h.01" />
                  </svg>
                  <span>Keranjang</span>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-extrabold">
                    {cartCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Promo / Operational Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/10 bg-[#1E293B]/80 p-6 shadow-2xl backdrop-blur-md">
                <div className="border-b border-white/10 pb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                    Layanan Siswa & Orang Tua
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-white">
                    Cek Status Pesanan & Jam Layanan
                  </h2>
                </div>

                {/* Live Invoice Tracker */}
                <form onSubmit={handleTrackInvoice} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={invoiceSearchInput}
                    onChange={(e) => setInvoiceSearchInput(e.target.value)}
                    placeholder="Masukkan Nomor Pesanan (contoh: EK-12345)"
                    className="flex-1 rounded-xl border border-white/10 bg-[#0F172A]/80 px-3.5 py-2.5 text-xs text-white placeholder-[#94A3B8] outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#2563EB] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1D4ED8]"
                  >
                    Cek Pesanan
                  </button>
                </form>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-white/5 bg-[#0F172A]/60 p-3.5">
                    <p className="text-xs text-[#94A3B8]">Jam Layanan</p>
                    <p className="mt-1 font-bold text-white">07.00 – 15.30 WIB</p>
                    <p className="mt-0.5 text-xs text-[#38BDF8]">Senin s/d Sabtu</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0F172A]/60 p-3.5">
                    <p className="text-xs text-[#94A3B8]">Pengambilan</p>
                    <p className="mt-1 font-bold text-white">Loket / Kelas</p>
                    <p className="mt-0.5 text-xs text-[#38BDF8]">Praktis & Cepat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        {/* Active Orders Banner */}
        {orders.length > 0 && (
          <div className="mb-10 rounded-2xl border border-[#2563EB]/30 bg-gradient-to-r from-[#2563EB]/10 via-[#1E293B]/60 to-[#0F172A]/80 p-5 shadow-md">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
                    Status Pesanan Terkini Anda
                  </p>
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                    {orders[0].invoice} • {orders[0].buyer_name} ({orders[0].buyer_class}) —{" "}
                    <span className="text-[#2563EB] dark:text-[#38BDF8]">{orders[0].status}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {orders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.invoice}
                    type="button"
                    onClick={() => setActiveOrderModal(ord)}
                    className="rounded-xl border border-[#2563EB]/40 bg-white px-3.5 py-2 text-xs font-bold text-[#2563EB] shadow-sm transition hover:bg-[#2563EB] hover:text-white dark:bg-[#0F172A] dark:text-[#38BDF8]"
                  >
                    Lihat Bukti {ord.invoice}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Cards */}
        <div className="mb-10">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white sm:text-2xl">
                Kategori Katalog E-Kantin & Koperasi
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
                Pilih menu kantin sehat, minuman, alat tulis, atau perlengkapan seragam siswa
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "populer" | "termurah" | "termahal")}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0F172A] shadow-sm outline-none transition focus:border-[#2563EB] dark:border-white/10 dark:bg-[#1E293B] dark:text-white"
              >
                <option value="populer">Paling Laris</option>
                <option value="termurah">Harga Termurah</option>
                <option value="termahal">Harga Tertinggi</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 overflow-x-auto py-3 px-1 sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`group flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isActive
                      ? "border-[#2563EB] bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25"
                      : "border-slate-200/80 bg-white text-[#0F172A] hover:-translate-y-1 hover:border-[#38BDF8]/60 hover:shadow-md dark:border-white/10 dark:bg-[#1E293B]/90 dark:text-white"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#2563EB]/10 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white dark:bg-[#38BDF8]/15 dark:text-[#38BDF8]"
                    }`}
                  >
                    <CategoryIcon type={cat.icon} className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-bold leading-snug">{cat.label}</p>
                  <p
                    className={`mt-0.5 text-xs ${
                      isActive ? "text-blue-100" : "text-[#475569] dark:text-[#94A3B8]"
                    }`}
                  >
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading / Error / Product Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#1E293B]/60"
              >
                <div className="h-44 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-6 h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : productError ? (
          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-10 text-center">
            <p className="text-base font-bold text-rose-400">{productError}</p>
            <button
              type="button"
              onClick={() => void fetchProducts()}
              className="mt-4 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-[#1E293B]">
            <p className="text-lg font-bold text-[#0F172A] dark:text-white">
              {products.length === 0
                ? "Katalog Firebase E-Kantin Masih Kosong"
                : "Produk tidak ditemukan untuk pencarian ini"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#475569] dark:text-[#94A3B8]">
              {products.length === 0
                ? "Belum ada produk yang tersedia di katalog E-Kantin saat ini."
                : "Coba gunakan kata kunci lain atau pilih kategori Semua Produk."}
            </p>
            {products.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("semua");
                    setSearchQuery("");
                  }}
                  className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]"
                >
                  Tampilkan Semua Produk
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const isWished = wishlist.includes(product.id);
              const outOfStock = !product.available || product.stock <= 0;
              return (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#38BDF8]/60 hover:shadow-xl dark:border-white/10 dark:bg-[#1E293B]/90"
                >
                  {/* Image Header */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-xs font-bold text-[#94A3B8]">
                        Foto Produk Koperasi
                      </div>
                    )}
                    <div className=" inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent" />

                    {product.badge && (
                      <span className="absolute left-3.5 top-3.5 rounded-full bg-[#2563EB] px-3 py-1 text-[11px] font-extrabold text-white shadow-md">
                        {product.badge}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Simpan ke favorit"
                      className={`absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition ${
                        isWished
                          ? "bg-rose-500 text-white"
                          : "bg-[#0F172A]/60 text-white hover:bg-[#0F172A]"
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill={isWished ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs font-semibold text-white">
                      <span className="rounded-lg bg-[#0F172A]/80 px-2.5 py-1 backdrop-blur-sm">
                        ⏱ {product.estimate}
                      </span>
                      <span
                        className={`rounded-lg px-2.5 py-1 backdrop-blur-sm ${
                          outOfStock ? "bg-rose-600/90 text-white" : "bg-[#0F172A]/80 text-amber-300"
                        }`}
                      >
                        {outOfStock ? "Stok Habis" : `Stok: ${product.stock}`}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8]">
                      {product.seller}
                    </p>
                    <button
                      type="button"
                      onClick={() => openProductModal(product)}
                      className="mt-1 text-left text-base font-extrabold leading-snug text-[#0F172A] transition hover:text-[#2563EB] dark:text-white dark:hover:text-[#38BDF8]"
                    >
                      {product.name}
                    </button>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#475569] dark:text-[#94A3B8]">
                      {product.description}
                    </p>

                    <div className="mt-auto pt-5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                          {formatRupiah(product.price)}
                        </span>
                        {product.original_price && (
                          <span className="text-xs text-[#94A3B8] line-through">
                            {formatRupiah(product.original_price)}
                          </span>
                        )}
                      </div>

                      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => openProductModal(product)}
                          className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB] dark:border-white/15 dark:text-white dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8]"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          disabled={outOfStock}
                          onClick={() => addToCart(product)}
                          className="rounded-xl bg-[#2563EB] px-3 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#2563EB]/25 transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {outOfStock ? "Habis" : "+ Keranjang"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-[#1E293B] sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
                  {selectedProduct.seller}
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-[#0F172A] dark:text-white">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-white/10 dark:text-white"
              >
                ✕
              </button>
            </div>

            {selectedProduct.image_url && (
              <div className="mt-4 h-56 w-full overflow-hidden rounded-2xl bg-slate-900">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#2563EB] dark:text-[#38BDF8]">
                  {formatRupiah(selectedProduct.price)}
                </span>
                {selectedProduct.original_price && (
                  <span className="text-sm text-[#94A3B8] line-through">
                    {formatRupiah(selectedProduct.original_price)}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                Stok tersedia: {selectedProduct.stock} • Terjual {selectedProduct.sold}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-[#475569] dark:text-[#94A3B8]">
              {selectedProduct.description}
            </p>

            {/* Variant Selector */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                Pilih Varian / Ukuran
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedProduct.variants.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                      selectedVariant === variant
                        ? "border-[#2563EB] bg-[#2563EB] text-white"
                        : "border-slate-200 text-[#0F172A] hover:border-[#2563EB] dark:border-white/15 dark:text-white"
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Note */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                  Jumlah Pesanan
                </label>
                <div className="mt-2 inline-flex items-center rounded-xl border border-slate-200 dark:border-white/15">
                  <button
                    type="button"
                    onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                    className="px-4 py-2 text-sm font-bold"
                  >
                    −
                  </button>
                  <span className="px-4 text-sm font-extrabold">{detailQty}</span>
                  <button
                    type="button"
                    onClick={() => setDetailQty((q) => Math.min(selectedProduct.stock, q + 1))}
                    className="px-4 py-2 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={detailNote}
                  onChange={(e) => setDetailNote(e.target.value)}
                  placeholder="Contoh: Tidak pedas / sedikit es"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 text-xs outline-none focus:border-[#2563EB] dark:border-white/15"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={!selectedProduct.available || selectedProduct.stock <= 0}
                onClick={() => {
                  addToCart(selectedProduct, selectedVariant, detailQty, detailNote);
                  setSelectedProduct(null);
                }}
                className="flex-1 rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2563EB]/25 transition hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                + Tambah ke Keranjang ({formatRupiah(selectedProduct.price * detailQty)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl dark:bg-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white">
                  Keranjang E-Kantin
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  {cartCount} item dipilih
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-white/10 dark:text-white"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-bold text-[#0F172A] dark:text-white">
                  Keranjang Masih Kosong
                </p>
                <p className="mt-1 max-w-xs text-xs text-[#475569] dark:text-[#94A3B8]">
                  Yuk pilih makanan, minuman, atau perlengkapan sekolah dari katalog E-Kantin.
                </p>
              </div>
            ) : (
              <>
                <div className="my-4 flex-1 space-y-3 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.variant}`}
                      className="flex gap-3.5 rounded-2xl border border-slate-200 p-3.5 dark:border-white/10 dark:bg-[#1E293B]"
                    >
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 text-[10px] font-bold text-slate-400">
                          Produk
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#0F172A] dark:text-white">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-[#2563EB] dark:text-[#38BDF8]">{item.variant}</p>
                        {item.note && (
                          <p className="mt-0.5 text-[11px] italic text-[#475569] dark:text-[#94A3B8]">
                            Catatan: {item.note}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#0F172A] dark:text-white">
                            {formatRupiah(item.product.price * item.qty)}
                          </span>
                          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-white/15">
                            <button
                              type="button"
                              onClick={() => updateCartQty(idx, -1)}
                              className="px-2.5 py-0.5 text-xs font-bold"
                            >
                              −
                            </button>
                            <span className="px-2 text-xs font-bold">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(idx, 1)}
                              className="px-2.5 py-0.5 text-xs font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 dark:border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#475569] dark:text-[#94A3B8]">Subtotal Produk</span>
                    <span className="font-extrabold text-[#0F172A] dark:text-white">
                      {formatRupiah(subtotal)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="mt-4 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2563EB]/25 transition hover:bg-[#1D4ED8]"
                  >
                    Lanjut ke Pembayaran →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={handleCheckoutSubmit}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-[#1E293B] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
                  Checkout Pesanan E-Kantin
                </span>
                <h3 className="text-xl font-extrabold text-[#0F172A] dark:text-white">
                  Data Pemesan & Pembayaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 dark:bg-white/10 dark:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                  Nama Lengkap Siswa / Orang Tua Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Masukkan nama siswa atau orang tua siswa"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#2563EB] dark:border-white/15"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                    Kelas Siswa / Tujuan *
                  </label>
                  <select
                    value={buyerClass}
                    onChange={(e) => setBuyerClass(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#2563EB] dark:border-white/15 dark:bg-[#0F172A]"
                  >
                    <option>X RPL 1</option>
                    <option>X RPL 2</option>
                    <option>XI RPL 1</option>
                    <option>XII RPL 1</option>
                    <option>X TBSM 1</option>
                    <option>XI TBSM 1</option>
                    <option>XII TBSM 1</option>
                    <option>Orang Tua / Wali Siswa (Ambil di Koperasi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                    Nomor WhatsApp (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="0812xxxx"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#2563EB] dark:border-white/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                  Metode Pengambilan
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  {(["Ambil di Koperasi", "Antar ke Kelas"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setDeliveryMethod(method)}
                      className={`rounded-xl border p-3 text-left text-xs font-bold transition ${
                        deliveryMethod === method
                          ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] dark:border-[#38BDF8] dark:text-[#38BDF8]"
                          : "border-slate-200 text-[#475569] dark:border-white/10 dark:text-[#94A3B8]"
                      }`}
                    >
                      <p>{method}</p>
                      <p className="mt-0.5 text-[11px] font-normal">
                        {method === "Ambil di Koperasi" ? "Gratis biaya layanan" : "+Rp 2.000 kurir piket"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                  Metode Pembayaran
                </label>
                <div className="mt-1.5 space-y-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        paymentMethod === pm.id
                          ? "border-[#2563EB] bg-[#2563EB]/10 dark:border-[#38BDF8]"
                          : "border-slate-200 dark:border-white/10"
                      }`}
                    >
                      <p className="text-xs font-bold text-[#0F172A] dark:text-white">{pm.label}</p>
                      <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">{pm.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-white">
                  Catatan Pesanan (Opsional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Contoh: Diambil saat istirahat pertama pukul 09.45"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-transparent px-4 py-2.5 text-xs outline-none focus:border-[#2563EB] dark:border-white/15"
                />
              </div>

              <div className="rounded-2xl bg-slate-100 p-4 text-xs dark:bg-[#0F172A]">
                <div className="flex justify-between">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Subtotal ({cartCount} item)</span>
                  <span className="font-bold">{formatRupiah(subtotal)}</span>
                </div>
                <div className="mt-1.5 flex justify-between">
                  <span className="text-[#475569] dark:text-[#94A3B8]">Biaya Pengantaran</span>
                  <span className="font-bold">{formatRupiah(serviceFee)}</span>
                </div>
                <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-2.5 text-sm font-extrabold dark:border-white/10">
                  <span>Total Pembayaran</span>
                  <span className="text-[#2563EB] dark:text-[#38BDF8]">{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="mt-5 w-full rounded-xl bg-[#2563EB] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#2563EB]/30 transition hover:bg-[#1D4ED8] disabled:opacity-50"
            >
              {isSubmittingOrder ? "Memproses Pesanan..." : "Konfirmasi & Buat Pesanan Sekarang"}
            </button>
          </form>
        </div>
      )}

      {/* Order Status / Receipt Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-white p-6 shadow-2xl dark:bg-[#1E293B] sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
                  Bukti Pesanan E-Kantin & Koperasi
                </span>
                <h3 className="text-xl font-extrabold text-[#0F172A] dark:text-white">
                  {activeOrderModal.invoice}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrderModal(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 dark:bg-white/10 dark:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[#2563EB]/30 bg-[#2563EB]/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-[#38BDF8]">
                  Status Saat Ini: {activeOrderModal.status}
                </p>
                <span className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                  {new Date(activeOrderModal.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WIB
                </span>
              </div>
              <p className="mt-1 text-xs text-[#475569] dark:text-[#94A3B8]">
                Pemesan: <strong className="text-[#0F172A] dark:text-white">{activeOrderModal.buyer_name}</strong> ({activeOrderModal.buyer_class}) •{" "}
                {activeOrderModal.delivery_method}
              </p>
              {activeOrderModal.admin_notes && (
                <p className="mt-2 rounded-lg bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#0F172A] dark:bg-[#0F172A]/70 dark:text-[#38BDF8]">
                  Catatan Petugas Koperasi: {activeOrderModal.admin_notes}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              {activeOrderModal.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs dark:border-white/10"
                >
                  <div>
                    <p className="font-bold text-[#0F172A] dark:text-white">
                      {item.qty}x {item.name}
                    </p>
                    <p className="text-[#475569] dark:text-[#94A3B8]">{item.variant}</p>
                  </div>
                  <span className="font-bold">{formatRupiah(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-extrabold dark:border-white/10">
              <span>Total Dibayar ({activeOrderModal.payment_method})</span>
              <span className="text-[#2563EB] dark:text-[#38BDF8]">
                {formatRupiah(activeOrderModal.total)}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {activeOrderModal.status !== "Selesai" && activeOrderModal.status !== "Dibatalkan" && (
                <button
                  type="button"
                  onClick={() => void confirmOrderReceived(activeOrderModal.invoice)}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500"
                >
                  ✓ Konfirmasi Pesanan Diterima
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveOrderModal(null)}
                className="rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-[#0F172A] dark:bg-white/10 dark:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0F172A] py-10 text-center text-xs text-[#94A3B8]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <p className="font-bold text-white">
            E-Kantin & Koperasi Siswa Digital — SMK Bani Ma&apos;sum
          </p>
          <p className="mt-1">
            Layanan pemesanan makanan, minuman, ATK, dan perlengkapan sekolah resmi
          </p>
        </div>
      </footer>
    </div>
  );
}
