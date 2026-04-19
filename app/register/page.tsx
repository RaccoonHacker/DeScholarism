"use client";

import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useRouter } from 'next/navigation';
import idlRaw from '@/anchor/target/idl/descholar.json';

export default function RegisterPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // 初始化 Anchor
  const idl = { ...idlRaw, version: "0.1.0", name: "descholar" } as any;
  const programId = new PublicKey("81yXP67oLaVK2bo3KGwk6zNFZiuCn5uss1DWaM8vshm6");

  // 检查是否已注册 (保持原逻辑，确保进入页面时状态正确)
  useEffect(() => {
    if (!publicKey) return;
    
    const checkStatus = async () => {
      try {
        const provider = new AnchorProvider(connection, wallet as any, {});
        const program = new Program(idl, provider);
        const [authorPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("author"), publicKey.toBuffer()],
          program.programId
        );

        const accountKeys = Object.keys(program.account);
        const profileKey = accountKeys.find(k => k.toLowerCase() === 'authorprofile');
        
        if (!profileKey) {
          setIsRegistered(false);
          return;
        }

        const accountClient = (program.account as any)[profileKey];
        await accountClient.fetch(authorPda);
        setIsRegistered(true);
      } catch (e: any) {
        setIsRegistered(false);
      }
    };
    checkStatus();
  }, [publicKey, connection]);

  // --- 核心修复：注册逻辑 ---
  const handleRegister = async () => {
    if (!publicKey || !name) return alert("请输入研究员姓名");
    
    setLoading(true);
    try {
      const provider = new AnchorProvider(connection, wallet as any, { preflightCommitment: 'processed' });
      const program = new Program(idl, provider);
      
      const [authorPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("author"), publicKey.toBuffer()],
        program.programId
      );

      // --- 核心优化 1：点击后立即再次查重 ---
      // 防止用户在已注册的情况下重复点击
      const existing = await connection.getAccountInfo(authorPda);
      if (existing) {
        alert("检测到您已注册，正在为您跳转...");
        setIsRegistered(true);
        router.push('/publish');
        return;
      }

      // --- 核心优化 2：跳过预检，发送交易 ---
      const tx = await program.methods
        .initializeAuthor(name)
        .accounts({
          authorProfile: authorPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc({
          skipPreflight: true, // 👈 关键：不进行本地模拟，直接让交易上链
          commitment: 'processed'
        });

      console.log("注册交易已发出:", tx);

      // --- 核心优化 3：WebSocket 监听 ---
      connection.onSignature(tx, (result) => {
        if (result.err) {
          console.error("注册确认失败:", result.err);
          // 如果是因为账户已存在，我们也视为成功
          if (JSON.stringify(result.err).includes("already in use") || JSON.stringify(result.err).includes("0x0")) {
            setIsRegistered(true);
            router.push('/publish');
          } else {
            alert("注册执行失败，请重试");
            setLoading(false);
          }
        } else {
          console.log("注册确认成功");
          setIsRegistered(true);
          alert("注册成功！现在您可以去发布论文了。");
          router.push('/publish');
        }
      }, 'processed');

    } catch (error: any) {
      console.error("注册请求失败", error);
      
      // 这里的 catch 捕获的是发送瞬间的错误
      if (error.message?.includes("already in use") || error.message?.includes("0x0")) {
        setIsRegistered(true);
        router.push('/publish');
      } else if (error.message?.includes("User rejected")) {
        alert("您取消了签名请求");
        setLoading(false);
      } else {
        alert(`注册失败: ${error.message}`);
        setLoading(false);
      }
    }
    // 注意：这里不再使用 finally { setLoading(false) } 
    // 因为成功的跳转或失败的状态恢复已经在 onSignature 和 catch 中精准处理了
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-outline-variant/10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-primary">fingerprint</span>
          </div>
          <h1 className="text-3xl font-bold font-headline text-on-surface">加入 DeScholarism </h1>
          <p className="text-on-surface-variant mt-2">创建您的去中心化学术档案</p>
        </div>

        {isRegistered ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100">
              您已完成研究员认证
            </div>
            <button 
              onClick={() => router.push('/publish')}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all"
            >
              前往发布论文
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-outline ml-1">学术署名</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: Raccoon Hacker"
                className="w-full px-5 py-4 bg-surface-container-low border-2 border-transparent focus:border-primary rounded-2xl outline-none transition-all"
              />
            </div>

            <button 
              onClick={handleRegister}
              disabled={loading || !publicKey}
              className="w-full py-5 bg-on-surface text-surface rounded-2xl font-bold text-lg hover:bg-on-surface-variant transition-all disabled:opacity-50"
            >
              {loading ? "正在链上存证..." : "完成初始化"}
            </button>
            
            {!publicKey && (
              <p className="text-center text-xs text-error font-medium">请先在导航栏连接钱包</p>
            )}
          </div>
        )}
        
        <p className="text-[10px] text-center text-outline mt-8 uppercase tracking-tighter">
          Powered by Solana Blockchain & IPFS
        </p>
      </div>
    </div>
  );
}