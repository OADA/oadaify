/**
 * @license
 * Copyright 2022 Alex Layton
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Tests for working with JSON arrays
 *
 * @packageDocumentation
 */
import test from 'ava';

import { expectType } from 'ts-expect';

import { oadaify } from '../';

test('Should work with arrays', (t) => {
  const array = [
    <const>{
      _id: 'resources/1223',
      _rev: 2,
      _meta: {},
      foo: 'bar',
    },
    <const>{
      _id: 'resources/1223',
      _rev: 2,
      _meta: {},
      foo: 'bar',
      // TODO: How to get proper type inference on tuples?
      foo2: 'baz',
    },
  ];
  const output = oadaify(array);
  expectType<
    ReadonlyArray<{
      // Only the shared non-OADA keys
      foo: 'bar';
    }>
  >(output);
  for (const out of output) {
    const o = { ...out };
    t.like(o, { foo: 'bar' });
  }
});

// TS can get mad about const arrays if you do stuff wrong
test('Should work with const arrays', (t) => {
  const array = <const>[
    {
      _id: 'resources/1223',
      _rev: 2,
      _meta: {},
      foo: 'bar',
    },
    {
      _id: 'resources/1223',
      _rev: 2,
      _meta: {},
      foo: 'bar',
      // TODO: How to get proper type inference on tuples?
      foo2: 'baz',
    },
  ];
  const output = oadaify(array);
  expectType<
    ReadonlyArray<{
      // Only the shared non-OADA keys
      foo: 'bar';
    }>
  >(output);
  for (const out of output) {
    const o = { ...out };
    t.like(o, { foo: 'bar' });
  }
});
