/**
 * @license
 * Copyright 2022 Alex Layton
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

// This is better than Omit
import type { Except } from 'type-fest';

// TS is dumb about symbol keys
/**
 * Symbol to access OADA `_id` key
 */
export const _id: unique symbol = Symbol('_id');
/**
 * Symbol to access OADA `_rev` key
 */
export const _rev: unique symbol = Symbol('_rev');
/**
 * Symbol to access OADA `_type` key
 */
export const _type: unique symbol = Symbol('_type');
/**
 * Symbol to access OADA `_meta` key
 */
export const _meta: unique symbol = Symbol('_meta');

/**
 * @todo just declare symbols in here if TS stops being dumb about symbol keys
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const Symbols = <const>{
  _id,
  _rev,
  _type,
  _meta,
};

// Yes these are defined in type-fest, but mine are slightly different...
export type JsonObject = { [Key in string]?: JsonValue };
export type JsonArray = JsonValue[] | readonly JsonValue[];
export type JsonValue =
  | string
  | number
  | boolean
  // eslint-disable-next-line @typescript-eslint/ban-types
  | null
  | JsonObject
  | JsonArray;

type OADAified<T> = T extends JsonValue ? OADAifiedJsonValue<T> : never;

/**
 * @todo Better name
 */
export type OADAifiedJsonObject<T extends JsonObject = JsonObject> = {
  [_id]?: OADAified<T['_id']>;
  [_rev]?: OADAified<T['_rev']>;
  [_type]?: OADAified<T['_type']>;
  /**
   * @todo OADAify under _meta or not?
   */
  [_meta]?: OADAified<T['_meta']>;
} & {
  [K in keyof Except<T, keyof typeof Symbols>]: OADAified<T[K]>;
};

/**
 * @todo Better name
 */
export type OADAifiedJsonArray<T extends JsonArray = JsonArray> = Array<
  OADAifiedJsonValue<
    T extends Array<infer R> ? R : T extends ReadonlyArray<infer R> ? R : never
  >
>;

/**
 * @todo Better name
 */
export type OADAifiedJsonValue<T extends JsonValue = JsonValue> =
  T extends JsonArray
    ? OADAifiedJsonArray<T>
    : T extends JsonObject
    ? OADAifiedJsonObject<T>
    : T;

/**
 * @todo why doesn't TS figure this correctly with for ... in?
 */
export type StringKey<T extends JsonObject> = keyof T & string;

function isArray<T>(
  value: T | T[] | readonly T[]
): value is T[] | readonly T[] {
  return Array.isArray(value);
}

/**
 * Converts OADA keys (i.e., ones starting with `_`) to Symbols
 *
 * This way when looping etc. you only get actual data keys.
 * _Should_ turn itself back to original JSON for stringify, ajv, etc.
 */
export function oadaify<T extends Readonly<JsonValue>>(
  value: T,
  deep?: boolean
): OADAifiedJsonValue<T>;
export function oadaify(value: JsonValue, deep = true): OADAifiedJsonValue {
  if (!value || typeof value !== 'object') {
    // Nothing to OADAify
    return value;
  }

  if (isArray(value)) {
    // Map ourself over arrays
    return deep
      ? value.map((v) => oadaify(v)!)
      : (Array.from(value) as OADAifiedJsonArray);
  }

  const out: OADAifiedJsonObject = deep
    ? Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, oadaify(v!)!])
      )
    : ({ ...value } as unknown as OADAifiedJsonObject);

  // OADAify any OADA keys
  // Have to explicitly handle each symbol for TS to understand...
  if ('_id' in value) {
    // eslint-disable-next-line security/detect-object-injection
    out[_id] = `${value._id}`;
    Object.defineProperty(out, '_id', {
      value: value._id,
      enumerable: false,
    });
  }

  if ('_rev' in value) {
    // eslint-disable-next-line security/detect-object-injection
    out[_rev] = Number(value._rev);
    Object.defineProperty(out, '_rev', {
      value: value._rev,
      enumerable: false,
    });
  }

  if ('_type' in value) {
    // eslint-disable-next-line security/detect-object-injection
    out[_type] = `${value._type}`;
    Object.defineProperty(out, '_type', {
      value: value._type,
      enumerable: false,
    });
  }

  // TODO: Should _meta be OADAified?
  if ('_meta' in value) {
    // eslint-disable-next-line security/detect-object-injection
    out[_meta] = value._meta as OADAifiedJsonValue;
    Object.defineProperty(out, '_meta', {
      value: value._meta,
      enumerable: false,
    });
  }

  // Make the JSON still right
  Object.defineProperty(out, 'toJSON', { enumerable: false, value: toJSON });

  return out;
}

/**
 * Inverse of oadaify
 *
 * Makes OADA keys normal object properties again.
 *
 * @see oadaify
 */
export function deoadaify<T extends JsonValue>(
  value: OADAifiedJsonValue<T>
): T {
  if (!value || typeof value !== 'object') {
    return value as T;
  }

  if (Array.isArray(value)) {
    return value.map((v) => deoadaify<JsonValue>(v)) as unknown as T;
  }

  const out = Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, deoadaify<JsonValue>(v)])
  );

  // Add OADA keys
  if (Object.prototype.hasOwnProperty.call(value, _id)) {
    // eslint-disable-next-line security/detect-object-injection
    out._id = value[_id]!;
  }

  if (Object.prototype.hasOwnProperty.call(value, _rev)) {
    // eslint-disable-next-line security/detect-object-injection
    out._rev = value[_rev]!;
  }

  if (Object.prototype.hasOwnProperty.call(value, _type)) {
    // eslint-disable-next-line security/detect-object-injection
    out._type = value[_type]!;
  }

  if (Object.prototype.hasOwnProperty.call(value, _meta)) {
    // eslint-disable-next-line security/detect-object-injection
    out._meta = value[_meta]!;
  }

  return out as T;
}

/**
 * Makes the OADA keys reappear for JSON.stringify
 */
function toJSON(this: OADAifiedJsonObject) {
  return deoadaify(this);
}

export default oadaify;
