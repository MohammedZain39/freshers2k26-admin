import './globals.css';
import type { ReactNode } from 'react';
export const metadata={title:'Freshers Command Center',description:'Private event management and verification portal'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>}
