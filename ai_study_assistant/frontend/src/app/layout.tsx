import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Assistant",
  description: "Grounded explanations, quizzes, and summaries from your course materials.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}