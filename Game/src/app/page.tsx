"use client";

import { getState } from "@/api/api";
import { ActionLogs } from "@/components/action-logs";
import StackrMRU from "@/components/stacker";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useAction";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

const GodotGame = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Handle any postMessage events from the iframe if needed
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="w-[1400px] h-[1000px] mb-4">
      <iframe
        ref={iframeRef}
        src="/deckgame.html"
        className="w-full h-full border-none"
        title="Godot Game"
        allow="autoplay; fullscreen; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
      />
    </div>
  );
};

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const [fetching, setFetching] = useState(true);
  const [value, setValue] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const { submit } = useAction();
  const actionDisabled = !ready || !authenticated;

  const handleAction = async (actionName: string) => {
    try {
      setSubmitting(true);
      const res = await submit(actionName, { timestamp: Date.now() });
      if (!res) {
        throw new Error("Failed to submit action");
      }
      setValue(res.logs[0].value);
    } catch (e) {
      alert((e as Error).message);
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const renderBody = () => {
    if (!ready) {
      return <div>Loading...</div>;
    }

    if (!authenticated) {
      return <Button onClick={login}>Connect Wallet to interact</Button>;
    }

    return (
      <div className="flex flex-col gap-4">
        {/* <div className="flex gap-4">
          Uncomment these buttons if you want to use them
          <Button
            disabled={submitting}
            onClick={() => handleAction("increment")}
          >
            Increment
          </Button>
          <Button
            disabled={submitting}
            onClick={() => handleAction("decrement")}
          >
            Decrement
          </Button>
         
        </div> */}
        <StackrMRU />
      </div>
    );
  };

  return (
    <main className="flex m-auto w-full h-full px-4">
      <div className="flex flex-col gap-4 flex-1">
        <p className="text-2xl">
          Current State:
          <code className="mx-4">{fetching ? "..." : value}</code>
        </p>
        <div className="flex gap-4">{renderBody()}</div>
        
      </div>
      {/* <ActionLogs /> */}
      <GodotGame />
      </main>
  );
}