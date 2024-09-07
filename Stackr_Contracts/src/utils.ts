import { ActionSchema } from "@stackr/sdk";
import { Wallet } from "ethers";
import { stackrConfig } from "../stackr.config";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const signByOperator = async (schema: ActionSchema, payload: any) => {
  const { operator } = stackrConfig;
  const wallet = new Wallet(operator.accounts[0].privateKey);
  const signature = await wallet.signTypedData(
    schema.domain,
    schema.EIP712TypedData.types,
    payload
  );
  return { msgSender: wallet.address, signature };
};