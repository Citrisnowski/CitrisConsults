import './globals.css';
import { Inter } from 'next/font/google';
import Header from '../components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Citris Consulting',
  description: 'No Website? No Problem',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-white text-gray-900 min-h-screen flex flex-col">
        {/* Persistent navigation bar */}
        <Header />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}