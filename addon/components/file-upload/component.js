import { assert } from '@ember/debug';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  getProperties,
  setProperties,
  computed,
  get
} from '@ember/object';
import layout from './template';
import uuid from '../../system/uuid';

const VALID_TAGS = ['a', 'abbr', 'area', 'audio', 'b', 'bdo', 'br', 'canvas', 'cite',
                    'code', 'command', 'datalist', 'del', 'dfn', 'em', 'embed', 'i',
                    'iframe', 'img', 'kbd', 'mark', 'math', 'noscript', 'object', 'q',
                    'ruby', 'samp', 'script', 'small', 'span', 'strong', 'sub', 'sup',
                    'svg', 'time', 'var', 'video', 'wbr',
                    'path', 'g', 'use', 'circle'];

/**
  `{{file-upload}}` is an element that will open a dialog for
  users to browse their device for files that they want to upload.

  For the component to work at its best, each `{{file-upload}}`
  should be named so the upload can be persisted across pages and
  show the correct upload percentage when a user visits the page.

  For a basic use-case of uploading a file after a form is submitted,
  you can stash the file for later and upload it on the submission of
  the form.

  For this example, we'll look at a relatively standard profile form
  using [`ember-changeset`](https://github.com/DockYard/ember-changeset) to keep track of changes made to the form:

  ```htmlbars
  {{#with (changeset model) as |changeset|}}
    <form submit={{action 'submit' changeset}}>
      <label for='name'>
      {{input type='string' value=changeset.name id='name'}}

      {{#file-upload name="avatar"
                     accept="image/*"
                     onfileadd=(route-action 'setAvatar' changeset)}}
        {{#if changeset.avatar}}
          <img src={{changeset.avatar.url}}
          <a id="upload-avatar" tabindex=0>Add a photo of yourself</a>
        {{else}}
          <a id="upload-avatar" tabindex=0>Add a photo of yourself</a>
        {{/if}}
      {{/file-upload}}
    </form>
  {{/with}}
  ```

  ```js
  import Ember from 'ember';

  export default Ember.Route.extend({
    actions: {
      submit: async function (changeset) {
        if (changeset.avatar) {
          let file = changeset.avatar;
          let response = await file.upload('/upload');
          changeset.set('avatar', {
            name: file.get('name'),
            url: response.headers.Location
          });
        }
        this.currentModel.setProperties(changeset.get('change'));

        return this.currentModel.save();
      },
      setAvatar: async function (changeset, file) {
        changeset.set('avatar', file);

        // Set the URL so we can see a preview
        let url = await file.readAsDataURL();
        file.set('url', url);
      }
    }
  });
  ```

  @class file-upload
  @type Ember.Component
 */
export default Component.extend({
  tagName: 'label',
  classNames: ['file-upload'],

  attributeBindings: ['for'],

  for: computed({
    get() {
      return `file-input-${uuid.short()}`;
    }
  }),

  layout,

  /**
    A list of MIME types / extensions to be accepted by the input
    @attribute accept
    @type string
   */
  accept: null,

  /**
    Whether multiple files can be selected when uploading.
    @attribute multiple
    @type boolean
   */
  multiple: null,

  /**
    The name of the queue to upload the file to.

    @attribute name
    @type string
    @required
   */
  name: null,

  /**
    If set, disables input and prevents files from being added to the queue

    @attribute disabled
    @type boolean
    @default false
   */
  disabled: false,

  /**
    `onfileadd` is called when a file is selected.

    When multiple files are selected, this function
    is called once for every file that was selected.

    @attribute onfileadd
    @type function
    @required
   */
  onfileadd: null,

  fileQueue: service(),

  didReceiveAttrs() {
    if (get(this, 'queue')) {
      setProperties(get(this, 'queue'), getProperties(this, 'accept', 'multiple', 'disabled', 'onfileadd'));
    }
  },

  queue: computed('name', {
    get() {
      let queueName = get(this, 'name');
      if (queueName != null) {
        let queues = get(this, 'fileQueue');
        return queues.find(queueName) ||
               queues.create(queueName);
      }
    }
  }),

  didInsertElement() {
    let id = get(this, 'for');
    assert(`Changing the tagName of {{file-upload}} to "${get(this, 'tagName')}" will break interactions.`, get(this, 'tagName') === 'label');
    this.$('*').each(function (_, element) {
      if (element.id !== id &&
          VALID_TAGS.indexOf(element.tagName.toLowerCase()) === -1) {
        assert(`"${element.outerHTML}" is not allowed as a child of {{file-upload}}.`);
      }
    });
  },

  actions: {
    change(files) {
      get(this, 'queue')._addFiles(files, 'browse');
      this.$().children('input').val(null);
    }
  }
});
