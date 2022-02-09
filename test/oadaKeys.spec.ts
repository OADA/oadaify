/**
 * @license
 * Copyright 2022 Alex Layton
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Tests for proper behavior of OADA keys
 *
 * @packageDocumentation
 */

import test from 'ava';

import { expectType } from 'ts-expect';

import { StringKey, _id, oadaify } from '../';

test('should allow accessing OADA keys via symbol', (t) => {
  const input = <const>{
    _id: 'resources/123',
  };
  const output = oadaify(input);
  // eslint-disable-next-line security/detect-object-injection
  t.is(output[_id], input._id);
});

test('OADA keys should not appear in loop', (t) => {
  const input = <const>{
    _id: 'resources/1223',
    _rev: 2,
    _meta: {},
    foo: 'bar',
    foo2: 'baz',
  };
  const output = oadaify(input);
  expectType<{ foo: 'bar'; foo2: 'baz' }>(output);
  const o = Object.fromEntries(
    Object.entries(output).map(([key, v]) => {
      // TODO: Why doesn't TS realize key it keyof output??
      const k = key as StringKey<typeof output>;
      expectType<'foo' | 'foo2'>(k);
      return [k, v];
    })
  );

  t.deepEqual(o, { foo: 'bar', foo2: 'baz' });
});

test('OADA keys should not appear in output type', (t) => {
  const input = <const>{
    _id: 'resources/1223',
    _rev: 2,
    _meta: {},
    foo: 'bar',
    foo2: 'baz',
  };
  const output = oadaify(input);
  expectType<{ foo: 'bar'; foo2: 'baz' }>(output);
  t.pass();
});
