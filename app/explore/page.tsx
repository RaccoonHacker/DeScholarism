"use client";

import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import idlRaw from '@/anchor/target/idl/descholarism.json';
import PaperCard from '../components/shared/PaperCard';

const programId = new PublicKey("81yXP67oLaVK2bo3KGwk6zNFZiuCn5uss1DWaM8vshm6");

export default function ExplorePage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchAllPapers() {
      try {
        setLoading(true);
        const idl = {
          ...idlRaw,
          version: idlRaw.metadata?.version || "0.1.0",
          name: idlRaw.metadata?.name || "descholar",
        } as any;

        const provider = new AnchorProvider(connection, wallet as any, {
          preflightCommitment: 'processed',
        });
        
        const program = new Program(idl, provider);

        // 核心：调用 .all() 且不传过滤器，获取全网数据
        // 使用 (program.account as any).paper 确保兼容性
        const accountClient = (program.account as any).paper || (program.account as any).Paper;
        const allPapers = await accountClient.all();

        setPapers(allPapers.map((p: any) => ({
          pubkey: p.publicKey.toBase58(),
          ...p.account
        })));
      } catch (err) {
        console.error("探索页面数据抓取失败:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllPapers();
  }, [connection, wallet]);

  // 简单的本地搜索过滤逻辑
  const filteredPapers = papers.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.metadata.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* 搜索与标题区 */}
      <section className="bg-white border-b border-outline-variant/10 px-8 py-16">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h1 className="text-6xl font-bold font-headline tracking-tighter">
            探索去中心化科学
          </h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-light text-lg">
            实时调取来自 Solana 全球节点的学术存证。所有论文均通过内容寻址（IPFS）实现永存。
          </p>
          
          {/* 搜索框 */}
          <div className="max-w-xl mx-auto relative group mt-8">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input 
              type="text"
              placeholder="搜索论文标题、关键词或摘要..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-surface rounded-2xl border border-outline-variant/20 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* 论文列表区 */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">dynamic_feed</span>
            最新科研动态
          </h2>
          <span className="text-xs font-mono text-outline">
            已发现 {filteredPapers.length} 份链上记录
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white/50 animate-pulse rounded-2xl border border-outline-variant/10" />
            ))}
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-outline-variant/20">
            <span className="material-symbols-outlined text-4xl text-outline mb-4">find_in_page</span>
            <p className="text-on-surface-variant">未找到匹配的论文，尝试换个关键词？</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <PaperCard key={paper.pubkey} paper={paper} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}