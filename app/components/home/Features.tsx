import React from 'react';

export default function Features() {
  const features = [
    {
      title: '核验协议',
      icon: 'policy',
      desc: '了解 SolSci 如何通过区块链技术确保学术成果的去中心化存储与可验证性。'
    },
    {
      title: '版本历史',
      icon: 'history',
      desc: '追踪研究成果的所有迭代版本，每一个更改都在链上留有永久记录。'
    },
    {
      title: '多节点核验',
      icon: 'shield_check',
      desc: '由全球去中心化研究节点协同完成的证据确认，消除单点失效风险。'
    }
  ];

  return (
    <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
      {features.map((f) => (
        <div key={f.title} className="p-8 border-l-2 border-surface-container-high hover:border-primary transition-colors group">
          <span className="material-symbols-outlined text-primary mb-4 block text-3xl" data-icon={f.icon}>{f.icon}</span>
          <h4 className="font-headline font-bold mb-3 text-on-surface">
            {f.title}
          </h4>
          <p className="text-sm text-on-surface-variant leading-relaxed font-light">
            {f.desc}
          </p>
        </div>
      ))}
    </section>
  );
}