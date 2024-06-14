import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Head from "next/head"; // Import Head from next/head

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Prep Interview"
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <Head>
          <title>{metadata.title}</title> {/* Set the title here */}
        </Head>
        <body className={inter.className}>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
