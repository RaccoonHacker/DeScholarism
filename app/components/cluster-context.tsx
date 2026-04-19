"use client";

import { createContext, useContext, ReactNode, useState, useMemo } from "react";
import { type Address } from "@solana/kit";

// 定义支持的网络类型
export type Cluster = "mainnet-beta" | "testnet" | "devnet" | "localnet";

export interface ClusterContextType {
  cluster: Cluster;
  setCluster: (cluster: Cluster) => void;
  getClusterUrl: (cluster: Cluster) => string;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

// 辅助函数：根据集群获取 RPC URL
export function getClusterUrl(cluster: Cluster): string {
  switch (cluster) {
    case "mainnet-beta":
      return "https://api.mainnet-beta.solana.com";
    case "testnet":
      return "https://api.testnet.solana.com";
    case "devnet":
      return "https://api.devnet.solana.com";
    case "localnet":
      return "http://127.0.0.1:8899";
    default:
      return "https://api.devnet.solana.com";
  }
}

// 辅助函数：获取 WebSocket 配置（通常用于新版 Kit）
export function getClusterWsConfig(cluster: Cluster): string {
  switch (cluster) {
    case "mainnet-beta":
      return "wss://api.mainnet-beta.solana.com";
    case "testnet":
      return "wss://api.testnet.solana.com";
    case "devnet":
      return "wss://api.devnet.solana.com";
    case "localnet":
      return "ws://127.0.0.1:8900";
    default:
      return "wss://api.devnet.solana.com";
  }
}

export function ClusterProvider({ children }: { children: ReactNode }) {
  // 默认设置为 devnet，你可以根据需要改为 localnet
  const [cluster, setCluster] = useState<Cluster>("devnet");

  const value = useMemo(
    () => ({
      cluster,
      setCluster,
      getClusterUrl,
    }),
    [cluster]
  );

  return (
    <ClusterContext.Provider value={value}>
      {children}
    </ClusterContext.Provider>
  );
}

// 导出 Hook 供其他组件使用
export function useCluster() {
  const context = useContext(ClusterContext);
  if (!context) {
    // 兜底：如果没在 Provider 内部，返回默认值，防止页面白屏报错
    return {
      cluster: "devnet" as Cluster,
      setCluster: () => {},
      getClusterUrl,
    };
  }
  return context;
}