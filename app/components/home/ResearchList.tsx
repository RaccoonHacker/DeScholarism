"use client";
import React from "react";
import Link from "next/link";

// 替换后的 Mock 数据
const MOCK_PAPERS = [
  {
    id: "zkp-clinical-data",
    title: "基于零知识证明的临床数据隐私保护协议",
    author: "Lin Chen, Karsten Müller",
    tags: ["已验证", "开源"],
    summary:
      "本文提出了一种新型框架，允许医疗机构在不泄露患者个人信息的前提下，向去中心化网络贡献匿名化数据集进行联合分析。",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCXCHAXX2g7LL0qk7W0EKU0C7f2NAEKG0CjbTPm1F5XJaxtBTggKtTsml41AIGrVBBrGXEIOIrVCqOxkrc-wc5EuCNjPgu3AbBA-CHneCpdJPXgp0SeSIgm9tUvVmAi-8e1lnT0ZYlJBXZ0KQ2MQ4x22pL3edWKhJvy6nZnovRuYQ8KK3ojnkCYlkZDOd6HhuDaKs44WuU_xlooBqNLwwm6uKRxO-5s8XOk7dw-tAcNE2eoFRjw2CAte0Ey5O5BEyE2p7zgSEdLSod4", // 实验室蓝色激光感的图
  },
  {
    id: "himalaya-tectonics",
    title: "泛喜马拉雅地区板块运动的实时链上监测模型",
    author: "GeoChain Lab Alpha",
    tags: ["已验证", "地质学"],
    summary:
      "利用全球分布式传感器网络，将地壳变动数据直接预言机化，为地震预警提供了一种不可篡改的公共数据源。",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBF6GPGLEgUab_rp4VGCvOfMg8wuxzJNsC1coglhm3UJML_P36FRvJcEGpFaTK-FtlpzwwobQqpzkGSpAD9cxiDvrDBZSKt94SIPl0WoMisTFi-dJjrPvgJxAB5jTWb7Lmb1wBNlw4OKpVlIhwb1LzvyovbGPjFojiHwW8AjtRDCxMXzxng7OTIsVjEOZlMzFpBAnPyo-J4uhkJZ9q9Mvp1mGp7ZLi9y-YeiLZbo_GWvFf3oAnvVWeuVY3EGCE8A7jgL_8FV1T7y2Uy", // 高海拔山脉地质感的图
  },
];

export default function ResearchList() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="mb-16">
        {/* 第一行：标题 + 横线 */}
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-bold font-headline tracking-tighter shrink-0">
            最新研究成果
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent"></div>
        </div>

        {/* 第二行：描述文本 */}
        <p className="text-on-surface-variant mt-3 text-sm tracking-wide">
          由 DeScholarism  协议验证的同行评审文献
        </p>
      </div>

      <div className="space-y-32">
        {MOCK_PAPERS.map((paper, index) => (
          <Link key={paper.id} href={`/explore`}>
            <article
              className={`
              flex flex-col md:flex-row gap-16 items-center group cursor-pointer
              ${index % 2 === 1 ? "md:flex-row-reverse" : ""}
            `}
            >
              {/* 图片区域：增加灰度到彩色的平滑过渡 */}
              <div className="w-full md:w-1/2 overflow-hidden rounded-2xl bg-surface-container-low aspect-[4/3] shadow-xl">
                <img
                  src={paper.imageUrl}
                  alt={paper.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
                />
              </div>

              {/* 文字内容区域 */}
              <div
                className={`w-full md:w-1/2 space-y-6 ${index % 2 === 1 ? "md:text-right md:items-end flex flex-col" : ""}`}
              >
                <div
                  className={`flex gap-3 ${index % 2 === 1 ? "justify-end" : ""}`}
                >
                  {paper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold tracking-widest px-3 py-1 bg-primary/10 text-primary rounded-md uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h3 className="text-3xl lg:text-4xl font-bold font-headline leading-tight group-hover:text-primary transition-colors">
                  {paper.title}
                </h3>

                <p className="text-on-surface-variant text-lg font-light leading-relaxed">
                  {paper.summary}
                </p>

                <div
                  className={`flex items-center gap-4 pt-4 ${index % 2 === 1 ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-12 h-[1px] bg-primary"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-outline font-bold uppercase tracking-wider">
                      主要贡献者
                    </span>
                    <span className="text-sm font-semibold uppercase">
                      {paper.author}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="mt-28 text-center">
        <Link
          href="/explore"
          className="inline-flex items-center gap-3 text-sm font-bold text-outline hover:text-primary transition-all hover:gap-5"
        >
          <span>探索完整去中心化学术归档</span>
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </Link>
      </div>
    </section>
  );
}
