import * as E from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter';

const encodeErrors = E.mapLeft(failure);

type Query = <T>(
  client: any,
  codec: t.Type<T, T, unknown>,
  ...queryArgs: any[]
) => Promise<E.Either<Array<string>, Array<T>>>;

export const query: Query = async (client, codec, ...queryArgs) => {
  const result: any = await client.query(...queryArgs);
  return encodeErrors(t.array(codec).decode(result.rows));
};
