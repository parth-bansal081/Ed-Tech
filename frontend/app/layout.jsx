import '@/app/globals.css'; // Make sure this matches your global CSS file name!
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import RootThemeWrapper from '@/components/RootThemeWrapper';

export const metadata = {
    title: 'Inclusive Learning Platform',
    description: 'AI-Powered Accessible Classroom Workspace',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AccessibilityProvider>
                    <RootThemeWrapper>
                        {children}
                    </RootThemeWrapper>
                </AccessibilityProvider>
            </body>
        </html>
    );
}