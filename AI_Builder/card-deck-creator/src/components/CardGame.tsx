import React, { useState, useEffect } from 'react';
import { Box, VStack, Input, Button, Image, Text, useToast, Heading, Flex, SimpleGrid, Badge, Grid, GridItem, keyframes, Tooltip } from '@chakra-ui/react';
import axios from 'axios';
import { abi } from '../abi';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { Wand2, Swords, Shield, Zap, Crown, Sparkles } from 'lucide-react';

interface Card {
  id: string;
  imageUrl: string;
  content: string;
  attack: number;
  defence: number;
  energy: number;
  description: string;
}

const CONTRACT_ADDRESS = "0xbcE374e9F031e38d603Bc048294BD5a65626643e";

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px #f0f, 0 0 10px #f0f, 0 0 15px #f0f, 0 0 20px #f0f; }
  50% { box-shadow: 0 0 10px #f0f, 0 0 20px #f0f, 0 0 30px #f0f, 0 0 40px #f0f; }
  100% { box-shadow: 0 0 5px #f0f, 0 0 10px #f0f, 0 0 15px #f0f, 0 0 20px #f0f; }
`;

const CardGame: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [cardContent, setCardContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const toast = useToast();
  const { writeContract } = useWriteContract();
  const { address } = useAccount();

  // Example cards (you can remove these once you implement fetching from the contract)
  const exampleCards: Card[] = [
    {
      id: 'example1',
      imageUrl: '/images/example-card-1.jpg',
      content: 'Fire Dragon',
      attack: 80,
      defence: 60,
      energy: 70,
      description: 'A mighty dragon that breathes fire.'
    },
    {
      id: 'example2',
      imageUrl: '/images/example-card-2.jpg',
      content: 'Ice Wizard',
      attack: 60,
      defence: 70,
      energy: 80,
      description: 'A powerful wizard with control over ice.'
    },
    // Add more example cards as needed
  ];

  const handleCreateCard = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/create-card', { prompt });
      setCardContent(response.data.cardContent);
      setImageUrl(response.data.imageUrl);
      toast({
        title: 'Card Created',
        description: 'Your magical card has been conjured!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: 'Spell Fizzled',
        description: 'Failed to create card. Try again, brave wizard!',
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
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify({
        name: cardContent,
        description: prompt,
        image: imageUrl,
      }))}`;

      const attack = Math.floor(Math.random() * 100);
      const defence = Math.floor(Math.random() * 100);
      const energy = Math.floor(Math.random() * 100);

      await writeContract({
        abi,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'mintCard',
        args: [
          address!,
          tokenURI,
          BigInt(attack),
          BigInt(defence),
          BigInt(energy),
          imageUrl,
          prompt,
        ],
      });

      const newCard: Card = {
        id: Date.now().toString(),
        imageUrl,
        content: cardContent,
        attack,
        defence,
        energy,
        description: prompt,
      };

      setDeck(prevDeck => [...prevDeck, newCard]);

      toast({
        title: 'Card Minted',
        description: 'Your magical card is now part of your collection!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error minting card:', error);
      toast({
        title: 'Minting Failed',
        description: 'The magical energies faltered. Try again, mighty mage!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    setDeck(exampleCards);
  }, []);

  const MagicalCard: React.FC<{ card: Card; isCreating?: boolean }> = ({ card, isCreating = false }) => (
    <Box
      position="relative"
      w="240px"
      h="336px"
      borderRadius="lg"
      overflow="hidden"
      transform="perspective(1000px) rotateY(0deg)"
      transition="transform 0.5s"
      _hover={{ transform: "perspective(1000px) rotateY(10deg)" }}
      boxShadow="lg"
    >
      <Image 
        src="/images/card-background.jpg"
        alt="Card Background"
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        objectFit="cover"
      />
      <Box
        position="absolute"
        top="0"
        left="0"
        w="100%"
        h="100%"
        bg="rgba(0,0,0,0.4)"
        zIndex={1}
      />
      <Image 
        src={card.imageUrl} 
        alt={card.content} 
        position="absolute"
        top="10%"
        left="10%"
        w="80%"
        h="50%"
        objectFit="cover"
        borderRadius="md"
        zIndex={2}
      />
      <VStack
        position="absolute"
        bottom="10%"
        left="0"
        w="100%"
        padding="4"
        spacing={2}
        zIndex={3}
      >
        <Text color="white" fontWeight="bold" fontSize="lg" textAlign="center" textShadow="0 0 5px black">
          {card.content}
        </Text>
        <Flex justify="space-between" w="100%">
          <Tooltip label="Attack">
            <Badge colorScheme="red" display="flex" alignItems="center"><Swords size={14} style={{marginRight: '4px'}}/> {card.attack}</Badge>
          </Tooltip>
          <Tooltip label="Defence">
            <Badge colorScheme="blue" display="flex" alignItems="center"><Shield size={14} style={{marginRight: '4px'}}/> {card.defence}</Badge>
          </Tooltip>
          <Tooltip label="Energy">
            <Badge colorScheme="green" display="flex" alignItems="center"><Zap size={14} style={{marginRight: '4px'}}/> {card.energy}</Badge>
          </Tooltip>
        </Flex>
        <Text color="white" fontSize="xs" textAlign="center" noOfLines={2} textShadow="0 0 5px black">
          {card.description}
        </Text>
      </VStack>
      {isCreating && (
        <Button
          leftIcon={<Crown size={18} />}
          colorScheme="purple"
          onClick={handleMintCard}
          isLoading={isMinting}
          loadingText="Minting..."
          position="absolute"
          bottom="2%"
          left="50%"
          transform="translateX(-50%)"
          zIndex={4}
          size="sm"
        >
          Mint Card
        </Button>
      )}
    </Box>
  );

  return (
    <Box 
      minH="100vh" 
      p={8} 
      bgGradient="linear(to-b, purple.900, blue.900)"
      backgroundSize="cover" 
      backgroundAttachment="fixed"
    >
      <VStack spacing={8} align="stretch">
        <Heading color="white" textAlign="center" fontSize="5xl" textShadow="0 0 10px #f0f">
          Magical Card Forge
        </Heading>
        
        <Grid templateColumns={{base: "1fr", lg: "1fr 1fr"}} gap={8}>
          <GridItem>
            <Box 
              bg="rgba(255,255,255,0.1)" 
              p={6} 
              borderRadius="lg" 
              boxShadow="xl"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255,255,255,0.2)"
            >
              <Heading size="lg" color="white" mb={4}>Conjure a New Card</Heading>
              <VStack spacing={4}>
                <Input
                  placeholder="Describe your card's magical essence..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  size="lg"
                  bg="rgba(255,255,255,0.1)"
                  color="white"
                  _placeholder={{ color: "gray.300" }}
                  borderColor="rgba(255,255,255,0.2)"
                />
                <Button
                  leftIcon={<Wand2 size={18} />}
                  onClick={handleCreateCard}
                  colorScheme="purple"
                  isLoading={isLoading}
                  size="lg"
                  w="100%"
                  animation={`${glowAnimation} 2s infinite`}
                >
                  Create Magical Card
                </Button>
              </VStack>
            </Box>

            {imageUrl && !isLoading && (
              <Box mt={8}>
                <Heading size="md" color="white" mb={4}>Your New Magical Creation</Heading>
                <Flex justify="center">
                  <MagicalCard 
                    card={{
                      id: 'new',
                      imageUrl,
                      content: cardContent,
                      attack: Math.floor(Math.random() * 100),
                      defence: Math.floor(Math.random() * 100),
                      energy: Math.floor(Math.random() * 100),
                      description: prompt
                    }} 
                    isCreating={true}
                  />
                </Flex>
              </Box>
            )}
          </GridItem>

          <GridItem>
            <Box 
              bg="rgba(255,255,255,0.1)" 
              p={6} 
              borderRadius="lg" 
              boxShadow="xl"
              backdropFilter="blur(10px)"
              border="1px solid rgba(255,255,255,0.2)"
            >
              <Heading size="lg" color="white" mb={4}>Your Magical Collection</Heading>
              <SimpleGrid columns={[1, 1, 2]} spacing={6} justifyItems="center">
                {deck.map(card => <MagicalCard key={card.id} card={card} />)}
              </SimpleGrid>
            </Box>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default CardGame;