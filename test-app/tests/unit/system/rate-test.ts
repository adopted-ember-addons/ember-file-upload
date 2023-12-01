import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  estimatedRate,
  generateWeights,
  proportionForPosition,
} from 'ember-file-upload/internal';

module('Unit | rate', function (hooks) {
  setupTest(hooks);

  test('estimatedRate', function (assert) {
    assert.strictEqual(
      estimatedRate([80, 80, 80, 80, 80, 80, 80, 80, 80, 80]),
      80,
      'straight average up to first threshold',
    );
    assert.strictEqual(
      estimatedRate([
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 50, 50, 50, 50, 50, 50, 50, 50,
        50, 50,
      ]),
      62.00000000000003,
      'slowing down, recent values have more affect',
    );
    assert.strictEqual(
      estimatedRate([
        50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 80, 80, 80, 80, 80, 80, 80, 80,
        80, 80,
      ]),
      68,
      'speeding up, recent values have more affect',
    );
  });

  test('generateWeights', function (assert) {
    assert.deepEqual(generateWeights(1), [1], 'single weight is 1');
    assert.deepEqual(
      generateWeights(10),
      [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
      'first 10 weights evenly divided',
    );

    assert.deepEqual(
      generateWeights(20),
      [
        0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.04, 0.04,
        0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
      ],
      'proportionally even weights in each threshold',
    );

    assert.deepEqual(
      generateWeights(30),
      [
        0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05,
        0.03333333333333333, 0.03333333333333333, 0.03333333333333333,
        0.03333333333333333, 0.03333333333333333, 0.03333333333333333,
        0.03333333333333333, 0.03333333333333333, 0.03333333333333333,
        0.03333333333333333, 0.016666666666666666, 0.016666666666666666,
        0.016666666666666666, 0.016666666666666666, 0.016666666666666666,
        0.016666666666666666, 0.016666666666666666, 0.016666666666666666,
        0.016666666666666666, 0.016666666666666666,
      ],
      'proportionally even weights in each threshold',
    );
  });

  test('proportionForPosition', function (assert) {
    assert.strictEqual(proportionForPosition(1), 3, 'rate 1 high proportion');
    assert.strictEqual(proportionForPosition(10), 3, 'rate 10 high proportion');
    assert.strictEqual(proportionForPosition(11), 2, 'rate 11 med proportion');
    assert.strictEqual(proportionForPosition(20), 2, 'rate 20 med proportion');
    assert.strictEqual(proportionForPosition(21), 1, 'rate 21 low proportion');
    assert.strictEqual(proportionForPosition(30), 1, 'rate 30 low proportion');
  });
});
