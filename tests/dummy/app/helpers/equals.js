import Ember from 'ember';

export default Ember.Helper.helper(function ([a, b]) {
  return a === b;
});
