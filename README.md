# @OADA/oadaify

A library to make working with OADA data in JavaScript/TypeScript less annoying.

I was always writing loops with checks to skip `_` keys,
or forgetting to add the check and my code did something weird.
This makes loops etc. do what one expects and wants 99% of the time.
The library exports `Symbol`s which can be used to access the OADA keys.

The OADAified objects still function correctly with `JSON.stringify` and `ajv`.
There is a deoadaify function in the case you need to put it back.

Be warned though, TypeScript is... quirky about `Symbol` keys in objects.
You should mostly be fine, but sometimes it will get dumb on you.

## Example

```typescript
import {
  oadaify,
  // Symbol for accessing `_id`
  _id,
} from '@oada/oadaify';

// Some data from an OADA API
const data = {
  _id: 'resources/123',
  _rev: 1,
  _type: 'application/foo+json',
  foo: 'bar',
  baz: 7,
};

// OADAify the data
const oadaified = oadaify(data);

// Makes loops etc only get non OADA keys
console.log(Object.entries(oadaified)); // [['foo', 'bar'], ['baz', 7]]

// The OADA keys are not gone
console.log(oadaified[_id]); // 'resources/123'

// JSON is still original OADA data
console.log(JSON.stringify(oadaified, null, 2));
/*
{
  "_id": "resources/123",
  "_rev": 1,
  "_type": "application/foo+json",
  "foo": "bar",
  "baz": 7,
}
*/
```
