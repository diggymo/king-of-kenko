import { z } from 'zod';

export const SORT_SCHEMA = <T extends Readonly<[string, ...string[]]>>(properties: T) =>
  z
    .object({
      property: z.enum(properties),
      order: z.enum(['asc', 'desc']),
    })
    .transform((sortProps) => {
      const a = sortProps.property;
      if (a === null) {
        return;
      }
      if (a === undefined) {
        return;
      }
      return {
        [sortProps.property!]: sortProps.order,
      };
    });

/**
 * この場合、例えば以下はpassする
 * ```
 * {
 *   property: "AAA",
 *   order: "asc"
 * }
 * ```
 */
SORT_SCHEMA(['AAA', 'BBB']);
SORT_SCHEMA(['XXX']);
