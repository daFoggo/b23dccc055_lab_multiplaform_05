import type { ChatMessage } from '../services/types';
import { canSend, groupByDay } from './messages';

describe('canSend', () => {
  it('rejects blank, accepts text', () => {
    expect(canSend('  \n')).toBe(false);
    expect(canSend('')).toBe(false);
    expect(canSend(' hi ')).toBe(true);
  });
});

describe('groupByDay', () => {
  const at = (d: number, h: number) => new Date(2026, 9, d, h).getTime();
  const msg = (id: string, createdAt: number): ChatMessage => ({
    id,
    senderId: 'a',
    type: 'text',
    text: id,
    createdAt,
  });
  const now = at(28, 12);

  it('returns empty for no messages', () => {
    expect(groupByDay([], now)).toEqual([]);
  });

  it('inserts a day label when the day changes, with unique keys', () => {
    const items = groupByDay(
      [
        msg('1', at(26, 9)),
        msg('2', at(26, 10)),
        msg('3', at(27, 9)),
        msg('4', at(28, 9)),
      ],
      now,
    );
    expect(items.map(i => (i.type === 'day' ? i.label : i.message.id))).toEqual(
      ['26/10/2026', '1', '2', 'Hôm qua', '3', 'Hôm nay', '4'],
    );
    const keys = items.flatMap(i => (i.type === 'day' ? [i.key] : []));
    expect(new Set(keys).size).toBe(3);
  });

  it('sorts unsorted input ascending (stable by id) with unique day keys', () => {
    const items = groupByDay(
      [
        msg('4', at(28, 9)),
        msg('b', at(26, 9)),
        msg('a', at(26, 9)),
        msg('3', at(27, 9)),
      ],
      now,
    );
    expect(items.map(i => (i.type === 'day' ? i.label : i.message.id))).toEqual(
      ['26/10/2026', 'a', 'b', 'Hôm qua', '3', 'Hôm nay', '4'],
    );
    const keys = items.flatMap(i => (i.type === 'day' ? [i.key] : []));
    expect(new Set(keys).size).toBe(3);
  });
});
