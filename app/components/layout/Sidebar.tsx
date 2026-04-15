"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: '概览', icon: 'dashboard', href: '/profile/dashboard' },
    { name: '我的论文', icon: 'description', href: '/profile' },
    { name: '引用', icon: 'format_quote', href: '/profile/citations' },
    { name: '设置', icon: 'settings', href: '/profile/settings' },
  ];

  return (
    <aside className="h-screen w-64 left-0 top-0 sticky hidden lg:flex flex-col py-6 px-4 bg-[#eef1f3] border-r border-outline-variant/10">
      <div className="px-4 py-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary bg-white flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>biotech</span>
          </div>
          <div>
            <div className="text-lg font-bold text-[#2c2f31] leading-tight font-headline">实验室控制台</div>
            <div className="text-xs text-[#2c2f31] opacity-60">Researcher ID: 8848</div>
          </div>
        </div>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-all rounded-lg group ${
                isActive 
                ? 'text-[#9945FF] font-bold bg-white shadow-sm' 
                : 'text-[#2c2f31] opacity-60 hover:bg-[#dfe3e6]'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}