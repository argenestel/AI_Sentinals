import { ChakraProvider, Box, VStack, Heading, Text } from '@chakra-ui/react'
import {  ConnectKitButton } from 'connectkit'
import { Web3Provider } from './Web3Provider'
import SampleCardMaker from './components/CombinedAI'



function App() {
  return (
<Web3Provider>
        <ChakraProvider>
          <Box minHeight="100vh" bg="gray.100" py={12}>
            <VStack spacing={8}>
              <Heading size="2xl" color="purple.700">AI Fusion Card Game</Heading>
              <Text fontSize="xl" color="gray.600">Connect your wallet to start your AI adventure!</Text>
              <ConnectKitButton />
              <SampleCardMaker />
            </VStack>
          </Box>
        </ChakraProvider>
        </Web3Provider>
  )
}

export default App