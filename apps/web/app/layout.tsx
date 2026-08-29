import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArchAI Studio v3 — Enterprise Generative Architecture & Open BIM Platform',
  description: 'High-performance AI architecture platform with Canonical Building Model, NSGA-II optimization, PostGIS GIS, procedural geometry compiler, and IFC4 BIM.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 antialiased overflow-hidden">{children}</body>
    </html>
  );
}
