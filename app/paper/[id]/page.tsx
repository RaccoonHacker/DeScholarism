"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor'; // 建议用新包
import { PublicKey } from '@solana/web3.js';
import idlRaw from '@/anchor/target/idl/descholar.json';

export default function PaperDetails() {
  const { id } = useParams();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  
  const [paper, setPaper] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const idl = { ...idlRaw, version: "0.1.0", name: "descholar" } as any;
        const provider = new AnchorProvider(connection, wallet as any, {});
        const program = new Program(idl, provider);
        
        // 注意：IDL 里是大写 Paper
        const data = await (program.account as any).Paper.fetch(new PublicKey(id as string));
        setPaper(data);
      } catch (err) {
        console.error("加载论文失败:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, connection, wallet]);

  const postComment = async () => {
    if (!publicKey || !commentText) return;
    try {
      const idl = { ...idlRaw, version: "0.1.0", name: "descholar" } as any;
      const provider = new AnchorProvider(connection, wallet as any, {});
      const program = new Program(idl, provider);

      // 这里的调用名必须匹配 IDL 里的 instructions 名 (add_comment)
      await program.methods
        .addComment(commentText, new (require('@project-serum/anchor').BN)(Math.floor(Math.random() * 1000000))) 
        .accounts({
          paper: new PublicKey(id as string),
          authority: publicKey,
        })
        .rpc();
      
      alert("评审已上链！");
      setCommentText("");
    } catch (err) {
      console.error("评审失败:", err);
    }
  };

  if (loading) return <div className="p-20 text-center font-headline animate-pulse">正在从 Solana 调取学术档案...</div>;
  if (!paper) return <div className="p-20 text-center font-headline">论文未找到</div>;

  return (
    <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* 左侧：论文主体 */}
      <div className="lg:col-span-8 space-y-8">
        <section className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tighter font-headline leading-tight">
            {paper.title}
          </h1>
          <div className="flex items-center gap-4 py-4 border-b border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {paper.author.toString().slice(0, 1)}
            </div>
            <div>
              <p className="font-mono text-sm">{paper.author.toString()}</p>
              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">链上认证作者</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">研究内容 / 摘要</h2>
            <p className="text-lg leading-relaxed text-on-surface-variant font-light">
              {paper.metadata /* 根据你的 IDL 字段名为 metadata */}
            </p>
          </div>
        </section>

        {/* 评审输入 */}
        <section className="bg-surface p-6 rounded-2xl border border-dashed border-outline-variant/30">
          <h2 className="text-xl font-bold font-headline mb-4">同行评审</h2>
          <textarea 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="撰写您的学术评审意见..."
            className="w-full bg-white border border-outline-variant/20 rounded-xl p-4 focus:border-primary outline-none transition-all mb-4"
            rows={4}
          />
          <button 
            onClick={postComment}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            提交评审 (On-chain)
          </button>
        </section>
      </div>

      {/* 右侧：侧边栏 */}
      <aside className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm sticky top-24">
          <a 
            href={`https://ipfs.io/ipfs/${paper.ipfsHash}`} 
            target="_blank"
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 mb-6 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">visibility</span> 查看全文 (IPFS)
          </a>
          <div className="space-y-4">
            <div>
              <div className="text-[10px] text-outline font-bold uppercase mb-1">数据指纹 (IPFS CID)</div>
              <div className="bg-surface p-3 rounded-lg font-mono text-[10px] break-all border border-outline-variant/5">
                {paper.ipfsHash}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-outline font-bold uppercase mb-1">上链时间</div>
              <div className="text-sm font-medium">
                {new Date(paper.timestamp.toNumber() * 1000).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}