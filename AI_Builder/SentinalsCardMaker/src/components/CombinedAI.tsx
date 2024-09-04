import React, { useState } from 'react';
import { Box, Button, VStack, Text, Textarea, Flex, Image, useToast } from '@chakra-ui/react';
import { useWriteContract } from 'wagmi';
import ABI from '../../public/contracts/DalleNft.sol/DalleNft.json'
// Replace with your actual contract ABI and address
const CONTRACT_ABI =ABI.abi;
const CONTRACT_ADDRESS = '0x...'; // Your contract address

interface ChatEntry {
  role: 'user' | 'AI';
  content: string;
}

const CombinedAICardMaker = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [nftImage, setNftImage] = useState<string | null>(null);
  const toast = useToast();

  // Wagmi hook for writing to the contract
  const { writeContract, data: writeData, isLoading: isWriting, isSuccess, isError } = useWriteContract();

  const handleSubmit = async () => {
    if (input.trim() === '') return;

    // Simulate chat response
    const newChatHistory = [
      ...chatHistory,
      { role: 'user', content: input },
      { role: 'AI', content: `This is a simulated response to: "${input}"` }
    ];
    setChatHistory(newChatHistory);

    // Simulate NFT image generation
    const randomSeed = Math.floor(Math.random() * 1000);
    const generatedImageUrl = `https://picsum.photos/seed/${randomSeed}/300/200`;
    setNftImage(generatedImageUrl);

    // Write to the contract
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createCard', // Replace with your actual function name
        args: [input, generatedImageUrl],
      });
    } catch (error) {
      console.error('Error writing to contract:', error);
      toast({
        title: 'Error',
        description: 'Failed to write to the contract. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    setInput('');
  };

  React.useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Card Created!",
        description: "Your AI Fusion Card has been generated and saved to the blockchain.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } else if (isError) {
      toast({
        title: "Error",
        description: "Failed to save the card to the blockchain. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isSuccess, isError, toast]);

  return (
    <Box
      width="400px"
      borderWidth={2}
      borderRadius="xl"
      overflow="hidden"
      boxShadow="2xl"
      bg="white"
      p={6}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('https://i.imgur.com/QZaaIz4.png')",
        backgroundSize: 'cover',
        opacity: 0.1,
        borderRadius: 'xl',
      }}
    >
      <VStack spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" color="purple.700">AI Fusion Card Maker</Text>
        <Textarea
          placeholder="Enter your prompt or message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          bg="white"
          borderColor="purple.300"
          _hover={{ borderColor: "purple.400" }}
          _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px #805AD5" }}
        />
        <Button
          colorScheme="purple"
          onClick={handleSubmit}
          isLoading={isWriting}
          loadingText="Creating..."
          width="full"
        >
          Create Card
        </Button>
        <Flex width="full" justifyContent="space-between">
          <Box width="45%">
            <Text fontWeight="bold" mb={2}>Chat History</Text>
            <Box 
              height="200px" 
              overflowY="auto" 
              borderWidth={1} 
              borderRadius="md" 
              p={2}
              bg="gray.50"
            >
              {chatHistory.map((msg, index) => (
                <Text key={index} fontSize="sm" mb={1}>
                  <strong>{msg.role}:</strong> {msg.content}
                </Text>
              ))}
            </Box>
          </Box>
          <Box width="45%">
            <Text fontWeight="bold" mb={2}>Generated Image</Text>
            {nftImage ? (
              <Image src={nftImage} alt="AI Generated Image" borderRadius="md" />
            ) : (
              <Box 
                height="200px" 
                borderWidth={1} 
                borderRadius="md" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                bg="gray.50"
              >
                <Text>No image generated yet</Text>
              </Box>
            )}
          </Box>
        </Flex>
        {writeData && (
          <Text fontSize="sm" color="gray.600">
            Transaction Hash: {writeData.hash}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default CombinedAICardMaker;