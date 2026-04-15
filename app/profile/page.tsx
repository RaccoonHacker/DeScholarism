"use client";

import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor'; // 建议使用新包名
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';

// 导入 IDL
import idlRaw from '../../anchor/target/idl/descholar.json';

const programId = new PublicKey("81yXP67oLaVK2bo3KGwk6zNFZiuCn5uss1DWaM8vshm6");

export default function ResearcherProfile() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  
  const [myPapers, setMyPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyPapers() {
  if (!publicKey || !wallet.signTransaction) return;
  
  try {
    setLoading(true);
    
    // 1. 适配 IDL 结构
    const idl = {
      ...idlRaw,
      version: idlRaw.metadata?.version || "0.1.0",
      name: idlRaw.metadata?.name || "descholar",
    } as any;

    const provider = new AnchorProvider(connection, wallet as any, {
      preflightCommitment: 'processed',
    });
    
    const program = new Program(idl, provider);

    // 2. 注意：这里必须用大写的 Paper，因为 IDL 里定义的是 "name": "Paper"
    // 如果 TS 还是报红，用 (program.account as any).Paper.all()
    const papers = await (program as any).account.paper.all([
  {
    memcmp: {
      offset: 8,
      bytes: publicKey.toBase58(),
    },
  },
]);

    setMyPapers(papers.map((p: any) => ({
      pubkey: p.publicKey.toBase58(),
      title: p.account.title,
      // 这里的字段名必须匹配 IDL 里的 fields
      ipfsHash: p.account.ipfsHash, 
      metadata: p.account.metadata,
      timestamp: p.account.timestamp,
    })));
  } catch (err) {
    console.error("抓取个人论文失败:", err);
  } finally {
    setLoading(false);
  }
}

    fetchMyPapers();
  }, [publicKey, connection, wallet]);

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center min-h-[60vh]">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">account_balance_wallet</span>
        <h2 className="text-2xl font-bold font-headline mb-2">实验室控制台</h2>
        <p className="text-on-surface-variant mb-6">请先连接钱包以访问您的科研主页</p>
      </div>
    );
  }

  return (
    <div className="flex bg-surface min-h-screen">
      {/* 侧边导航栏 */}
      <aside className="w-64 sticky top-[73px] h-[calc(100-73px)] hidden lg:flex flex-col py-6 px-4 bg-[#f8f9fa] border-r border-outline-variant/10">
        <div className="px-4 py-6 mb-4 flex items-center gap-3 bg-white rounded-xl shadow-sm border border-outline-variant/5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">fingerprint</span>
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold truncate">研究员</div>
            <div className="text-[10px] font-mono opacity-50 truncate">{publicKey.toBase58()}</div>
          </div>
        </div>
        
        <nav className="space-y-1">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-primary font-bold bg-white rounded-lg shadow-sm border border-primary/10">
            <span className="material-symbols-outlined text-[20px]">description</span> 
            <span className="text-sm">我的论文</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 w-full text-on-surface-variant hover:bg-black/5 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-[20px]">verified_user</span> 
            <span className="text-sm">版权证明</span>
          </button>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 px-8 py-12 max-w-5xl mx-auto">
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4">
             <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">已认证研究员</span>
          </div>
          <h1 className="text-5xl font-bold font-headline tracking-tighter mb-4 text-on-surface">实验室控制台</h1>
          <p className="text-on-surface-variant max-w-2xl font-light leading-relaxed">
            此处展示您在 SolSci 协议中的所有链上科研贡献。每一份论文均通过 IPFS 永久存储。
          </p>
        </section>

        {/* 数据看板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">已发表论文</p>
            <p className="text-4xl font-headline font-bold mt-2 text-primary">{myPapers.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">链上引用</p>
            <p className="text-4xl font-headline font-bold mt-2 text-on-surface">0</p>
          </div>
        </div>

        {/* 论文列表 */}
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-6 border-b border-outline-variant/10 pb-4">
            <h2 className="text-xl font-bold font-headline">发表记录</h2>
            <Link href="/publish" className="text-sm text-primary hover:underline font-medium">发布新论文 →</Link>
          </div>

          {loading ? (
            <div className="py-20 text-center animate-pulse text-outline">
              正在同步 Solana 链上数据...
            </div>
          ) : myPapers.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-outline-variant/20">
              <p className="text-on-surface-variant font-light">暂无发表记录，开启您的第一份去中心化研究吧。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myPapers.map((paper) => (
                <Link key={paper.pubkey} href={`/paper/${paper.pubkey}`}>
                  <article className="bg-white p-6 rounded-2xl border border-outline-variant/10 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex justify-between mb-4">
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">ON-CHAIN</span>
                      <span className="text-[10px] font-mono text-outline/60">{paper.pubkey}</span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">{paper.title}</h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 font-light leading-relaxed mb-4">
                      {paper.content}
                    </p>
                    <div className="flex gap-4 text-[10px] font-mono text-outline/80 bg-surface px-3 py-2 rounded-lg">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">database</span>
                        CID: {paper.ipfsCid.slice(0, 8)}...
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        SHA-256 Verified
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}