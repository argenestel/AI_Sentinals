import { Playground } from "@stackr/sdk/plugins";
import { play } from "./cli";
import { mru } from "./stackr/mru";
import { sleep } from "./utils";

const main = async () => {
  if (process.env.NODE_ENV !== "production") {
    Playground.init(mru);
    await sleep(1000);
  }

  await play();
};

main();
