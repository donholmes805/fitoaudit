
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppStateProvider, useAppState, Toast } from './contexts/WalletContext';
import { AuditProvider } from './contexts/AuditContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SubmitPage } from './pages/SubmitPage';
import { ReportPage } from './pages/ReportPage';
import { MyAuditsPage } from './pages/MyAuditsPage';
import { AdminPage } from './pages/AdminPage';
import { SearchPage } from './pages/SearchPage';
import { ReferralsPage } from './pages/ReferralsPage';


const ToastUI: React.FC<{ toast: Toast; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  const baseClasses = 'w-full max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center justify-between transition-all duration-300 transform animate-fade-in-right';
  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-indigo-600',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[toast.type]}`}>
      <span className="font-medium">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="ml-4 -mr-2 p-1 rounded-full hover:bg-white/20 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppState();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2">
      {toasts.map(toast => (
        <ToastUI key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

const AppContent: React.FC = () => {
    return (
        <AuditProvider>
            <div className="min-h-screen flex flex-col bg-gray-900">
                <Header />
                <ToastContainer />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/submit" element={<SubmitPage />} />
                        <Route path="/report/:id" element={<ReportPage />} />
                        <Route path="/my-audits" element={<MyAuditsPage />} />
                        <Route path="/referrals" element={<ReferralsPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/search" element={<SearchPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </AuditProvider>
    )
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </HashRouter>
  );
};

export default App;