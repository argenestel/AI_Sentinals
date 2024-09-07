import { STF, Transitions } from "@stackr/sdk/machine";
import { RoguelikeGameState, PlayerState, GameState } from "./state";

type RegisterPlayerInput = {
  playerId: string;
};

type UpdatePlayerStateInput = {
  playerId: string;
  health: number;
  mana: number;
  xp: number;
  level: number;
  deckState: string;
  currentFloor: number;
  score: number;
  inventory: string;
  turnNumber: number;
};

const registerPlayer: STF<RoguelikeGameState, RegisterPlayerInput> = {
  handler: ({ state, inputs }) => {
    const { playerId } = inputs;

    if (state.players[playerId]) {
      throw new Error("Player already registered");
    }

    const newPlayerState: PlayerState = {
      health: 100,
      mana: 100,
      xp: 0,
      level: 1,
      deckState: "0x" + "0".repeat(64),
      currentFloor: 1,
      score: 0,
      inventory: "0x" + "0".repeat(64),
      turnNumber: 0,
    };

    const newState: GameState = {
      ...state,
      players: {
        ...state.players,
        [playerId]: newPlayerState,
      },
      globalTurnNumber: state.globalTurnNumber + 1,
    };

    return newState;
  },
};

const updatePlayerState: STF<RoguelikeGameState, UpdatePlayerStateInput> = {
  handler: ({ state, inputs }) => {
    const { playerId, ...playerUpdates } = inputs;

    if (!state.players[playerId]) {
      throw new Error("Player not registered");
    }

    const newPlayerState: PlayerState = {
      ...state.players[playerId],
      ...playerUpdates,
    };

    const newState: GameState = {
      ...state,
      players: {
        ...state.players,
        [playerId]: newPlayerState,
      },
      globalTurnNumber: state.globalTurnNumber + 1,
    };

    return newState;
  },
};

export const transitions: Transitions<RoguelikeGameState> = {
  registerPlayer,
  updatePlayerState,
};
