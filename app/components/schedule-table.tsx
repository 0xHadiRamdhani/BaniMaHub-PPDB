"use client";

import { useEffect, useState } from "react";
import { defaultSchedule } from "@/app/lib/ppdb-data";

interface ScheduleTableProps {
    initialSchedule?: Array<[string, string, string]>;
}

export default function ScheduleTable({ initialSchedule }: ScheduleTableProps) {
    const [schedule, setSchedule] = useState<Array<[string, string, string]>>(
        initialSchedule && initialSchedule.length > 0 ? initialSchedule : defaultSchedule
    );

    useEffect(() => {
        // Read client storage cache first
        try {
            const saved = localStorage.getItem("ppdb:schedule");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setSchedule(parsed);
                }
            }
        } catch {}

        // Fetch latest schedule from server in background
        fetch("/api/schedule")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
                    setSchedule(data.schedule);
                    try {
                        localStorage.setItem("ppdb:schedule", JSON.stringify(data.schedule));
                    } catch {}
                }
            })
            .catch(() => {});

        // Listen for live updates dispatched by admin panel
        const handleUpdate = () => {
            try {
                const current = localStorage.getItem("ppdb:schedule");
                if (current) {
                    const parsed = JSON.parse(current);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setSchedule(parsed);
                    }
                }
            } catch {}
        };

        window.addEventListener("ppdb:schedule-updated", handleUpdate);
        window.addEventListener("storage", handleUpdate);

        return () => {
            window.removeEventListener("ppdb:schedule-updated", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, []);

    return (
        <div className="overflow-hidden rounded-2xl border border-neutral-300 bg-paper shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                    <thead className="bg-[#0F172A] text-white">
                        <tr>
                            <th className="px-5 py-4 font-extrabold text-sm text-white">Tahapan Seleksi</th>
                            <th className="px-5 py-4 font-extrabold text-sm text-[#38BDF8]">Gelombang 1</th>
                            <th className="px-5 py-4 font-extrabold text-sm text-[#10B981]">Gelombang 2</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-300">
                        {schedule.map((row, idx) => (
                            <tr key={`${row[0]}-${idx}`} className="hover:bg-paper-soft transition-colors">
                                <td className="px-5 py-4 font-bold text-ink">{row[0]}</td>
                                <td className="px-5 py-4">
                                    <span className="inline-flex rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">
                                        {row[1] || "-"}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="inline-flex rounded-lg bg-[#DCFCE7] px-2.5 py-1 text-xs font-bold text-[#15803D]">
                                        {row[2] || "-"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
