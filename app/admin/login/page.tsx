"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [obscurePassword, setObscurePassword] = useState(true);

    useEffect(() => {
        fetch("/api/admin/login", { cache: "no-store" })
            .then((res) => res.json() as Promise<{ authenticated?: boolean }>)
            .then((data) => {
                if (data.authenticated) {
                    router.replace("/admin");
                }
            })
            .catch(() => undefined);
    }, [router]);

    const login = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.get("email"),
                    password: form.get("password"),
                }),
            });
            const result = (await response.json()) as { error?: string };
            if (!response.ok) throw new Error(result.error || "Login gagal.");
            router.replace("/admin");
            router.refresh();
        } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Login gagal. Coba lagi.");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-paper-soft text-ink">
            {/* Top School Header Section (Hitam & Biru - Flutter LoginScreen) */}
            <div className="w-full rounded-b-4xl bg-linear-to-b from-[#0F172A] to-[#1E3A8A] px-6 pt-16 pb-12 text-center shadow-md sm:pt-20 sm:pb-14">
                <div className="mx-auto flex h-19 w-19 items-center justify-center overflow-hidden rounded-full border-2 border-[#38BDF8] bg-white p-1.5 shadow-[0_3px_10px_rgba(0,0,0,0.15)]">
                    <Image
                        src="/logo.png"
                        alt="Logo SMK Bani Masum"
                        width={64}
                        height={64}
                        className="h-full w-full object-contain"
                    />
                </div>
                <h1 className="mt-4 font-black tracking-[1.2px] text-[22px] text-white">
                    SMK BANI MASUM
                </h1>
                <div className="mt-1.5 inline-block rounded-[20px] border border-[#38BDF8]/30 bg-[#2563EB]/40 px-3.5 py-1">
                    <span className="text-xs font-bold tracking-[0.8px] text-white">
                        PORTAL ADMIN PPDB
                    </span>
                </div>
            </div>

            {/* Card Form Section (Flutter LoginScreen) */}
            <section className="mx-auto max-w-md px-6 py-6 sm:py-8">
                <div className="rounded-3xl border border-neutral-300 bg-paper p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] sm:p-7">
                    <h2 className="text-xl font-extrabold tracking-[-0.5px] text-ink">
                        Masuk Akun
                    </h2>
                    <p className="mt-1 text-[13px] text-muted-soft">
                        Silakan gunakan kredensial administrator panitia.
                    </p>

                    <form onSubmit={login} className="mt-6 space-y-4">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="admin-email"
                                className="block text-[13px] font-bold text-ink"
                            >
                                Email Administrator
                            </label>
                            <div className="relative mt-2">
                                <Mail
                                    size={20}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#38BDF8]"
                                />
                                <input
                                    id="admin-email"
                                    required
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="admin@banimasum.sch.id"
                                    className="block w-full rounded-xl border border-neutral-300 bg-paper-soft py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted-soft focus:border-[#1D4ED8] focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="admin-password"
                                className="block text-[13px] font-bold text-ink"
                            >
                                Kata Sandi
                            </label>
                            <div className="relative mt-2">
                                <Lock
                                    size={20}
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#38BDF8]"
                                />
                                <input
                                    id="admin-password"
                                    required
                                    name="password"
                                    type={obscurePassword ? "password" : "text"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl border border-neutral-300 bg-paper-soft py-3.5 pl-11 pr-11 text-sm text-ink placeholder:text-muted-soft focus:border-[#1D4ED8] focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setObscurePassword(!obscurePassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-soft hover:text-ink"
                                    aria-label={obscurePassword ? "Tampilkan kata sandi" : "Sembunyikan kata sandi"}
                                >
                                    {obscurePassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="flex items-start gap-2.5 rounded-[14px] border border-[#FCA5A5] bg-[#FEF2F2] p-3.5 text-[#DC2626] dark:border-red-500/40 dark:bg-red-950/50 dark:text-red-300"
                            >
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <div className="text-xs font-bold leading-relaxed">{error}</div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-13 w-full items-center justify-center gap-2 rounded-[14px] bg-[#2563EB] px-5 text-[15px] font-bold tracking-[0.3px] text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
                                style={{ color: "#ffffff" }}
                            >
                                {loading ? (
                                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <span>Masuk ke Portal</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-5 flex flex-col items-center gap-2 text-center">
                    <p className="text-xs font-medium text-muted-soft">
                        SMK Bani Masum • PPDB Online System
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#38BDF8] hover:bg-primary-soft"
                    >
                        <ArrowLeft size={14} />
                        <span>Kembali ke Beranda Website</span>
                    </Link>
                </div>
            </section>
        </main>
    );
}

