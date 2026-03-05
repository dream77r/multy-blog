import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Multy Blog",
    template: "%s | Multy Blog",
  },
  description: "Multy.ai — статьи, новости и инсайты про AI-автоматизацию",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-gray-900 antialiased min-h-screen flex flex-col">
        <header className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold text-[#2563EB] tracking-tight" style={{fontFamily:'Inter,system-ui,sans-serif'}}>
                Multy
              </span>
              <span className="text-xl font-light text-gray-400" style={{fontFamily:'Inter,system-ui,sans-serif'}}>
                Blog
              </span>
            </a>
            <nav className="flex items-center gap-4 text-sm text-gray-500">
              <a href="https://multy.ai" target="_blank" rel="noopener" className="hover:text-[#2563EB] transition-colors">
                multy.ai →
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">{children}</main>
        <footer className="border-t border-gray-100 mt-16">
          <div className="max-w-3xl mx-auto px-4 py-6 text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Multy.ai — AI-автоматизация для бизнеса
          </div>
        </footer>
      </body>
    </html>
  );
}
