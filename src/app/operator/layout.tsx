import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || (session.user as any).role !== "OPERATOR") redirect("/login");

  const user = session.user as any;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role="OPERATOR"
        nama={user.name ?? ""}
        wilayahNama={user.wilayahNama ?? ""}
        dukuhNama={user.dukuhNama ?? ""}
      />
      <main className="flex-1 flex flex-col bg-background overflow-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
