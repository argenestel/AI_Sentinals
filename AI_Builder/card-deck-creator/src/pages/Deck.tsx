import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Image, Text, VStack, Heading } from '@chakra-ui/react';

interface Card {
  id: string;
  imageUrl: string;
  content: string;
}

const Deck: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);

  useEffect(() => {
    // TODO: Fetch user's deck from the backend
    // For now, we'll use dummy data
    setDeck([
      { id: '1', imageUrl: 'https://example.com/card1.jpg', content: 'Fire Dragon' },
      { id: '2', imageUrl: 'https://example.com/card2.jpg', content: 'Ice Wizard' },
      { id: '3', imageUrl: 'https://example.com/card3.jpg', content: 'Nature Elf' },
    ]);
  }, []);

  return (
    <Box
      bgImage="url('/images/deck-background.jpg')"
      bgSize="cover"
      bgPosition="center"
      minH="100vh"
      p={8}
    >
      <Heading color="brand.300" textAlign="center" mb={8}>Your Magical Deck</Heading>
      <SimpleGrid columns={[1, 2, 3, 4]} spacing={8}>
        {deck.map((card) => (
          <VStack
            key={card.id}
            bg="rgba(0, 0, 0, 0.7)"
            p={4}
            borderRadius="md"
            spacing={4}
            _hover={{ transform: 'scale(1.05)', transition: '0.3s' }}
            boxShadow="0 0 10px rgba(66, 153, 225, 0.4)"
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
              <Image src={card.imageUrl} alt={card.content} objectFit="cover" w="100%" h="100%" />
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
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Deck;