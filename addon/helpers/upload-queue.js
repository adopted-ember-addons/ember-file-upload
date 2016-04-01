import Ember from 'ember';

const { get } = Ember;
const { service } = Ember.inject;

export default Ember.Helper.extend({

  uploader: service(),

  compute(_, hash) {
    let uploader = get(this, 'uploader');
    let queueName = hash['for'];
    if (queueName) {
      delete hash['for'];
      return uploader.findOrCreate(queueName, hash);
    }

    return uploader;
  }
});
