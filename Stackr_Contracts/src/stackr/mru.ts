import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../../stackr.config";
import { registerPlayerSchema, updatePlayerStateSchema } from "./schemas";
import { roguelikeStateMachine } from "./machine";

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [registerPlayerSchema, updatePlayerStateSchema],
  stateMachines: [roguelikeStateMachine],
  stfSchemaMap: {
    registerPlayer: registerPlayerSchema,
    updatePlayerState: updatePlayerStateSchema,
  },
});

await mru.init();

export { mru };