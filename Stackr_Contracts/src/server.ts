import { ActionConfirmationStatus } from "@stackr/sdk";
import express, { Request, Response } from "express";
import { roguelikeStateMachine, STATE_MACHINES } from "./stackr/machine";
import { mru } from "./stackr/mru";
import { registerPlayerSchema, updatePlayerStateSchema } from "./stackr/schemas";
import { transitions } from "./stackr/transitions";

const PORT = 3210;

export async function setupServer() {
  const app = express();
  app.use(express.json());
  // allow CORS
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  const { stateMachines, config, getStfSchemaMap, submitAction } = mru;
  const machine = stateMachines.get<typeof roguelikeStateMachine>(STATE_MACHINES.ROGUELIKE);

  if (!machine) {
    throw new Error("Roguelike machine not found");
  }

  const transitionToSchema = getStfSchemaMap();

  /** Routes */
  app.get("/info", (_req: Request, res: Response) => {
    res.send({
      isSandbox: config.isSandbox,
      domain: config.domain,
      transitionToSchema,
      schemas: {
        registerPlayer: {
          primaryType: registerPlayerSchema.EIP712TypedData.primaryType,
          types: registerPlayerSchema.EIP712TypedData.types,
        },
        updatePlayerState: {
          primaryType: updatePlayerStateSchema.EIP712TypedData.primaryType,
          types: updatePlayerStateSchema.EIP712TypedData.types,
        },
      },
    });
  });

  app.post("/:transition", async (req: Request, res: Response) => {
    const { transition } = req.params;

    console.log(`Received request for transition: ${transition}`);
    console.log(`Request body:`, JSON.stringify(req.body, null, 2));

    if (!transitions[transition]) {
      console.log(`No transition found for: ${transition}`);
      res.status(400).send({ message: "NO_TRANSITION_FOR_ACTION" });
      return;
    }

    try {
      const { msgSender, signature, inputs } = req.body;

      console.log("msgSender:", msgSender);
      console.log("signature:", signature);
      console.log("inputs:", JSON.stringify(inputs, null, 2));

      const schemaId = transitionToSchema[transition];
      const schema = transition === "registerPlayer" ? registerPlayerSchema : updatePlayerStateSchema;

      if (!schema) {
        console.log(`No schema found for transition: ${transition}`);
        throw new Error(`NO_SCHEMA_FOUND for ${transition}`);
      }

      console.log(`Using schema:`, JSON.stringify(schema.schema, null, 2));

      const action = schema.actionFrom({
        msgSender,
        signature,
        inputs,
      });

      console.log(`Submitting action:`, JSON.stringify(action, null, 2));

      const ack = await submitAction(transition, action);
      const { logs, errors } = await ack.waitFor(ActionConfirmationStatus.C1);
      if (errors?.length) {
        throw new Error(errors[0].message);
      }
      res.status(201).send({ logs, ackHash: ack.hash });
    } catch (e: any) {
      console.error(`Error processing request:`, e);
      res.status(400).send({ error: e.message });
    }
  });

  app.get("/", (_req: Request, res: Response) => {
    res.json({ state: machine.wrappedState });
  });

  app.listen(PORT, () => {
    console.log(`Player Stat MRU Server running on port ${PORT}`);
    console.log(`Available transitions:`, Object.keys(transitions));
  });
}