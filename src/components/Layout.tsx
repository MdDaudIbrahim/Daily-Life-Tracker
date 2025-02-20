import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Cloud, DollarSign, Newspaper, FileText, MessageSquare, Calendar, Menu, X } from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white shadow-lg
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Daily Life Tracker
          </h1>
        </div>
        <nav className="mt-4">
          <NavLink to="/" icon={<Home size={20} />} text="Dashboard" isActive={isActiveRoute('/')} />
          <NavLink to="/weather" icon={<Cloud size={20} />} text="Weather" isActive={isActiveRoute('/weather')} />
          <NavLink to="/expenses" icon={<DollarSign size={20} />} text="Expenses" isActive={isActiveRoute('/expenses')} />
          <NavLink to="/news" icon={<Newspaper size={20} />} text="Tech News" isActive={isActiveRoute('/news')} />
          <NavLink to="/notes" icon={<FileText size={20} />} text="Notes" isActive={isActiveRoute('/notes')} />
          <NavLink to="/chat" icon={<MessageSquare size={20} />} text="Chat" isActive={isActiveRoute('/chat')} />
          <NavLink to="/routine" icon={<Calendar size={20} />} text="Routine" isActive={isActiveRoute('/routine')} />
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40 h-16">
        <div className="px-4 h-full flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Daily Life Tracker
          </h1>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, text, isActive }: { 
  to: string; 
  icon: React.ReactNode; 
  text: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`
      flex items-center px-6 py-3 transition-colors
      ${isActive 
        ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
      }
    `}
  >
    <span className="mr-3">{icon}</span>
    <span className="font-medium">{text}</span>
  </Link>
);

export default Layout;