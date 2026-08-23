export default async function DropPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main><h1 className="text-2xl font-semibold">Drop</h1><p>Drop id: {id}</p></main>;
}
