import React, { useState } from 'react';
import { Box, VStack, Input, Button, Image, Text, useToast, Heading, Flex, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import {abi} from '../abi';
import { useAccount, useWriteContract } from 'wagmi';

const CreateCard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [cardContent, setCardContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const toast = useToast();
  const { writeContract } = useWriteContract()
const CONTRACT_ADDRESS = "0xbcE374e9F031e38d603Bc048294BD5a65626643e";
const { address } = useAccount();

  const handleCreateCard = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/create-card', { prompt });
      setCardContent(response.data.cardContent);
      setImageUrl(response.data.imageUrl);
      toast({
        title: 'Card Created',
        description: 'Your card has been successfully created!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: 'Error',
        description: 'Failed to create card. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleMintCard = async () => {
    setIsMinting(true);
    try {
      // Generate a random tokenURI (you might want to use IPFS in a real-world scenario)
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify({
        name: cardContent,
        description: prompt,
        image: imageUrl,
      }))}`;

      // Generate random attributes (you might want to implement your own logic here)
      const attack = Math.floor(Math.random() * 100);
      const defence = Math.floor(Math.random() * 100);
      const energy = Math.floor(Math.random() * 100);

       writeContract({
        abi,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'mintCard',
        args: [
          address!, // recipient
          tokenURI,
          BigInt(attack),
          BigInt(defence),
          BigInt(energy),
          imageUrl,
          prompt, // description
        ],
      });

      toast({
        title: 'Card Minted',
        description: 'Your card has been successfully minted!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error minting card:', error);
      toast({
        title: 'Minting Failed',
        description: 'There was an error minting your card. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Box
      bgImage="url('/images/fantasy-background.jpg')"
      bgSize="cover"
      bgPosition="center"
      minH="100vh"
      p={8}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        bg="rgba(0, 0, 0, 0.7)"
        p={8}
        borderRadius="xl"
        boxShadow="0 0 20px rgba(66, 153, 225, 0.6)"
        maxW="1200px"
        w="100%"
      >
        <VStack spacing={8} flex={1} alignItems="stretch">
          <Heading color="brand.300" textAlign="center">Create Your Magical Card</Heading>
          <Input
            placeholder="Describe your card's power..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            size="lg"
            fontSize="xl"
          />
          <Button
            onClick={handleCreateCard}
            colorScheme="brand"
            isLoading={isLoading}
            size="lg"
            fontSize="xl"
          >
            Conjure Card
          </Button>

        </VStack>

        {(imageUrl || isLoading) && (
          <Flex flex={1} justifyContent="center" alignItems="center" position="relative" mt={{ base: 8, md: 0 }}>
            <Box
              position="relative"
              w="300px"
              h="420px"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="0 0 20px rgba(66, 153, 225, 0.5)"
            >
              <Image
                src="/cardsample.png"
                alt="Card Frame"
                position="absolute"
                top="0"
                left="0"
                w="100%"
                h="100%"
                zIndex="2"
              />
              {isLoading ? (
                <Flex justify="center" align="center" h="100%">
                  <Spinner size="xl" color="brand.300" />
                </Flex>
              ) : (
                <>
                  <Image
                    src={imageUrl}
                    alt="Generated Card"
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                  <Text
                    position="absolute"
                    bottom="60px"
                    left="0"
                    right="0"
                    textAlign="center"
                    color="black"
                    fontWeight="bold"
                    fontSize="xx-small"
                    px={8}
                    zIndex="3"
                  >
                    {cardContent}
                  </Text>
                </>
              )}
            </Box>
            {imageUrl && !isLoading && (
              <Button
                position="absolute"
                bottom="-60px"
                colorScheme="purple"
                onClick={handleMintCard}
                isLoading={isMinting}
                loadingText="Minting..."
                size="lg"
                fontSize="xl"
              >
                Mint Card
              </Button>
            )}
          </Flex>
        )}
      </Flex>
    </Box>
  );

};

export default CreateCard;