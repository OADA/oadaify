/**
 * @license
 * Copyright 2022 Alex Layton
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * Tests for playing nicely with JSON, ajv, etc.
 *
 * @packageDocumentation
 */

import test from 'ava';

import { _id, oadaify } from '../';

test('shallow', (t) => {
  const object = {
    _id: '123',
    _meta: {},
    foo: {
      _id: '456',
      bar: 'baz',
    },
  };
  const result = oadaify(object, false);
  t.false(_id in result.foo);
});

test('deep', (t) => {
  const object = {
    _id: '123',
    _meta: {},
    foo: {
      _id: '456',
      bar: 'baz',
    },
  };
  const result = oadaify(object, true);
  t.true(_id in result.foo);
});
