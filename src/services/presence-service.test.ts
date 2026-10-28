import {ref, serverTimestamp, update} from 'firebase/database';
import {setOffline} from './presence-service';

jest.mock('./firebase', () => ({auth: {}, db: {}}));

it('updates users/{uid} with online false and server lastSeen', async () => {
  (update as jest.Mock).mockResolvedValue(undefined);
  await setOffline('u1');
  expect(ref).toHaveBeenCalledWith(expect.anything(), 'users/u1');
  expect(update).toHaveBeenCalledWith(
    {path: 'users/u1'},
    {online: false, lastSeen: (serverTimestamp as jest.Mock).mock.results[0].value},
  );
});
