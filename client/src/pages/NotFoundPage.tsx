import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';

export const NotFoundPage: React.FC = () => {
  return (
    <PageContainer maxWidth="md" className="py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-crimson-red/10 border border-crimson-red/30 text-crimson-red flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-snow-white">404 — PAGE NOT FOUND</h1>
      <p className="text-sm font-mono text-cool-gray">
        The requested URL or game session path does not exist.
      </p>
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-green hover:bg-emerald-600 text-jet-black font-bold text-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </PageContainer>
  );
};
