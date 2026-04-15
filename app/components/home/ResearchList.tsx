"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Mock 数据，实际开发中从 program.account.paper.all() 获取
const MOCK_PAPERS = [
  { id: '1', title: '基于去中心化边缘计算协议的神经突触映射', author: '陈立群 博士', tags: ['神经科学', '已评审'] },
  { id: '2', title: '量子纠缠在常温超导中的应用研究', author: 'Dr. Aris Thorne', tags: ['物理学', '验证中'] },
];

export default function ResearchList() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold font-headline mb-8">最新研究</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_PAPERS.map(paper => (
          <Link key={paper.id} href={`/paper/${paper.id}`}>
            <div className="bg-white p-8 rounded-2xl border border-outline-variant/10 hover:shadow-xl transition-all cursor-pointer group">
              <div className="flex gap-2 mb-4">
                {paper.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-1 bg-primary/5 text-primary rounded uppercase">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{paper.title}</h3>
              <p className="mt-4 text-on-surface-variant font-medium">{paper.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}