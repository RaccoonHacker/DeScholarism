# DeScholarism: 去中心化学术版权保护与托管平台

> **Solana Frontier Hackathon (Colosseum)** > **Track:** Identity & Privacy  
> **Tag:** DeSci, Intellectual Property, Proof of Provenance

---

## 🌟 项目愿景 (Vision)
在传统学术领域，论文的知识产权保护往往依赖于中心化的期刊或预印本平台，存在审核周期长、所有权界定模糊以及潜在的剽窃风险。**DeScholar** 利用 Solana 的高性能区块链技术与 IPFS 分布式存储，为全球研究者提供一个去中心化的科学（DeSci）基础设施。

我们的核心卖点是：**“上传即确权”**。通过将论文内容的哈希值永久锚定在 Solana 链上，为每一篇学术成果提供不可篡改的“出生证明”。

---

## 🛠 技术栈 (Tech Stack)

| 层级 | 技术选型 |
| :--- | :--- |
| **前端 (Frontend)** | React, Next.js, TypeScript, Tailwind CSS |
| **智能合约 (Smart Contract)** | Anchor Framework (Rust) |
| **链交互 (Blockchain SDK)** | `@solana/web3.js`, `@coral-xyz/anchor` |
| **身份认证 (Identity)** | Solana Wallet Adapter (Phantom, Solflare) |
| **分布式存储 (Storage)** | IPFS (Managed via Pinata API) |
| **部署网络 (Network)** | Solana Devnet |

---

## 🚀 MVP 核心功能 (Core Features)

1.  **身份认证 (Wallet Login)**: 支持 Phantom, Solflare 等主流 Solana 钱包登录，建立基于钱包地址的去中心化作者身份。
2.  **内容发布 (Upload & Metadata)**: 作者上传 PDF 论文并填写标题、摘要等元数据。
3.  **链上存证 (On-chain Hash)**: 提取论文文件哈希（CID），通过 Anchor 合约将哈希、作者信息及时间戳存入 Solana PDA（程序派生地址）。
4.  **学术探索 (Discovery)**: 提供公开的论文检索门户，支持按标题或作者搜索。
5.  **开放评论 (Open Review)**: 基于 Web3 的开放式评价系统，鼓励社区同行评审。
6.  **学术档案 (Author Profile)**: 展示作者名下的所有存证作品，包含版权存证卡片。
7.  **权威核验 (Verification)**: 任何第三方只需输入账户地址 (PDA)，系统即可比对链上哈希，秒速验证该论文的真实性与原始发布时间。

---

## 🏗 架构说明 (Architecture)

* **存储层 (IPFS)**: 论文原文通过 Pinata 接口上传至 IPFS，确保内容的去中心化与持久性。系统仅在链上存储 CID（Content Identifier），实现轻量化确权。
* **合约层 (Solana)**: 使用 Anchor 框架开发的智能合约，存储 `Owner`, `IPFS_Hash`, `Timestamp` 等核心元数据。
* **应用层 (Next.js)**: 前端负责 PDF 处理、通过 API 路由安全调用存储服务、以及与 Solana 链端的 RPC 通信。

---

## 📂 数据存储流程 (Data Storage Flow)

为了确保学术档案的永久性与可追溯性，DeScholar 采用了 **“链下存储，链上锚定”** 的双层结构：

1.  **加密上传**: 论文文件通过加密通道发送至 Pinata (IPFS Node)，并附加作者钱包地址作为元数据标签。
2.  **生成指纹 (CID)**: IPFS 根据文件内容生成唯一的 Content Identifier (v1)。由于 CID 基于内容生成，任何对论文的细微篡改都会导致 CID 发生剧变。
3.  **链上共识**: 前端触发 Solana 交易，将该 CID 写入对应的 Program Derived Address (PDA)。
4.  **持久化托管**: 通过 Pinata 的持久化存储协议，确保 IPFS 节点在全网范围内对该论文进行 Pinning，防止数据过期丢弃。

---

## 🛡 身份与隐私保护 (Identity & Privacy Focus)
通过利用 Solana 的时间戳机制，DeScholarism 确保了作者对研究成果的“优先发现权”具有数学上的不可篡改性。同时，通过去中心化身份（Wallet-as-ID），研究者可以摆脱对特定学术机构账号的依赖，真正实现学术成果的自主所有权。

---

## 📦 快速开始 (Quick Start)

### 前提条件
* **Node.js**: `v18+`
* **Solana CLI**: 最新稳定版
* **Anchor Framework**: `v0.30.0+`
* **浏览器插件**: 安装了 Phantom 或 Solflare 钱包，并切换至 **Devnet**

### 环境配置
在项目根目录创建 `.env` 文件并配置：
```env
NEXT_PUBLIC_PINATA_JWT=你的Pinata_JWT令牌
```

### 本地开发步骤

1.  **克隆仓库**
    ```bash
    git clone https://github.com/RaccoonHacker/DeScholarism.git
    cd descholarism
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **编译并部署合约**
    ```bash
    cd anchor
    anchor build
    anchor deploy --provider.cluster devnet
    ```

4.  **启动前端应用**
    ```bash
    cd ..
    npm run dev
    ```




![home](/image.png)