import React from 'react'
import { Box, Flex, Button } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Navbar: React.FC = () => {
  const handleNavigation = (path: string) => {
    // You can implement custom navigation logic here if needed
    window.history.pushState({}, '', path)
  }

  return (
    <Box bg="gray.800" px={4} py={2}>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex>
          <Button
            as="a"
            href="/"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation('/')
            }}
            variant="ghost"
            color="white"
            mr={2}
          >
            Home
          </Button>
          <Button
            as="a"
            href="/create"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation('/create')
            }}
            variant="ghost"
            color="white"
            mr={2}
          >
            Create Card
          </Button>
          <Button
            as="a"
            href="/deck"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation('/deck')
            }}
            variant="ghost"
            color="white"
          >
            My Deck
          </Button>
        </Flex>
        <ConnectButton />
      </Flex>
    </Box>
  )
}

export default Navbar