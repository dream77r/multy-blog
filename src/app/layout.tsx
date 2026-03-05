import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Multy Blog",
    template: "%s | Multy Blog",
  },
  description: "Multy.ai — статьи, новости и инсайты",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
            <a href="/" className="text-xl font-semibold text-[#2563EB]">
              Multy Blog
            </a>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-10">{children}</main>
        <footer className="border-t border-gray-100 mt-16">
          <div className="max-w-3xl mx-auto px-4 py-6 text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Multy.ai
          </div>
        </footer>
      </body>
    </html>
  );
}
