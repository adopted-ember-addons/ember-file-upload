import { assert } from '@ember/debug';

export default function parseJSON(jsonString: string) {
  let json = null;
  try {
    json = JSON.parse(jsonString);
  } catch (e) {
    assert(`Invalid JSON: ${jsonString}`);
  }
  return json;
}
