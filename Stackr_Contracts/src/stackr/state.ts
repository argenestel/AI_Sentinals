import { State } from "@stackr/sdk/machine";
import { BytesLike, hexlify, solidityPackedKeccak256 } from "ethers";

export interface PlayerState {
  health: number;
  mana: number;
  xp: number;
  level: number;
  deckState: string;
  currentFloor: number;
  score: number;
  inventory: string;
  turnNumber: number;
}

export interface GameState {
  players: Record<string, PlayerState>;
  seed: number;
  globalTurnNumber: number;
}

export class RoguelikeGameState extends State<string, GameState> {
  constructor(state: string) {
    super(state);
  }

  transformer() {
    return {
      wrap: () => {
        return JSON.parse(this.state) as GameState;
      },
      unwrap: (wrappedState: GameState) => {
        return JSON.stringify(wrappedState);
      },
    };
  }

  getRootHash(): BytesLike {
    return hexlify(solidityPackedKeccak256(["string"], [this.state]));
  }
}
