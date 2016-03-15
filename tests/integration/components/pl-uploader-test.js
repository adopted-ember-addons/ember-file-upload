import { moduleForComponent, test } from 'ember-qunit';
import { addFiles } from 'ember-plupload/test-helper';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent('pl-uploader', {
  integration: true
});

test('addFiles test helper integration', function(assert) {
  this.on('uploadIt', (file) => {
    file.upload();
  });

  this.render(hbs`
    {{#pl-uploader name='uploader' onfileadd='uploadIt' for='upload-image' as |queue|}}
      <div id="file-count">{{queue.length}}</div>
      <div id="file-progress">{{queue.progress}}</div>
      <div id="upload-image">Upload Image</div>
    {{/pl-uploader}}
  `);

  let file = addFiles(this.container, 'uploader', {
    name: 'Cat Eating Watermelon.png',
    size: 2048
  })[0];

  assert.equal(this.$('#file-count').text(), '1');

  assert.equal(this.$('#file-progress').text(), '0');
  file.progress = 80;
  assert.equal(this.$('#file-progress').text(), '80');

  file.respondWith(200, { 'Content-Type': 'application/json' }, {});
  assert.equal(this.$('#file-count').text(), '0');
});

test('errors with read()', function(assert){
  this.on('makeItError', (file) => {
    file.read().catch((error) => {
      this.set('error', error);
    });
  });

  this.render(hbs`
    <div class='error'>{{error}}</div>
    {{#pl-uploader name='uploader' onfileadd='makeItError' for='upload-image' as |queue|}}
      <div id="upload-image">Upload Image</div>
    {{/pl-uploader}}
  `);

  addFiles(this.container, 'uploader', {
    name: 'Cat Eating Watermelon.png',
    size: 2048,
    dataURL: Ember.RSVP.reject('really nasty error')
  });

  assert.equal(this.$('.error').text(), 'really nasty error');
});

test('it works with read()', function(assert){
  this.on('makeItWork', (file) => {
    file.read().then( (url) => {
      this.set('cat', url);
    });
  });

  this.render(hbs`
    {{#pl-uploader name='uploader' onfileadd='makeItWork' for='upload-image' as |queue|}}
      <div id="upload-image">Upload Image</div>
    {{/pl-uploader}}
    <img src='{{cat}}' />
  `);

  addFiles(this.container, 'uploader', {
    name: 'Cat Eating Watermelon.png',
    size: 2048,
    dataURL: Ember.RSVP.resolve('data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=')
  });

  assert.equal(this.$('img').attr('src'), 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=');
});

test('no source is provided', function(assert){
  this.on('makeItWork', function(file) {
    assert.throws( function() {
      file.read({ as: 'text' });
    }, /Cat Eating Watermelon.*text/);
  });

  this.render(hbs`
    {{#pl-uploader name='uploader' onfileadd='makeItWork' for='upload-image' as |queue|}}
      <div id="upload-image">Upload Image</div>
    {{/pl-uploader}}
  `);

  addFiles(this.container, 'uploader', {
    name: 'Cat Eating Watermelon.png',
    size: 2048
  });
});
