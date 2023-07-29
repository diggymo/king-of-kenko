import { Point } from '@prisma/client';

export const calcAverage = (points: Pick<Point, 'value'>[]) => {
  const sum = points.reduce((prev, current) => {
    return prev + current.value;
  }, 0);

  return sum / points.length;
};
