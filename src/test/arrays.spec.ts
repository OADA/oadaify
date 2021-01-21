/**
 * Tests for working with JSON arrays
 *
 * @packageDocumentation
 */
import test from 'ava';

import { expectType } from 'ts-expect';

import { oadaify } from '../';

test('Should work with arrays', (t) => {
  const arr = [
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
  const output = oadaify(arr);
  expectType<
    {
      // Only the shared non-OADA keys
      foo: 'bar';
    }[]
  >(output);
  for (const out of output) {
    const o: any = {};
    for (const key in out) {
      o[key] = out[key as keyof typeof out];
    }
    t.like(o, { foo: 'bar' });
  }
});

// TS can get mad about const arrays if you do stuff wrong
test('Should work with const arrays', (t) => {
  const arr = <const>[
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
  const output = oadaify(arr);
  expectType<
    readonly {
      // Only the shared non-OADA keys
      foo: 'bar';
    }[]
  >(output);
  for (const out of output) {
    const o: any = {};
    for (const key in out) {
      o[key] = out[key as keyof typeof out];
    }
    t.like(o, { foo: 'bar' });
  }
});
