import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <main className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <AuthProvider>{children}</AuthProvider>
        </main>
      </body>
    </html>
  );
}
