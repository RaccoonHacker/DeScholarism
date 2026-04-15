"use client";

import React from 'react';
import Link from 'next/link';

// 1. 严格匹配你从 Solana 链上拿到的数据结构
interface PaperCardProps {
  paper: {
    pubkey: string;   // 链上地址
    title: string;    // 标题
    metadata: string; // 之前代码里的 abstract
    author: any;      // PublicKey 对象
    timestamp: any;   // BN 对象
    ipfsHash: string; // IPFS 哈希
  };
  isLarge?: boolean;
}

export default function PaperCard({ paper, isLarge }: PaperCardProps) {
  // 转换时间戳 (BN -> Date)
  const formattedDate = paper.timestamp 
    ? new Date(paper.timestamp.toNumber() * 1000).toLocaleDateString() 
    : '刚刚上链';

  return (
    <Link href={`/paper/${paper.pubkey}`} className={isLarge ? 'md:col-span-2' : ''}>
      <article className={`h-full bg-white p-8 rounded-xl group cursor-pointer border-l-4 border-transparent hover:border-primary transition-all shadow-sm hover:shadow-md`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
              Solana On-Chain
            </span>
            {/* 你也可以根据逻辑加标签，目前先放一个通用的 */}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-on-secondary-container uppercase tracking-wider">
              Verified
            </span>
          </div>
          <span className="text-xs text-outline font-mono opacity-60">{formattedDate}</span>
        </div>
        
        <h3 className={`${isLarge ? 'text-2xl' : 'text-xl'} font-bold mb-4 group-hover:text-primary transition-colors font-headline text-on-surface`}>
          {paper.title}
        </h3>
        
        <p className="text-on-surface-variant mb-6 line-clamp-2 font-light text-sm leading-relaxed">
          {paper.metadata /* 对应 IDL 里的 metadata 字段 */}
        </p>
        
        <div className="flex items-center justify-between pt-6 border-t border-outline-variant/15">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px] text-primary">person</span>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">
              {paper.author.toString().slice(0, 4)}...{paper.author.toString().slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-primary font-bold text-xs uppercase tracking-tighter">
            核验详情
            <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
          </div>
        </div>
        
        {/* 底部显示微型哈希，增加极客感 */}
        <div className="mt-4 pt-4 border-t border-dashed border-outline-variant/10 text-[9px] font-mono text-outline/40 truncate">
          CID: {paper.ipfsHash}
        </div>
      </article>
    </Link>
  );
}