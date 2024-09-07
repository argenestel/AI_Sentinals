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

  Chain,
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import customTheme from './customtheme';
import CardGame from './components/CardGame';



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


export const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'f25128b8bcfc64fb5c124705aa9442b8',
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
      <div>

      <CardGame />
      </div>

    </Box>
    </ChakraProvider>
    </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App