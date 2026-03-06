import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Multy Blog", template: "%s | Multy Blog" },
  description: "Multy.ai — статьи об AI-автоматизации, Telegram и продажах",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://multy.brewos.ru"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="site-header">
          <div className="inner">
            <a href="/" className="logo">
              <span className="logo-multy">Multy</span>
              <span className="logo-blog">Blog</span>
            </a>
            <nav className="header-nav">
              <a href="https://multy.ai" target="_blank" rel="noopener">multy.ai →</a>
            </nav>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="inner">© {new Date().getFullYear()} Multy.ai — AI-автоматизация для бизнеса</div>
        </footer>
      </body>
    </html>
  );
}
