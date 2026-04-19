"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { type Address, type Lamports } from "@solana/kit";
// ❌ 已删除对 cluster-context 的导入
import { useSolanaClient } from "../solana-client-context";

export function useBalance(address?: Address) {
  // 移除了 useCluster()，直接使用 client
  const client = useSolanaClient();

  const { data, isLoading, error, mutate } = useSWR(
    // 移除了 key 中的 cluster，改为常量 "mainnet" 或其他固定标识，以保持 SWR 键的一致性
    address ? (["balance", "default", address] as const) : null,
    async ([, , addr]) => {
      const { value } = await client.rpc.getBalance(addr).send();
      return value;
    },
    { refreshInterval: 60_000, revalidateOnFocus: true }
  );

  useEffect(() => {
    if (!address) return;

    const abortController = new AbortController();

    const subscribe = async () => {
      try {
        const notifications = await client.rpcSubscriptions
          .accountNotifications(address, { commitment: "confirmed" })
          .subscribe({ abortSignal: abortController.signal });

        for await (const notification of notifications) {
          const lamports = notification.value.lamports;
          // 收到 WebSocket 推送后，手动更新本地 SWR 缓存，不触发重新请求
          mutate(lamports, { revalidate: false });
        }
      } catch {
        // 订阅失败时，SWR 的轮询机制（refreshInterval）会作为兜底继续工作
      }
    };

    void subscribe();

    return () => {
      abortController.abort();
    };
  }, [address, client, mutate]);

  return {
    lamports: (data ?? null) as Lamports | null,
    isLoading,
    error,
    mutate,
  };
}