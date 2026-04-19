"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idlRaw from "@/anchor/target/idl/descholarism.json";

export default function PaperDetails() {
  const { id } = useParams(); // 这里的 id 其实就是 Paper 的 PDA 公钥字符串
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;

  const [paper, setPaper] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const idl = { ...idlRaw, version: "0.1.0", name: "descholar" } as any;

  async function loadAllData() {
    if (!id) return;
    try {
      const provider = new AnchorProvider(connection, wallet as any, {});
      const program = new Program(idl, provider);
      
      // 使用 (program.account as any) 绕过类型检查
      const accountNamespace = program.account as any;

      // 1. 获取论文详情
      // 注意：这里传入的 id 就是该账户的 PublicKey
      const paperData = await accountNamespace.paper.fetch(new PublicKey(id as string));
      setPaper(paperData);

      // 2. 获取评论列表
      const allComments = await accountNamespace.comment.all();
      
      const filtered = allComments
        .filter((c: any) => c.account.paper.toString() === id)
        .map((c: any) => c.account)
        .sort((a: any, b: any) => {
          const timeA = a.timestamp?.toNumber() || 0;
          const timeB = b.timestamp?.toNumber() || 0;
          return timeB - timeA;
        });

      setComments(filtered);
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, [id, connection, wallet]);

  const postComment = async () => {
    if (!publicKey || !commentText) return;
    setIsSubmitting(true);
    try {
      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: 'processed' });
      const program = new Program(idl, provider);
      const randomId = new BN(Math.floor(Math.random() * 1000000));
      
      const [commentPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("comment"),
          new PublicKey(id as string).toBuffer(),
          publicKey.toBuffer(),
          randomId.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      await program.methods
        .addComment(commentText, randomId)
        .accounts({
          comment: commentPda,
          paper: new PublicKey(id as string),
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();

      setCommentText("");
      await loadAllData();
      alert("评审已上链！");
    } catch (err: any) {
      console.error("评审失败:", err);
      alert("评论失败，请检查交易日志");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-headline animate-pulse">正在从 Solana 调取学术档案...</div>;
  if (!paper) return <div className="p-20 text-center font-headline">论文未找到</div>;

  return (
    <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 space-y-8">
        <section className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tighter font-headline leading-tight">{paper.title}</h1>
          <div className="flex items-center gap-4 py-4 border-b border-outline-variant/10">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {paper.author?.toString().slice(0, 1) || "?"}
            </div>
            <div>
              <p className="font-mono text-sm">{paper.author?.toString() || "Unknown Author"}</p>
              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest">链上认证作者</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 shadow-sm">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">研究内容 / 摘要</h2>
            <p className="text-lg leading-relaxed text-on-surface-variant font-light">{paper.metadata}</p>
          </div>
        </section>

        {/* 评审区域保持不变 */}
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
            disabled={isSubmitting}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "正在同步区块..." : "提交评审 (On-chain)"}
          </button>
        </section>

        <section className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface">全部评审 ({comments.length})</h2>
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="py-10 text-center border border-outline-variant/10 rounded-2xl bg-white/50">
                <p className="text-on-surface-variant italic text-sm">暂无评审意见，快来发表第一条见解</p>
              </div>
            ) : (
              comments.map((comment, index) => {
                const authorPubkey = comment.authority || comment.author || comment.reviewer;
                const authorStr = authorPubkey ? authorPubkey.toString() : "Unknown";
                return (
                  <div key={index} className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm transition-all hover:border-primary/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-mono bg-surface-container-highest px-3 py-1 rounded-full text-primary font-bold">
                        ID: {authorStr.slice(0, 4)}...{authorStr.slice(-4)}
                      </span>
                      {comment.timestamp && (
                         <span className="text-[10px] text-outline">
                           {new Date(comment.timestamp.toNumber() * 1000).toLocaleDateString()}
                         </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">
                      {comment.content || comment.comment || "No content provided."}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <aside className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm sticky top-24">
          <button
            onClick={() => {
              const url = `https://gateway.pinata.cloud/ipfs/${paper.ipfsHash}`;
              window.open(url, '_blank');
            }}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 mb-6 hover:shadow-lg transition-all"
          >
            <span className="material-symbols-outlined">description</span> 
            查看全文 (IPFS)
          </button>
          
          <div className="space-y-6">
            <div>
              <div className="text-[10px] text-outline font-bold uppercase mb-1">数据指纹 (IPFS CID)</div>
              <div className="bg-surface p-3 rounded-lg font-mono text-[10px] break-all border border-outline-variant/5">
                {paper.ipfsHash}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-outline font-bold uppercase mb-1">上链时间</div>
              <div className="text-sm font-medium">
                {paper.timestamp ? new Date(paper.timestamp.toNumber() * 1000).toLocaleString() : "未知"}
              </div>
            </div>

            {/* 修改后的 PDA 展示区 */}
            <div className="pt-4 border-t border-outline-variant/10">
              <div className="text-[10px] text-primary font-bold uppercase mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">key</span>
                论文账户地址 (PDA)
              </div>
              <div className="flex items-center gap-2">
                <code className="text-[11px] bg-surface-container-high p-2 rounded flex-1 break-all font-mono border border-outline/10 text-primary">
                  {id} 
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(id as string);
                    alert("PDA 地址已复制");
                  }}
                  className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                  title="复制地址"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                </button>
              </div>
              <p className="text-[9px] text-outline mt-2 italic leading-tight">
                * 此地址为该论文在 Solana 上的唯一确权标识，可用于官方核验。
              </p>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}