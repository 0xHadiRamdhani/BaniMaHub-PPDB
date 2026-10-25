import { redirect } from "next/navigation";

export default async function RegistrationCardPage({
    searchParams,
}: {
    searchParams: Promise<{ number?: string }>;
}) {
    const params = await searchParams;
    const number = params.number ? `?number=${encodeURIComponent(params.number)}` : "";
    redirect(`/ppdb/tiket${number}`);
}
