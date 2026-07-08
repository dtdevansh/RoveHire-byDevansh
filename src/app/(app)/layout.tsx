export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="hidden w-60 border-r border-border bg-surface1 lg:block" />
      <div className="flex flex-1 flex-col">
        <header className="h-14 border-b border-border bg-surface1" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
