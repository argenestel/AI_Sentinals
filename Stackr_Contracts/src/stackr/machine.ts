import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "../../genesis-state.json";
import { RoguelikeGameState } from "./state";
import { transitions } from "./transitions";

const STATE_MACHINES = {
  ROGUELIKE: "roguelike",
};

const roguelikeStateMachine = new StateMachine({
  id: STATE_MACHINES.ROGUELIKE,
  initialState: genesisState.state,
  stateClass: RoguelikeGameState,
  on: transitions,
});

export { STATE_MACHINES, roguelikeStateMachine };