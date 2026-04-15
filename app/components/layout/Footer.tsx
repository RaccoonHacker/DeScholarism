import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa] border-t border-outline-variant/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* 品牌区 */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">science</span>
              <span className="text-xl font-bold font-headline tracking-tight text-on-surface">SolSci</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed opacity-70">
              基于 Solana 构建的去中心化学术出版与版权核验协议。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h5 className="font-bold mb-4 text-sm uppercase tracking-widest text-on-surface">探索</h5>
            <ul className="space-y-2 text-sm text-on-surface-variant opacity-80">
              <li><Link href="/" className="hover:text-primary transition-colors">科研广场</Link></li>
              <li><Link href="/verify" className="hover:text-primary transition-colors">凭证核验</Link></li>
              <li><Link href="/publish" className="hover:text-primary transition-colors">发布论文</Link></li>
            </ul>
          </div>

          {/* 开发者 */}
          <div>
            <h5 className="font-bold mb-4 text-sm uppercase tracking-widest text-on-surface">开发者</h5>
            <ul className="space-y-2 text-sm text-on-surface-variant opacity-80">
              <li><a href="https://github.com/RaccoonHacker/DeScholarism" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">文档</a></li>
              <li><a href="https://github.com/RaccoonHacker" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="https://solana.com/zh" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Solana</a></li>
            </ul>
          </div>

          {/* 状态 */}
          <div>
            <h5 className="font-bold mb-4 text-sm uppercase tracking-widest text-on-surface">网络状态</h5>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Solana Devnet
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-outline opacity-60">
            © 2026 SolSci Protocol. 基于 Solana 区块链。
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-outline hover:text-primary transition-colors">
               <i className="fa-brands fa-x-twitter"></i>
            </a>
            <a href="#" className="text-outline hover:text-primary transition-colors">
               <i className="fa-brands fa-discord"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}