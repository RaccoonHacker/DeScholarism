"use client";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';

// 动态导入钱包按钮防止 Hydration 错误
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export default function Navbar() {
  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-50 glass-nav flex justify-between items-center px-8 py-4 border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        {/* Logo 点击回首页 */}
        <Link href="/" className="text-2xl font-bold tracking-tighter font-headline">DeScholarism </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/explore" className="hover:text-primary transition-colors">探索</Link>
          <Link href="/publish" className="hover:text-primary transition-colors">发布</Link>
          <Link href="/verify" className="hover:text-primary transition-colors">验证</Link>
          <Link href="/register" className="hover:text-primary transition-colors">成为研究者</Link>
        </nav>
      </div>
      
{/* 右侧 操作区 */}
      <div className="flex items-center gap-3">
        {/* 只有在钱包连接后才显示“个人主页”按钮 */}
        {connected && (
          <Link 
            href="/profile" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-black/5 text-on-surface transition-all border border-outline-variant/20 shadow-sm group"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:text-primary">
              account_circle
            </span>
            <span className="text-sm font-medium">个人主页</span>
          </Link>
        )}

        {/* 钱包连接按钮 */}
        <div className="wallet-container">
          <WalletMultiButton />
        </div>
      </div>

    </header>
  );
}