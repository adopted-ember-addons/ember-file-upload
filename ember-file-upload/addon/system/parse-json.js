import { assert } from '@ember/debug';

export default function parseJSON(string) {
  let json = null;
  try {
    json = JSON.parse(string);
  } catch (e) {
    assert(`Invalid JSON: ${string}`);
  }
  return json;
}
