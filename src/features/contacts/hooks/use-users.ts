import { useEffect, useState } from 'react';
import { subscribeUsers } from '../../../services/user-service';
import type { UserProfile } from '../../../services/types';

type State = { users: UserProfile[]; loading: boolean; error: string | null };

const EMPTY: State = { users: [], loading: false, error: null };

export function useUsers(myUid: string): State {
  const [state, setState] = useState<State>(
    myUid ? { users: [], loading: true, error: null } : EMPTY,
  );

  useEffect(() => {
    if (!myUid) {
      setState(EMPTY);
      return undefined;
    }
    setState({ users: [], loading: true, error: null });
    const unsubscribe = subscribeUsers(
      myUid,
      users => setState({ users, loading: false, error: null }),
      () =>
        setState({
          users: [],
          loading: false,
          error: 'Không tải được danh bạ',
        }),
    );
    return unsubscribe;
  }, [myUid]);

  return state;
}
