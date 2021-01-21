/**
 * Tests for working with JSON primitives
 *
 * @packageDocumentation
 */
import test from 'ava';

import { expectType } from 'ts-expect';

import { oadaify } from '../';

test('Should work with strings', (t) => {
  const s = oadaify('foobar');
  expectType<'foobar'>(s);
  t.is(s, 'foobar');
});

// Check falsy
test('Should work with empty string', (t) => {
  const se = oadaify('');
  expectType<''>(se);
  t.is(se, '');
});

test('Should work with numbers', (t) => {
  const n = oadaify(1);
  expectType<1>(n);
  t.is(n, 1);
});

// Check falsy
test('Should work with 0', (t) => {
  const nz = oadaify(0);
  expectType<0>(nz);
  t.is(nz, 0);
});

test('Should work with true', (t) => {
  const b = oadaify(true);
  expectType<true>(b);
  t.is(b, true);
});

test('Should work with false', (t) => {
  const bf = oadaify(false);
  expectType<false>(bf);
  t.is(bf, false);
});

// Check falsy
test('Should work with null', (t) => {
  const nil = oadaify(null);
  expectType<null>(nil);
  t.is(nil, null);
});
