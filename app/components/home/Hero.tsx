export default function Hero() {
  return (
    <section className="py-20 text-center space-y-8">
      <h1 className="text-7xl font-bold font-headline tracking-tighter max-w-4xl mx-auto leading-tight">
        科学，在区块链上 <span className="text-primary">永久共鸣</span>
      </h1>
      <p className="text-on-surface-variant text-xl max-w-2xl mx-auto font-light">
        SolSci 是下一代去中心化科学出版协议。在这里，每一篇论文都是不可篡改的链上资产，每一条评审都是透明的学术贡献。
      </p>
      <div className="flex justify-center gap-4 pt-4">
        <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all">
          开始探索
        </button>
        <button className="bg-surface-container-high px-8 py-4 rounded-xl font-bold">
          了解协议
        </button>
      </div>
    </section>
  );
}