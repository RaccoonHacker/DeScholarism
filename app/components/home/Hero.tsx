import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-6 py-12">
      {/* 核心卡片容器 */}
      <div className="relative w-full max-w-7xl mx-auto min-h-[500px] flex flex-col items-center justify-center overflow-hidden rounded-[40px] bg-[#0b0e14] text-white shadow-2xl">
        
        {/* 背景图片与遮罩 */}
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-40" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpuLuD237067Ne0AZtw9x1PFtZMFZNtA2_tRdaJP5oDg4PaSH99Nt_p-nSOFTmFgDPHUEMAp-4Hd4UGmmbmYIj53BmBwtrRJ7bBXOKCTqMnJmtx6XeuKmRmw6efbTwATh_xrDA21s7h2ym7j3X8111SIJFHFzsdGJ9TXmMuQB00jxkvN0E_dq3Q18wEKebnfWQpa4E46NH2ixCY_H6a-cfv_IZOnMCkAZH6iQW-27yW10xdcZliRuU9MX59NXrNSsSqc-pLvn0M9qd" 
            alt="Deep space nebula"
          />
          {/* 径向渐变，让中心文字更清晰，边缘更深邃 */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0b0e14]/40 to-[#0b0e14]"></div>
        </div>

        {/* 内容区域 */}
        <div className="relative z-10 px-8 py-20 text-center space-y-10 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter leading-[1.1]">
            科学 在区块链上&nbsp;
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              永久共鸣
            </span>
          </h1>

          <p className="text-5xl md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            DeScholarism 是下一代去中心化科学出版协议。在这里，每一篇论文都是不可篡改的链上资产，每一条评审都是透明的学术贡献。
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            <Link href="/explore">
              <button className="relative group px-10 py-4 bg-primary text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                {/* 模拟图片中的紫色光晕感 */}
                <div className="absolute inset-0 rounded-xl bg-purple-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <span className="relative">开始探索</span>
              </button>
            </Link>

            <Link href="/register">
              <button className="px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all active:scale-95">
                成为研究者
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}