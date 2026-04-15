"use client"; // 必须是客户端组件以支持钱包和文件操作

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { calculateFileHash } from '../lib/crypto'; // 待实现的工具函数
import idl from '@/anchor/target/idl/descholar.json';

const programId = new web3.PublicKey("81yXP67oLaVK2bo3KGwk6zNFZiuCn5uss1DWaM8vshm6");

export default function PublishPage() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  // 1. 状态管理
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'hashing' | 'uploading' | 'signing' | 'success'>('idle');
  const [txId, setTxId] = useState("");

  // 2. 核心提交逻辑
  const handlePublish = async () => {
    if (!publicKey || !file) return alert("请连接钱包并上传文件");
    
    try {
      // 步骤 A: 计算 PDF 哈希 (确权关键)
      setStatus('hashing');
      const fileHash = await calculateFileHash(file);
      
      // 步骤 B: 上传到 IPFS (这里建议调用你后端的 API 或 Pinata)
      setStatus('uploading');
      const ipfsCid = "Qm...假装是返回的CID"; 

      // 步骤 C: 调用 Solana 合约
      setStatus('signing');
      const provider = new AnchorProvider(connection, (window as any).solana, {});
      const program = new Program(idl as any, programId, provider);
      
      // 为新论文创建一个随机的 Keypair
      const paperKeypair = web3.Keypair.generate();

      const tx = await program.methods
        .publishPaper(title, content, fileHash, ipfsCid, "Research")
        .accounts({
          paper: paperKeypair.publicKey,
          author: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([paperKeypair])
        .rpc();

      setTxId(tx);
      setStatus('success');
    } catch (error) {
      console.error("发布失败", error);
      setStatus('idle');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏可以抽离成 Sidebar 组件 */}
      <main className="flex-1 lg:ml-64 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-extrabold font-headline">发布研究论文</h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-10">
              {/* 标题输入 */}
              <div className="group">
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">论文标题</label>
                <input 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant/30 py-3 text-xl focus:border-primary focus:ring-0" 
                  placeholder="输入研究名称" 
                />
              </div>

              {/* 摘要输入 */}
              <div className="group">
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-2">摘要</label>
                <textarea 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant/30 py-3 text-base focus:border-primary focus:ring-0 resize-none" 
                  rows={5} 
                />
              </div>

              {/* 文件上传区 - 增加文件选择逻辑 */}
              <div 
                onClick={() => document.getElementById('fileInput')?.click()}
                className="bg-surface-container-low rounded-xl p-8 border-2 border-dashed border-outline-variant/20 hover:border-primary/50 text-center cursor-pointer"
              >
                <input 
                  type="file" id="fileInput" hidden 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                />
                <span className="material-symbols-outlined text-5xl mb-4">cloud_upload</span>
                <p>{file ? `已选择: ${file.name}` : "点击或拖拽上传 PDF"}</p>
              </div>

              {/* 提交按钮 */}
              <button 
                onClick={handlePublish}
                disabled={status !== 'idle'}
                className="w-full px-10 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg font-bold shadow-xl disabled:opacity-50"
              >
                {status === 'idle' ? "提交并签署" : `${status}...`}
              </button>
            </div>

            {/* 右侧反馈栏 - 根据状态动态显示 */}
            <div className="lg:col-span-4">
              {status === 'success' && (
                <div className="bg-surface-container-lowest rounded-xl p-6 border border-secondary/20 shadow-lg animate-in fade-in duration-500">
                   <div className="flex items-center gap-3 mb-4 text-secondary">
                     <span className="material-symbols-outlined">verified</span>
                     <h4 className="font-bold">发布成功</h4>
                   </div>
                   <p className="text-xs text-on-surface-variant break-all">交易哈希: {txId}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}