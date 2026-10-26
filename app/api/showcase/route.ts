import { getShowcase, saveShowcase } from "@/app/lib/firebase-server";
import { defaultAchievements, defaultActivities, type MediaItem } from "@/app/lib/ppdb-data";
import { hasAdminSession } from "@/app/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
    try {
        const showcase = await getShowcase();
        return Response.json(
            {
                achievements: showcase?.achievements?.length ? showcase.achievements : defaultAchievements,
                activities: showcase?.activities?.length ? showcase.activities : defaultActivities,
            },
            { headers: { "Cache-Control": "private, no-cache, no-store, must-revalidate" } }
        );
    } catch (error) {
        console.error("Failed to fetch showcase in GET /api/showcase:", error);
        return Response.json({
            achievements: defaultAchievements,
            activities: defaultActivities,
        });
    }
}

export async function POST(request: Request) {
    if (!await hasAdminSession(request)) {
        return Response.json({ error: "Silakan login sebagai admin terlebih dahulu." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { achievements, activities } = body;

        if (!Array.isArray(achievements) || !Array.isArray(activities)) {
            return Response.json(
                { error: "Format data tidak valid. Data prestasi dan kegiatan harus berupa daftar." },
                { status: 400 }
            );
        }

        const sanitizeItem = (item: unknown, fallbackPrefix: string, index: number): MediaItem => {
            const row = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
            return {
                id: String(row.id || `${fallbackPrefix}-${Date.now()}-${index}`),
                title: String(row.title ?? "").trim(),
                description: String(row.description ?? "").trim(),
                imageUrl: String(row.imageUrl ?? "").trim(),
            };
        };

        const validAchievements: MediaItem[] = achievements.map((item, idx) => sanitizeItem(item, "ach", idx));
        const validActivities: MediaItem[] = activities.map((item, idx) => sanitizeItem(item, "act", idx));

        if (validAchievements.some((item) => !item.title || !item.imageUrl)) {
            return Response.json(
                { error: "Semua item Prestasi Siswa harus memiliki judul dan foto." },
                { status: 400 }
            );
        }

        if (validActivities.some((item) => !item.title || !item.imageUrl)) {
            return Response.json(
                { error: "Semua item Kegiatan Sekolah harus memiliki judul dan foto." },
                { status: 400 }
            );
        }

        const saved = await saveShowcase({
            achievements: validAchievements,
            activities: validActivities,
        });

        if (!saved) {
            console.warn("Showcase save to Firebase returned false, returning valid showcase for client fallback.");
        }

        return Response.json({
            ok: true,
            achievements: validAchievements,
            activities: validActivities,
        });
    } catch (error) {
        console.error("Failed to update showcase in POST /api/showcase:", error);
        return Response.json({ error: "Gagal menyimpan data prestasi dan kegiatan." }, { status: 500 });
    }
}
