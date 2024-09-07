import { STATE_MACHINES, roguelikeStateMachine } from "./stackr/machine";
import { mru } from "./stackr/mru";
import { registerPlayerSchema, updatePlayerStateSchema } from "./stackr/schemas";
import { signByOperator, sleep } from "./utils";

export const play = async () => {
  const machine = mru.stateMachines.get<typeof roguelikeStateMachine>(
    STATE_MACHINES.ROGUELIKE
  );

  if (!machine) {
    throw new Error("Roguelike machine not found");
  }

  while (true) {
    const gameState = machine.wrappedState;

    console.log(`Current State: ${JSON.stringify(gameState, null, 2)}\n`);

    console.log("1. Register new player");
    console.log("2. Update player state");
    console.log("3. Exit");

    const choice = await new Promise<string>((resolve) => {
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });

    if (choice === "3") {
      break;
    }

    console.log("Enter player ID (wallet address):");
    const playerId = await new Promise<string>((resolve) => {
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim());
      });
    });

    if (playerId.length === 0) {
      console.log("Player ID is required. Please try again.");
      continue;
    }

    if (choice === "1") {
      const inputs = { playerId };
      const { msgSender, signature } = await signByOperator(registerPlayerSchema, inputs);

      await mru.submitAction(
        "registerPlayer",
        registerPlayerSchema.actionFrom({ inputs, msgSender, signature })
      );
    } else if (choice === "2") {
      const inputs = {
        playerId,
        health: Math.floor(Math.random() * 100),
        mana: Math.floor(Math.random() * 100),
        xp: Math.floor(Math.random() * 1000),
        level: Math.floor(Math.random() * 10),
        deckState: "0x" + Math.random().toString(16).substr(2, 64),
        currentFloor: Math.floor(Math.random() * 10),
        score: Math.floor(Math.random() * 10000),
        inventory: "0x" + Math.random().toString(16).substr(2, 64),
        turnNumber: (gameState.players[playerId]?.turnNumber || 0) + 1,
      };

      const { msgSender, signature } = await signByOperator(updatePlayerStateSchema, inputs);

      await mru.submitAction(
        "updatePlayerState",
        updatePlayerStateSchema.actionFrom({ inputs, msgSender, signature })
      );
    }

    await sleep(500);
  }
};