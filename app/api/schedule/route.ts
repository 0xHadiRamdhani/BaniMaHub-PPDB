import { getSchedule, saveSchedule } from "@/app/lib/firebase-server";
import { defaultSchedule } from "@/app/lib/ppdb-data";
import { hasAdminSession } from "@/app/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
    try {
        const schedule = await getSchedule();
        return Response.json(
            { schedule: schedule && schedule.length > 0 ? schedule : defaultSchedule },
            { headers: { "Cache-Control": "private, no-cache, no-store, must-revalidate" } }
        );
    } catch (error) {
        console.error("Failed to fetch schedule in GET /api/schedule:", error);
        return Response.json({ schedule: defaultSchedule });
    }
}

export async function POST(request: Request) {
    if (!await hasAdminSession(request)) {
        return Response.json({ error: "Silakan login sebagai admin terlebih dahulu." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { schedule } = body;

        if (!Array.isArray(schedule) || schedule.length === 0) {
            return Response.json(
                { error: "Format jadwal tidak valid. Minimal harus ada 1 tahapan seleksi." },
                { status: 400 }
            );
        }

        const validSchedule: Array<[string, string, string]> = schedule.map((row: unknown) => {
            if (!Array.isArray(row)) return ["", "", ""];
            return [
                String(row[0] ?? "").trim(),
                String(row[1] ?? "").trim(),
                String(row[2] ?? "").trim(),
            ];
        });

        if (validSchedule.some(([stage]) => !stage)) {
            return Response.json(
                { error: "Nama tahapan seleksi tidak boleh kosong." },
                { status: 400 }
            );
        }

        const saved = await saveSchedule(validSchedule);
        if (!saved) {
            console.warn("Schedule save to Firebase returned false, returning valid schedule for client fallback.");
        }

        return Response.json({ ok: true, schedule: validSchedule });
    } catch (error) {
        console.error("Failed to update schedule in POST /api/schedule:", error);
        return Response.json({ error: "Gagal menyimpan jadwal seleksi." }, { status: 500 });
    }
}
