/**
 * Tests for proper behavior of OADA keys
 *
 * @packageDocumentation
 */

import test from 'ava';

import type { JsonObject } from 'type-fest';
import { expectType } from 'ts-expect';

import { StringKey, oadaify, _id } from '../';

test('should allow accessing OADA keys via symbol', (t) => {
  const input = <const>{
    _id: 'resources/123',
  };
  const output = oadaify(input);
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
  const o: JsonObject = {};
  for (const key in output) {
    // TODO: Why doesn't TS realize key it keyof output??
    const k = key as StringKey<typeof output>;
    expectType<'foo' | 'foo2'>(k);
    o[k] = output[k];
  }
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
  // @ts-expect-error
  expectType<{ foo: 'bar'; foo2: 'baz'; _id: string }>(output);
  t.pass();
});
