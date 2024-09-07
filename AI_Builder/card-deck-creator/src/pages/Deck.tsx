import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Image, Text, VStack, Heading, Flex, Badge } from '@chakra-ui/react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { abi } from '../abi'; // Make sure to import your ABI

interface Card {
  id: string;
  imageUrl: string;
  content: string;
  attack: number;
  defence: number;
  energy: number;
  description: string;
}

const CONTRACT_ADDRESS = '0x...'; // Replace with your actual contract address

const Deck: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const { address } = useAccount();
//   useWatchContractEvent({
//     address: CONTRACT_ADDRESS,
//     abi,
//     eventName: 'CardMinted',
//     onLogs(logs) {
//         const { tokenId, owner, attributes } = logs;
//         if (owner === address) {
//           const newCard: Card = {
//             id: tokenId.toString(),
//             imageUrl: attributes.imageUrl,
//             content: '', // You might want to add a name field to your CardAttributes struct
//             attack: Number(attributes.attack),
//             defence: Number(attributes.defence),
//             energy: Number(attributes.energy),
//             description: attributes.description,
//           };
//           setDeck(prevDeck => [...prevDeck, newCard]);
//     }
//   }
//   }
// )
  // Listen for CardMinted events


  useEffect(() => {
    const fetchCards = async () => {
      // We'll need to implement a way to get all token IDs for the user
      // This could be done by keeping track of minted tokens on the frontend
      // or by adding a function to your smart contract to return all token IDs for a user
      // For now, let's assume we have an array of tokenIds
      const tokenIds: any[] = []; // You need to implement a way to get these

      const cardPromises = tokenIds.map(async (tokenId) => {
        const attributes = await useReadContract({
          abi,
          address: CONTRACT_ADDRESS,
          functionName: 'getCardAttributes',
          args: [BigInt(tokenId)],
        });

        const tokenURI = await useReadContract({
          abi,
          address: CONTRACT_ADDRESS,
          functionName: 'tokenURI',
          args: [BigInt(tokenId)],
        });

        // Assuming tokenURI is a JSON string containing metadata
        const metadata = JSON.parse(atob(tokenURI.split(',')[1]));

        return {
          id: tokenId.toString(),
          imageUrl: attributes.imageUrl,
          content: metadata.name || '',
          attack: Number(attributes.attack),
          defence: Number(attributes.defence),
          energy: Number(attributes.energy),
          description: attributes.description,
        };
      });

      const cards = await Promise.all(cardPromises);
      setDeck(cards);
    };

    if (address) {
      fetchCards();
    }
  }, [address]);

  return (
    <Box
    minH="100vh"
    p={8}
  >
    <Heading 
      color="brand.300" 
      textAlign="center" 
      mb={8}
      fontSize="5xl"
      fontWeight="bold"
      textShadow="0 0 10px rgba(123, 77, 255, 0.6)"
    >
      Your Magical Deck
    </Heading>
    <SimpleGrid columns={[1, 2, 3, 4]} spacing={8}>
      {deck.map((card) => (
        <VStack
          key={card.id}
          bg="rgba(0, 0, 0, 0.7)"
          p={4}
          borderRadius="lg"
          spacing={4}
          _hover={{ transform: 'scale(1.05)', transition: '0.3s' }}
          boxShadow="0 0 20px rgba(123, 77, 255, 0.4)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          backdropFilter="blur(10px)"
        >
          <Box position="relative" w="200px" h="280px">
            <Image
              src="/images/cardframe.png"
              alt="Card Frame"
              position="absolute"
              top="0"
              left="0"
              w="100%"
              h="100%"
              zIndex="2"
            />
            <Image 
              src={card.imageUrl} 
              alt={card.content} 
              objectFit="cover" 
              w="100%" 
              h="100%" 
              borderRadius="md"
            />
            <Text
              position="absolute"
              bottom="10px"
              left="0"
              right="0"
              textAlign="center"
              color="white"
              fontWeight="bold"
              fontSize="md"
              px={2}
              textShadow="0 0 3px black"
              zIndex="3"
            >
              {card.content}
            </Text>
          </Box>
          <Flex direction="column" align="center" w="100%">
            <Flex justify="space-between" w="100%" mb={2}>
              <Badge colorScheme="red">ATK: {card.attack}</Badge>
              <Badge colorScheme="blue">DEF: {card.defence}</Badge>
              <Badge colorScheme="green">NRG: {card.energy}</Badge>
            </Flex>
            <Text 
              color="whiteAlpha.900" 
              fontSize="sm" 
              textAlign="center"
              fontStyle="italic"
              maxH={isLargerThan768 ? "100px" : "60px"}
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {card.description}
            </Text>
          </Flex>
        </VStack>
      ))}
    </SimpleGrid>
  </Box>
);

};

export default Deck;