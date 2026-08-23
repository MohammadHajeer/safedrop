export default async function SharedDropPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  return <main className="p-8"><h1 className="text-2xl font-semibold">Shared Drop</h1><p>Share token: {shareToken}</p></main>;
}
