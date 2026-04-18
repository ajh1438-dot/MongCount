import { BottomTabNav } from "@/components/navigation/bottom-tab-nav";

export default function TabsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-28 pt-6">
        <div className="flex flex-1 flex-col">{children}</div>
        <BottomTabNav />
      </div>
    </div>
  );
}
