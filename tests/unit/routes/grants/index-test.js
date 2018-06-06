import { moduleFor, test } from 'ember-qunit';

moduleFor('route:grants/index', 'Unit | Route | grants/index', {
  // Specify the other units that are required for this test.
  needs: ['service:currentUser']
});

test('it exists', function (assert) {
  let route = this.subject();
  assert.ok(route);
});
