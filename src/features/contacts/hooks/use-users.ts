import { useEffect, useState } from 'react';
import { subscribeUsers } from '../../../services/user-service';
import type { UserProfile } from '../../../services/types';

export function useUsers(myUid: string): {
  users: UserProfile[];
  loading: boolean;
} {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeUsers(myUid, list => {
      setUsers(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [myUid]);

  return { users, loading };
}
