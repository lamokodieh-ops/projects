export function generateStaticParams() {
  // Pre-render demo material routes for GitHub Pages static export.
  return Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }));
}

export default function MaterialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
