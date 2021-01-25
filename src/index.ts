// This is better than Omit
import type { Except, Mutable } from 'type-fest';

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
 * @todo just declare symbols in here is TS stops being dumb about symbol keys
 */
export const Symbols = <const>{
  _id,
  _rev,
  _type,
  _meta,
};

// Yes these are defined in type-fest, but mine are slightly different...
export type JsonObject = { [Key in string]?: JsonValue };
export type JsonArray = readonly JsonValue[];
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

type OADAified<T> = T extends JsonValue ? OADAifiedJsonValue<T> : never;

/**
 * @todo Better name
 */
export type OADAifiedJsonObject<T extends JsonObject = JsonObject> = {
  [_id]: OADAified<T['_id']>;
  [_rev]: OADAified<T['_rev']>;
  [_type]: OADAified<T['_type']>;
  /**
   * @todo OADAify under _meta or not?
   */
  [_meta]: OADAified<T['_meta']>;
} & {
  [K in keyof Except<T, keyof typeof Symbols>]: OADAified<T[K]>;
};

/**
 * @todo Better name
 */
export type OADAifiedJsonArray<
  T extends JsonArray = JsonArray
> = readonly OADAifiedJsonValue<T extends readonly (infer R)[] ? R : never>[];

/**
 * @todo Better name
 */
export type OADAifiedJsonValue<
  T extends JsonValue = JsonValue
> = T extends JsonArray
  ? OADAifiedJsonArray<T>
  : T extends JsonObject
  ? OADAifiedJsonObject<T>
  : T;

/**
 * @todo why doesn't TS figure this correctly with for ... in?
 */
export type StringKey<T extends JsonObject> = keyof T & string;

/**
 * Converts OADA keys (i.e., ones starting with `_`) to Symbols
 *
 * This way when looping etc. you only get actual data keys.
 * _Should_ turn itself back to original JSON for stringify, ajv, etc.
 */
export function oadaify<T extends JsonValue>(
  value: T
): Mutable<OADAifiedJsonValue<T>>;
export function oadaify(
  value: Readonly<JsonValue>
): Mutable<OADAifiedJsonValue<JsonValue>> {
  if (!value || typeof value !== 'object') {
    // Nothing to OADAify
    return value;
  }

  if (Array.isArray(value)) {
    // Map outself over arrays
    return (value as JsonArray).map((val) => {
      const out = oadaify(val);
      return out;
    });
  }

  // TODO: Why is TS being dumb and thinking it can be an array here?
  const obj = value as JsonObject;
  const out = {} as OADAifiedJsonObject<JsonObject>;
  for (const key in obj) {
    // Recurse
    out[key] = oadaify(obj[key]!);
  }
  // Preserve symbols
  for (const sym of Object.getOwnPropertySymbols(obj)) {
    // TS is a jerk about symbol indexing. This line is prefectly vaild.
    // @ts-ignore
    out[sym] = obj[sym];
  }

  // OADAify any OADA keys
  // Have to explicitly handle each symbol for TS to understand...
  if (out.hasOwnProperty('_id')) {
    out[_id] = out._id + '';
    Object.defineProperty(out, '_id', { enumerable: false });
  }
  if (out.hasOwnProperty('_rev')) {
    out[_rev] = +out._rev!;
    Object.defineProperty(out, '_rev', { enumerable: false });
  }
  if (out.hasOwnProperty('_type')) {
    out[_type] = out._type + '';
    Object.defineProperty(out, '_type', { enumerable: false });
  }
  if (out.hasOwnProperty('_meta')) {
    out[_meta] = out._meta as OADAified<JsonObject>;
    Object.defineProperty(out, '_meta', { enumerable: false });
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
): Mutable<T>;
export function deoadaify(value: OADAifiedJsonValue): Mutable<JsonValue> {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deoadaify);
  }

  const out: JsonObject = {};
  // TODO: Why is TS being dumb and thinking it can be an array here?
  const obj = value as OADAifiedJsonObject<JsonObject>;
  for (const [key, val] of Object.entries(obj)) {
    out[key] = deoadaify<JsonValue>(val);
  }
  // Add OADA keys
  if (obj.hasOwnProperty(_id)) {
    out._id = obj[_id];
  }
  if (obj.hasOwnProperty(_rev)) {
    out._rev = obj[_rev];
  }
  if (obj.hasOwnProperty(_type)) {
    out._type = obj[_type];
  }
  if (obj.hasOwnProperty(_meta)) {
    out._meta = obj[_meta];
  }

  return out;
}

/**
 * Makes the OADA keys reappear for JSON.stringify
 */
function toJSON(this: OADAifiedJsonObject<JsonObject>) {
  return deoadaify(this);
}

export default oadaify;
