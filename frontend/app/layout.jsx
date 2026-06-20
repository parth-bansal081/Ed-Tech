import '@/app/globals.css'; 
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import RootThemeWrapper from '@/components/RootThemeWrapper';

export const metadata = {
    title: 'Inclusive Learning Platform',
    description: 'AI-Powered Accessible Classroom Workspace',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased bg-[#0a051b]">
                {/* Temporary Bypass: We are pulling children completely out of the wrappers 
                  so we can see our local registration page without database lockouts!
                */}
                {children}
            </body>
        </html>
    );
}