import React from 'react';
import { Box, Heading, Text, Button, VStack, keyframes } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const Home: React.FC = () => {
  return (
    <Box
      bgImage="url('/images/home-background.jpg')"
      bgSize="cover"
      bgPosition="center"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack
        spacing={8}
        p={12}
        bg="rgba(0, 0, 0, 0.7)"
        borderRadius="xl"
        boxShadow="0 0 30px rgba(66, 153, 225, 0.8)"
        textAlign="center"
        animation={`${floatAnimation} 3s ease-in-out infinite`}
      >
        <Heading size="2xl" color="brand.300">Welcome to Card Deck Creator</Heading>
        <Text fontSize="xl" color="gray.300">Create unique cards and build your ultimate deck!</Text>
        <Button as={Link} to="/create" colorScheme="brand" size="lg">
          Start Creating
        </Button>
        <Button as={Link} to="/deck" colorScheme="brand" variant="outline" size="lg">
          View Your Deck
        </Button>
      </VStack>
    </Box>
  );
};

export default Home;