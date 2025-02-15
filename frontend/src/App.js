import React, { useEffect } from "react";
import { mainnet, arbitrum } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet as wagmiMainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Firesides from "./components/Firesides";

// Reown AppKit configuration
const projectId = 'cd1f1762a652e9eab4491560168779f3';
const networks = [mainnet, arbitrum];

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
});

const metadata = {
  name: 'Firesides',
  description: 'Interactive NFC product for hackerhouses',
  url: window.location.origin,
  icons: ['https://assets.reown.com/reown-profile-pic.png']
};

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true
  }
});

// Wagmi configuration
const config = createConfig({
  chains: [wagmiMainnet],
  transports: {
    [wagmiMainnet.id]: http()
  }
});

// Create a client
const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Initialize modal
    const handleConnect = () => {
      modal.open();
    };

    window.addEventListener('connect-wallet', handleConnect);
    return () => {
      window.removeEventListener('connect-wallet', handleConnect);
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Firesides modal={modal} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App; 