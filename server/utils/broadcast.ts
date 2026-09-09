import { getFullState } from "./db";

const peers = new Set<any>();

export function addPeer(peer: any) {
  peers.add(peer);
}

export function removePeer(peer: any) {
  peers.delete(peer);
}

export function broadcastState() {
  const message = JSON.stringify({ type: "state", payload: getFullState() });
  for (const peer of peers) {
    try {
      peer.send(message);
    } catch {
      removePeer(peer);
    }
  }
}
