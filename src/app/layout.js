import { AppProviders } from '@/components/providers';
import './globals.css';

export const metadata = {
  title: 'SewerVision',
  description: 'Sewer inspection and AI-assisted defect review platform',
  manifest: '/manifest.json',
  applicationName: 'SewerVision',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SewerVision',
  },
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
};

export const viewport = {
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-200">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
