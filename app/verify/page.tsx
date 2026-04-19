"use client";

import React, { useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
// 1. 切换到新版官方包
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import idlRaw from '@/anchor/target/idl/descholarism.json';

// 将 IDL 转换为 any 以获得更好的兼容性支持
const idl = idlRaw as any;
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
    
    // 基础地址格式校验
    try {
      new web3.PublicKey(searchId);
    } catch (e) {
      setError("请输入有效的 Solana 账户地址 (Base58 格式)");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 2. 构造只读模式的 Provider (无需连钱包)
      // 在 @coral-xyz/anchor 中，这种 mock 方式依然有效
      const mockWallet = {
        publicKey: web3.Keypair.generate().publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };
      
      const provider = new AnchorProvider(connection, mockWallet as any, {
        preflightCommitment: 'processed'
      });

      // 3. 初始化 Program
      // @coral-xyz/anchor 能自动处理新版 IDL 的层级关系
      const program = new Program(idl, provider);
      
      const pubkey = new web3.PublicKey(searchId);
      
      // 4. 获取 Paper 账户数据
      // 注意：新版 Anchor 依然保持此语法，但内部解析逻辑更强
      const data = await (program.account as any).paper.fetch(pubkey);
      console.log("链上核验成功:", data);
      
      setResult({
        ...data,
        pubkey: searchId,
        slot: "Finalized", 
      });

    } catch (err: any) {
      console.error("核验失败详情:", err);
      // 精准捕获账户不存在的错误
      if (err.message?.includes("Account does not exist")) {
        setError("未找到该凭证：请检查地址是否为该论文的 PDA 地址。");
      } else {
        setError(`核验失败: ${err.message || "未知错误"}`);
      }
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
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="w-full bg-transparent border-none focus:ring-0 text-lg py-4" 
              placeholder="输入论文账户地址 (PDA Public Key)" 
            />
            <button 
              onClick={handleVerify}
              disabled={loading}
              className="bg-on-surface text-surface px-8 py-4 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? "核验中..." : "核验凭证"}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-4 ml-2 animate-pulse">{error}</p>}
        </div>
      </section>

      {/* 结果展示区 */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-10 border-b-2 border-primary/10 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mb-4">
                  <span className="material-symbols-outlined text-sm">verified</span> 链上存证有效
                </div>
                <h2 className="text-3xl font-headline font-bold">{result.title}</h2>
                <p className="text-outline mt-2 text-sm">
                  作者签名地址: <span className="font-mono text-primary select-all">{result.author?.toString()}</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="p-6 bg-surface-container-low rounded-lg border border-primary/5">
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-bold opacity-70 text-outline">IPFS 数据指纹 (CID)</span>
                  <span className="text-xs font-mono text-secondary">IMMUTABLE</span>
                </div>
                <p className="font-mono text-sm break-all text-primary select-all bg-white p-3 rounded border shadow-sm">
                  {result.ipfsHash}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 border-t pt-8">
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider">共识状态</span>
                  <div className="flex items-center gap-2 text-green-600 font-bold mt-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Finalized
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline tracking-wider">底层协议</span>
                  <div className="font-bold mt-1">Solana / IPFS</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section className="bg-surface-container-low rounded-xl p-8 border border-outline/10">
              <h3 className="text-sm font-bold font-headline uppercase tracking-widest mb-6 border-b pb-2">元数据存证</h3>
              <div className="space-y-5 font-mono text-[11px]">
                <div>
                  <p className="text-outline mb-1">Program ID</p>
                  <p className="truncate text-primary bg-primary/5 p-2 rounded">{programId.toString()}</p>
                </div>
                <div>
                  <p className="text-outline mb-1">Paper Account (PDA)</p>
                  <p className="truncate p-2 bg-black/5 rounded select-all">{result.pubkey}</p>
                </div>
                <div>
                  <p className="text-outline mb-1">Content Snippet</p>
                  <p className="line-clamp-4 bg-black/5 p-2 rounded leading-relaxed italic text-gray-600">
                    {result.metadata || "无描述内容"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}