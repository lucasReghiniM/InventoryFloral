import React from "react";
import { Flower } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-neutral-100 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Flower className="text-primary h-6 w-6 mr-3" />
              <h1 className="text-2xl font-semibold text-neutral-800">Giovanna Lisianthus</h1>
            </div>
            <div className="text-sm text-neutral-800">
              <span className="hidden sm:inline">Welcome back, </span>Florist
            </div>
          </div>
        </header>

        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
