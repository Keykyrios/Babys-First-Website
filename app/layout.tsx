import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource-variable/fredoka/wght.css";
import "@fontsource-variable/nunito/index.css";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Pip's Midnight Nursery · Junior Dream Engineer",
  description: "Meet Pip, a skull-faced baby who builds the dreams you fall asleep inside. A cozy portfolio with a music box, night-lights, a 3D Pip and a live dream guestbook.",
  icons: { icon: "/art/pip-face-192.png", apple: "/art/pip-face-192.png" },
  openGraph: { title: "Pip's Midnight Nursery", description: "I build the dreams you fall asleep inside.", images: ["/art/pip-hero.webp"] },
};
export const viewport: Viewport = { themeColor: "#fff8f1", width: "device-width", initialScale: 1 };

// runs before first paint so there's no day→night flash
const moodScript = `(function(){try{var m=localStorage.getItem('pip-mood-v1');if(!m){var h=new Date().getHours();m=(h>=20||h<6)?'night':'day'}document.documentElement.dataset.mood=m}catch(e){document.documentElement.dataset.mood='day'}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mood="day" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: moodScript }} /></head>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
