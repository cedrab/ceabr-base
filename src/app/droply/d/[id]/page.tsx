import DownloadClient from "./client";

export default async function DownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✔ Next.js 16 compatible

  return <DownloadClient id={id} />;
}
