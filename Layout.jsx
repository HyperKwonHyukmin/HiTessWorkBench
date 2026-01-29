import React from 'react';
import { Home, Activity, Database, Settings, Play, Box } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active }) => (
  <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
    active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
  }`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider text-blue-400">HiTESS <span className="text-white text-sm font-light">WB</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Main</div>
          <SidebarItem icon={Home} label="Dashboard" active />
          <SidebarItem icon={Box} label="Projects" />
          
          <div className="text-xs font-semibold text-slate-500 uppercase mt-6 mb-2">Analysis</div>
          <SidebarItem icon={Activity} label="Pre-Processor" />
          <SidebarItem icon={Play} label="Solver" />
          <SidebarItem icon={Database} label="Post-Processor" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <SidebarItem icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <h2 className="text-lg font-semibold text-gray-700">WorkBench Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200 font-semibold">
              ● Server Connected
            </span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-200">
              U
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
}
