import React, { useState, useEffect, useCallback } from 'react';
import { getInfo } from '@/api/api';
import { Input } from '@/components/ui/input';
import { PlayerState, MRUInfo } from '@/api/types';
import { Button } from '@/components/ui/button';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAction } from "@/hooks/useAction";

declare global {
  interface Window {
    register: (playerId: string) => Promise<void>;
    updatePlayerState: (state: PlayerState) => Promise<void>;
    getPlayerState: () => PlayerState;
  }
}

const StackrMRU: React.FC = () => {
  const [playerId, setPlayerId] = useState('');
  const [playerState, setPlayerState] = useState<PlayerState>({
    playerId: '',
    health: 0,
    mana: 0,
    xp: 0,
    level: 0,
    deckState: '',
    currentFloor: 0,
    score: 0,
    inventory: '',
    turnNumber: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [mruInfo, setMruInfo] = useState<MRUInfo | null>(null);
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { submit } = useAction();

  const fetchMruInfo = useCallback(async () => {
    try {
      const info = await getInfo();
      setMruInfo(info);
      // const wallet = wallets[0];
      // await wallet.switchChain(11155111);
    } catch (error) {
      console.error("Failed to fetch MRU info:", error);
    }
  }, []);

  const handleRegisterPlayer = useCallback(async (playerId: any) => {
    const id =playerId;
    console.log(mruInfo);
    if (!mruInfo) {
      console.log("MRU Info is null, attempting to fetch...");
      await fetchMruInfo();
      if (!mruInfo) {
        throw new Error('Failed to load MRU info. Please try again.');
      }
    }
    setSubmitting(true);
    try {
      const result = await submit("registerPlayer", {
        playerId: id
      });
      console.log('Player registered:', result);
      setPlayerId(id);
      setPlayerState(prevState => ({ ...prevState, playerId: id }));
    } catch (error) {
      console.error(`Error registering player: ${(error as Error).message}`);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [mruInfo, submit, fetchMruInfo]);

  useEffect(() => {
    fetchMruInfo();

    // Expose functions globally
    window.register = handleRegisterPlayer;
    window.updatePlayerState = handleUpdatePlayerState;
    window.getPlayerState = () => playerState;

    return () => {
      // Clean up global functions
      delete (window as any).register;
      delete (window as any).updatePlayerState;
      delete (window as any).getPlayerState;
    };
  }, [fetchMruInfo, handleRegisterPlayer]);

  const handleUpdatePlayerState = async (newState: PlayerState) => {
    if (!newState.playerId || !mruInfo) {
      throw new Error('Please enter a Player ID and wait for MRU info to load');
    }
    setSubmitting(true);
    try {
      const result = await submit("updatePlayerState", newState);
      console.log('Player state updated:', result);
      setPlayerState(newState);
    } catch (error) {
      console.error(`Error updating player state: ${(error as Error).message}`);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayerState(prevState => ({
      ...prevState,
      [name]: name === 'deckState' || name === 'inventory' ? value : Number(value)
    }));
  };

  if (!ready || !mruInfo) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Button onClick={login}>Connect Wallet to interact with Stackr MRU</Button>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p>Connected to chain ID: {mruInfo.domain.chainId}</p>
      <Input
        placeholder="Enter Player ID"
        value={playerId}
        onChange={(e) => setPlayerId(e.target.value)}
      />
      <Button onClick={() => {handleRegisterPlayer(playerId)}} disabled={submitting}>
        Register Player
      </Button>
      
      <h3>Update Player State</h3>
      {Object.keys(playerState).map((key) => (
        key !== 'playerId' && (
          <Input
            key={key}
            name={key}
            placeholder={`Enter ${key}`}
            value={playerState[key as keyof PlayerState]}
            onChange={handleInputChange}
            type={key === 'deckState' || key === 'inventory' ? 'text' : 'number'}
          />
        )
      ))}
      <Button onClick={() => handleUpdatePlayerState(playerState)} disabled={submitting}>
        Update Player State
      </Button>
    </div>
  );
};

export default StackrMRU;