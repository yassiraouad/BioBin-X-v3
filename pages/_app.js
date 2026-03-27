// pages/_app.js
import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { DemoProvider } from '../hooks/useDemo';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <DemoProvider>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a2d1f',
              color: '#e2e8f0',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#0a0f0d' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0a0f0d' },
            },
          }}
        />
        <Component {...pageProps} />
      </AuthProvider>
    </DemoProvider>
  );
}
