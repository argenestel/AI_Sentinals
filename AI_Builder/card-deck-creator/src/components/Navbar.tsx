import React from 'react';
import { Box, Flex, Button, Text } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar: React.FC = () => {
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
  };

  return (
    <Box 
      bg="white" 
      px={4} 
      py={2} 
      boxShadow="sm"
    >
      <Flex justifyContent="space-between" alignItems="center" maxWidth="1200px" margin="0 auto">
        <Flex alignItems="center">
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            fontFamily="heading" 
            mr={8}
            color="brand.500"
          >
            Senitals Creator
          </Text>
          {/* <Button
            as="a"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/');
            }}
            variant="ghost"
            colorScheme="brand"
            mr={2}
          >
            Home
          </Button>
          <Button
            as="a"
            href="/create"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/create');
            }}
            variant="ghost"
            colorScheme="brand"
            mr={2}
          >
            Create Card
          </Button>
          <Button
            as="a"
            href="/deck"
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/deck');
            }}
            variant="ghost"
            colorScheme="brand"
          >
            My Deck
          </Button> */}
        </Flex>
        <ConnectButton />
      </Flex>
    </Box>
  );
};

export default Navbar;