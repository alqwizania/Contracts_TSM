import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
});

export const metadata = {
  title: "محفظة مشاريع وعقود هيئة الصحة العامة - وقاية",
  description: "لوحة التحكم الذكية لمتابعة وإدارة محفظة المشاريع والعقود لهيئة الصحة العامة (وقاية)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
