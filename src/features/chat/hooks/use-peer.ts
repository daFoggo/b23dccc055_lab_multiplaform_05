import { useEffect, useState } from 'react';
import { subscribeUser } from '../../../services/user-service';
import type { UserProfile } from '../../../services/types';

export function usePeer(peerId: string): UserProfile | null {
  const [peer, setPeer] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeUser(peerId, profile => {
      if (active) {
        setPeer(profile);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [peerId]);

  return peer;
}
