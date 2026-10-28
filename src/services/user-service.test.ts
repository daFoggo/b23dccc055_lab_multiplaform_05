import {ref, set} from 'firebase/database';
import {createUserProfile} from './user-service';

jest.mock('./firebase', () => ({auth: {}, db: {}}));

it('writes users/{uid} with name and online true', async () => {
  (set as jest.Mock).mockResolvedValue(undefined);
  await createUserProfile('u1', 'An');
  expect(ref).toHaveBeenCalledWith(expect.anything(), 'users/u1');
  expect(set).toHaveBeenCalledWith(
    {path: 'users/u1'},
    {name: 'An', online: true},
  );
});
