/**
 * Tests for playing nicely with JSON, ajv, etc.
 *
 * @packageDocumentation
 */

import test from 'ava';

import Ajv from 'ajv';

import { JSONSchema8 as Schema } from 'jsonschema8';

import { oadaify } from '../';

test('should be idempotent', (t) => {
  const input = <const>{
    _id: 'resources/1223',
    _rev: 2,
    _meta: {},
    foo: 'bar',
    foo2: 'baz',
  };
  const output1 = oadaify(input);
  const output2 = oadaify(output1);
  t.deepEqual(output1, output2);
});

test('should include OADA keys in JSON', (t) => {
  const input = {
    _id: 'resources/123',
    _rev: 0,
    foo: 'bar',
    baz: {
      _id: 'resources/456',
    },
  };
  const output = oadaify(input);
  const json = JSON.parse(JSON.stringify(output));
  t.deepEqual(json, input);
});

test('should work right with ajv', (t) => {
  const input = <const>{
    _id: 'resources/123',
    _rev: 1,
    foo: 'bar',
  };
  const schema: Schema = {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      _rev: { type: 'integer' },
      foo: { const: 'bar' },
    },
    required: ['_id', '_rev', 'foo'],
  };
  const output = oadaify(input);
  const ajv = new Ajv();
  t.true(ajv.validate(schema, output), ajv.errorsText());
});
