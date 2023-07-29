import { calcAverage } from './health.entity';

it('calculate average', () => {
  expect(calcAverage([{ value: 1 }, { value: 2 }, { value: 3 }])).toEqual(2);
});
