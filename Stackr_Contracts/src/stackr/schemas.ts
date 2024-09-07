import { ActionSchema, SolidityType } from "@stackr/sdk";

export const registerPlayerSchema = new ActionSchema("registerPlayer", {
  playerId: SolidityType.ADDRESS,
});

export const updatePlayerStateSchema = new ActionSchema("updatePlayerState", {
  playerId: SolidityType.ADDRESS,
  health: SolidityType.UINT,
  mana: SolidityType.UINT,
  xp: SolidityType.UINT,
  level: SolidityType.UINT,
  deckState: SolidityType.STRING,
  currentFloor: SolidityType.UINT,
  score: SolidityType.UINT,
  inventory: SolidityType.STRING,
  turnNumber: SolidityType.UINT,
});