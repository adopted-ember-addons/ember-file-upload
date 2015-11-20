import { moduleForComponent, test } from 'ember-qunit';
import { addFiles } from 'ember-plupload/test-helper';
import hbs from 'htmlbars-inline-precompile';

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
