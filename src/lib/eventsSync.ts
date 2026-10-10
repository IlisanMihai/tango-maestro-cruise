import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";

// Lets the admin tell other open tabs of the site that events changed, so a
// public page open in another tab refreshes without a reload.
const CHANNEL = "tango-events";

export function notifyEventsChanged() {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage("changed");
    channel.close();
  } catch {
    // BroadcastChannel unsupported: other tabs refresh on focus anyway
  }
}

export function useEventsSync(queryClient: QueryClient) {
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = () => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.invalidateQueries({ queryKey: ["event"] });
      };
    } catch {
      // unsupported: nothing to do
    }
    return () => channel?.close();
  }, [queryClient]);
}
