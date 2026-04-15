"use client";

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// 只保留这一行，删掉下面的 require
import '@solana/wallet-adapter-react-ui/styles.css';

// ❌ 删掉这一行：require('@solana/wallet-adapter-react-ui/styles.css');

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
  // 使用 useMemo 确保这些对象在重绘时不被重新创建，这对性能和稳定性很重要
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};