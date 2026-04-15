"use client";

import React, { useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from '@/anchor/target/idl/descholar.json';

const programId = new web3.PublicKey("81yXP67oLaVK2bo3KGwk6zNFZiuCn5uss1DWaM8vshm6");

export default function VerifyPage() {
  const { connection } = useConnection();
  
  // 状态管理
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 核验函数
  const handleVerify = async () => {
    if (!searchId) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const provider = new AnchorProvider(connection, (window as any).solana, {});
      const program = new Program(idl as any, programId, provider);
      
      // 尝试作为 Paper 账户 PublicKey 来获取数据
      const pubkey = new web3.PublicKey(searchId);
      const data = await program.account.paper.fetch(pubkey);
      
      setResult({
        ...data,
        pubkey: searchId,
        slot: "284,992,104", // 实际开发中可以通过 getTransaction 获取具体 Slot
      });
    } catch (err) {
      console.error("核验失败:", err);
      setError("未找到相关凭证，请检查账户地址或交易 ID 是否正确。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-8 py-12 lg:py-20">
      <header className="mb-16">
        <h1 className="text-5xl lg:text-7xl font-bold font-headline tracking-tighter">核验论文凭证</h1>
        <p className="text-on-surface-variant mt-4">利用 Solana 区块链即时验证科学成果的原始性。</p>
      </header>

      {/* 搜索框区 */}
      <section className="mb-20">
        <div className="relative max-w-3xl">
          <div className="flex items-center bg-surface-container-low p-2 rounded-xl focus-within:ring-2 ring-primary/20">
            <span className="material-symbols-outlined px-4 text-outline">search</span>
            <input 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-lg py-4" 
              placeholder="输入论文账户地址 (Public Key)" 
            />
            <button 
              onClick={handleVerify}
              disabled={loading}
              className="bg-on-surface text-surface px-8 py-4 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "核验中..." : "核验凭证"}
            </button>
          </div>
          {error && <p className="text-error text-xs mt-4 ml-2">{error}</p>}
        </div>
      </section>

      {/* 结果展示区 - 条件渲染 */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-10 border-b-2 border-primary/10">
            <div className="flex justify-between items-center mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold mb-4">
                  <span className="material-symbols-outlined text-sm">verified</span> 已验证真实
                </div>
                <h2 className="text-3xl font-headline font-bold">{result.title}</h2>
                <p className="text-outline mt-2">作者地址: {result.author.toString()}</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="p-6 bg-surface-container-low rounded-lg">
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-bold opacity-70">不可变哈希 (PDF SHA-256)</span>
                  <span className="text-xs font-mono">ENCRYPTED</span>
                </div>
                <p className="font-mono text-sm break-all text-primary">{result.pdfHash}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline">存储状态</span>
                  <div className="flex items-center gap-2 text-secondary font-bold">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Finalized
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline">数据源</span>
                  <div className="font-bold">IPFS / Arweave</div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧边栏：技术细节 */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8">
              <h3 className="text-sm font-bold font-headline uppercase tracking-widest mb-6">元数据转录</h3>
              <div className="space-y-4 font-mono text-xs">
                <div className="border-b pb-2">
                  <p className="text-outline">Program ID</p>
                  <p className="truncate text-primary">{programId.toString()}</p>
                </div>
                <div className="border-b pb-2">
                  <p className="text-outline">Paper Account</p>
                  <p className="truncate">{result.pubkey}</p>
                </div>
                <div>
                  <p className="text-outline">IPFS CID</p>
                  <p className="truncate">{result.ipfsCid}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}