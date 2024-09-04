import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";
import { type Chain
} from 'viem'
interface Web3ProviderProps {
    children: ReactNode;
}
export const galadrielNetwork
    = {
        id
            : 696969,
        name
            : 'GalaDriel',
        nativeCurrency
            : {
                name
                    : 'galadriel', symbol
                : 'GAL', decimals
                : 18
        },
        rpcUrls
            : {
            default
                : {
                    http
                        : ['https://devnet.galadriel.com']
            },
        },
        blockExplorers
            : {
            default
                : {
                    name
                        : 'Explorer', url
                    : 'https://explorer.galadriel.com'
            },
        },
    
    } as const satisfies Chain


const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: [galadrielNetwork],
        transports: {
            // RPC URL for each chain
            [galadrielNetwork.id]: http(),
        },

        // Required API Keys
        walletConnectProjectId: import.meta.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

        // Required App Info
        appName: "Your App Name",

        // Optional App Info
        appDescription: "Your App Description",
        appUrl: "https://family.co", // your app's url
        appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    }),
);

const queryClient = new QueryClient();

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>{children}</ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};