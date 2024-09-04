import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Box, ChakraProvider } from '@chakra-ui/react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CreateCard from './pages/CreateCard'
import Deck from './pages/Deck'
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  Chain,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import customTheme from './customtheme';



const galadriel = {
  id: 696969, // Replace with the actual chain ID
  name: 'Galadriel',
  nativeCurrency: {
    decimals: 18,
    name: 'Galadriel',
    symbol: 'GAL',
  },
  rpcUrls: {
    public: { http: ['https://devnet.galadriel.com'] },
    default: { http: ['https://devnet.galadriel.com'] },
  },
  blockExplorers: {
    default: { name: 'GaladrielScan', url: 'https://explorer.galadriel.com' },
  },
} as const satisfies Chain


const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [galadriel],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
      <ChakraProvider theme={customTheme}>

    <Box>
      <Navbar />
<Router>
  <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateCard />} />
        <Route path="/deck" element={<Deck />} />
        </Routes>
        </Router>

    </Box>
    </ChakraProvider>
    </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App