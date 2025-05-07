import type {Metadata} from 'next';
import { Inter, Roboto_Mono } from 'next/font/google'; // Corrected import name
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ // Corrected usage
  variable: '--font-inter',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({ // Corrected usage
  variable: '--font-roboto-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GradeWise',
  description: 'AI-Powered Online Test Grading System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
