import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
     title: 'Apoteka DAR',
     description: 'Apoteka DAR dashboard',
     manifest: '/manifest.json',
     icons: {
          icon: [
               { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
               { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
          apple: '/icon-192.png',
     },
};

export default function RootLayout({
     children,
}: {
     children: React.ReactNode;
}) {
     return (
          <html lang="sr">
               <body>
                    <Providers>
                         {children}
                    </Providers>
               </body>
          </html>
     );
}