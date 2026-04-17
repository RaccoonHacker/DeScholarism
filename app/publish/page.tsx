"use client";

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import idlRaw from '@/anchor/target/idl/descholar.json';
import axios from 'axios';

// 工具函数：计算文件哈希（如果还没写，可以用这个简单的实现）
async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function PublishPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'hashing' | 'uploading' | 'signing' | 'success'>('idle');
  const [txId, setTxId] = useState("");

  const handlePublish = async () => {
    // 1. 基础校验 (连接状态)
    if (!publicKey || !file) {
      alert("请先连接钱包并选择要上传的论文文件");
      return;
    }

    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!jwt) {
      alert("配置错误：未检测到 Pinata JWT，请检查 .env 文件并重启服务");
      return;
    }

    try {
      // --- 新增：研究者身份预检 (拦截未注册用户) ---
      // 提前初始化 program 进行身份检查
      const idl = { ...idlRaw, version: "0.1.0", name: "descholar" } as any;
      const provider = new AnchorProvider(connection, wallet as any, { 
        preflightCommitment: 'processed' 
      });
      const program = new Program(idl, provider);

      // 计算作者 PDA
      const [authorProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("author"), publicKey.toBuffer()],
        program.programId
      );

      // 检查链上是否存在该账户
      const authorAccount = await connection.getAccountInfo(authorProfilePda);
      if (!authorAccount) {
        alert("⚠️ 您尚未注册研究者身份：请先前往首页注册成为研究者，完成后即可发表论文。");
        // 如果使用了 next/navigation 的 router，可以取消注释下面这行自动跳转
        // router.push('/'); 
        return;
      }

      // 步骤 A: 上传文件到 IPFS (Pinata)
      setStatus('uploading');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const pinataMetadata = JSON.stringify({
        name: title,
        keyvalues: {
          author: publicKey.toString(),
          type: 'academic-paper'
        }
      });
      formData.append('pinataMetadata', pinataMetadata);

      const pinataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS", 
        formData, 
        {
          headers: {
            'Content-Type': `multipart/form-data`,
            'Authorization': `Bearer ${jwt}` 
          }
        }
      );

      const realCid = pinataRes.data.IpfsHash; 
      console.log("IPFS 存储成功，CID:", realCid);

      // 步骤 B: 准备 Solana 交易
      setStatus('signing');
      
      // --- 计算 Paper PDA ---
      const [paperPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("paper"),
          publicKey.toBuffer(),
          Buffer.from(realCid).slice(0, 31)
        ],
        program.programId
      );

      // 🌟 DEBUG 日志 (保持不变)
      console.log("--- DEBUG START ---");
      console.log("1. 本次接口返回 CID:", realCid);
      console.log("2. 截断种子(Hex):", Buffer.from(realCid).slice(0, 31).toString('hex'));
      console.log("3. 最终计算出的 PDA:", paperPda.toBase58());
      console.log("--- DEBUG END ---");

      // --- 核心优化 1：发布前主动查重 ---
      const accountInfo = await connection.getAccountInfo(paperPda);
      if (accountInfo) {
        setStatus('success');
        alert("检测到该论文已在链上发布成功！");
        return;
      }

      // --- 核心优化 2：WebSocket 监听 & 绕过模拟 ---
      const tx = await program.methods
        .publishPaper(
          title || "Untitled", 
          realCid, 
          content || ""
        )
        .accounts({
          paper: paperPda,
          authorProfile: authorProfilePda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc({
          skipPreflight: true, // 防止重复模拟报错
          commitment: 'processed'
        });

      console.log("交易签名已发出:", tx);
      setTxId(tx);

      // 2. 建立 WebSocket 监听，实时捕捉成功信号
      connection.onSignature(tx, (result) => {
        if (result.err) {
          console.error("链上确认失败:", result.err);
          if (JSON.stringify(result.err).includes("already processed")) {
            setStatus('success');
          } else {
            setStatus('idle'); // 失败则重置按钮
            alert("交易执行失败，请检查账户状态");
          }
        } else {
          console.log("WebSocket 收到确认：交易成功！");
          setStatus('success'); // 成功则停止按钮转圈
          alert("恭喜！论文已成功存证并发布至 Solana 与 IPFS。");
        }
      }, 'processed');

    } catch (error: any) {
      console.error("发布全流程失败:", error);
      
      let errorMsg = error.message;
      if (error.response?.data?.error) {
        errorMsg = `IPFS上传错误: ${error.response.data.error}`;
      } else if (error.message?.includes("already in use") || error.message?.includes("0x0")) {
        setStatus('success');
        return alert("该论文已在链上发布成功！");
      }
      
      alert(`发布失败: ${errorMsg}`);
      setStatus('idle'); // 发生错误重置按钮
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <main className="flex-1 p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">发布研究论文</h1>
            <p className="text-on-surface-variant mt-2 font-light">将你的学术成果永久存证于 Solana 节点</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-10">
              {/* 标题 */}
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-3">论文标题</label>
                <input 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 py-3 text-2xl focus:border-primary focus:ring-0 transition-colors" 
                  placeholder="例如: 基于 Solana 的去中心化引文系统研究" 
                />
              </div>

              {/* 摘要 */}
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-3">研究摘要</label>
                <textarea 
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-transparent border-0 border-b-2 border-outline-variant/30 py-3 text-lg focus:border-primary focus:ring-0 resize-none font-light" 
                  rows={4} 
                  placeholder="简述您的研究贡献..."
                />
              </div>

              {/* 文件上传 */}
              <div 
                onClick={() => document.getElementById('fileInput')?.click()}
                className="bg-white rounded-2xl p-10 border-2 border-dashed border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5 transition-all text-center cursor-pointer group"
              >
                <input 
                  type="file" id="fileInput" hidden accept=".pdf,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                />
                <span className="material-symbols-outlined text-5xl mb-4 text-outline group-hover:text-primary transition-colors">
                  upload_file
                </span>
                <p className="text-on-surface-variant font-medium">
                  {file ? <span className="text-primary">已准备: {file.name}</span> : "点击选择 PDF 或 Word 文档"}
                </p>
                <p className="text-[10px] text-outline mt-2 uppercase">支持最大 50MB 的学术文档</p>
              </div>

              {/* 提交按钮 */}
              <button 
  onClick={handlePublish}
  // 只有在 idle 状态下才允许点击
  disabled={status !== 'idle' || !publicKey}
  className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
>
  {status === 'idle' ? (
    "提交并签署合约"
  ) : status === 'success' ? (
    "✅ 发布成功" 
  ) : (
    <span className="flex items-center justify-center gap-3">
      <span className="animate-spin text-xl">⏳</span>
      正在{
        status === 'hashing' ? '计算哈希' : 
        status === 'uploading' ? '上传云端' : 
        status === 'signing' ? '请求签名' : '确认交易'
      }...
    </span>
  )}
</button>
            </div>

            {/* 右侧反馈 */}
            <div className="lg:col-span-4">
              {status === 'success' && (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200 shadow-sm sticky top-8 animate-in slide-in-from-right-4 duration-500">
                   <div className="flex items-center gap-3 mb-4 text-green-700">
                     <span className="material-symbols-outlined font-bold">check_circle</span>
                     <h4 className="font-bold">上链成功</h4>
                   </div>
                   <p className="text-xs text-green-600/80 mb-4 font-light leading-relaxed">您的论文已成功在 Solana Devnet 完成存证，元数据已锚定。</p>
                   <a 
                    href={`https://explorer.solana.com/tx/${txId}?cluster=devnet`} 
                    target="_blank" 
                    className="text-[10px] font-mono text-green-700 underline break-all block hover:opacity-70"
                   >
                     TX: {txId}
                   </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}