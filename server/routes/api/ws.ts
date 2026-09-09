import { addPeer, numberOfPeers, removePeer } from '../../utils/broadcast'
import { getFullState } from '../../utils/db'

export default defineWebSocketHandler({
  open(peer) {
    addPeer(peer)
    peer.send(JSON.stringify({ type: 'state', payload: getFullState() }))
    console.log(numberOfPeers())
  },
  close(peer) {
    removePeer(peer)
  },
  error(peer) {
    removePeer(peer)
  }
})
