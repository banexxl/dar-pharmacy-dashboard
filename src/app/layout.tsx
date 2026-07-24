import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
     title: 'Apoteka DAR',
     description: 'Apoteka DAR dashboard',
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