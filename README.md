# 🌺 Dahlia

> A TypeScript-PostgreSQL API for _truly_ type-safe querying.

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![CI](https://github.com/zperrault/dahlia/workflows/CI/badge.svg?branch=master)](https://github.com/zperrault/dahlia/actions?query=workflow%3ACI+branch%3Amaster)

## Table of Contents

1. [Motivation and Inspiration](#motivation-and-inspiration)
1. [Getting Started](#getting-started)
   1. [Installation](#installation)
   1. [Usage](#usage)

## Motivation and Inspiration

Many TypeScript query builders and wrappers around `pg` promise type-safety but rely on generated types from a PostgreSQL schema. This approach ignores that a schema can change and does not verify that what was assumed true when code was authored is still true.

Dahlia differs from this approach because is verifies query results at runtime. Using [`io-ts`]() and [`fp-ts`](), Dahlia can expose static types to be used on the rest of your application code and also verify that returned rows are what you expect them to be. The returned `Either` type requires you handle both cases of type mismatch or success; or, you explicitly ignore the possibility. This is in contrast to other approaches where the possibility ignored implicitly.

This approach also favors writing the types as you expect them to be instead of relying on complex systems to generate these types. We think the additional typing (both conceptually and physically) is worth the added safety.

## Getting Started

### Installation

Dahlia specifies `io-ts`, `fp-ts`, and `pg` as peer dependencies to prevent duplication of dependencies or collisions of types across packages. All this means for you is that you'll have to install these packages also when installing Dahlia.

```shell
# Using yarn
yarn add io-ts fp-ts pg dahlia-ts

# Using npm
npm install io-ts fp-ts pg dahlia-ts
```

### Usage

Consider the schema...

```sql
CREATE TABLE user (
  id integer primary key generated always as identity,
  name text not null,
  alias text
);
```

...we specify the expected return type and execute the query...

```typescript
import { Client } from 'pg'
import * as t from 'io-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'
import { query } from 'dahlia-ts'

(async () => {
  const client = new Client({ /* pg config */ })
  try {
    await client.connect()

    const UserRow = t.strict({
      id: t.number,
      name: t.string,
      alias: t.union([t.null, t.string]),
    })

    console.log(
      pipe(
        await query(client, UserRow, 'SELECT * FROM users;')
        fold(
          errors => `Failed to load users:\n${errors.join('\n\t')}`,
          rows => `Loaded ${rows.length} successfully!`,
        )
      )
    )
  } finally {
    await client.end()
  }
})()
```

... this will output either the success message or the error message depending on the status of the result parsing.
