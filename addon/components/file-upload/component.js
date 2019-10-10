import { assert } from '@ember/debug';
import BaseComponent from '../base-component';
import { DEBUG } from '@glimmer/env';
import {
  computed,
  get
} from '@ember/object';
import layout from './template';
import uuid from '../../system/uuid';

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

  ```hbs
  {{#with (changeset model) as |changeset|}}
    <form submit={{action 'submit' changeset}}>
      <label for='name'>
      {{input type='string' value=changeset.name id='name'}}

      {{#file-upload name="avatar"
                     accept="image/*"
                     onfileadd=(action 'setAvatar' changeset)}}
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
  import Controller from '@ember/controller';

  export default Controller.extend({
    actions: {
      submit(changeset) {
        if (changeset.avatar) {
          let file = changeset.avatar;
          file.upload('/upload').then((response) => {
            changeset.set('avatar', {
              name: file.get('name'),
              url: response.headers.Location
            });
          });
        }

        this.currentModel.setProperties(changeset.get('change'));
        return this.currentModel.save();
      },

      setAvatar(changeset, file) {
        changeset.set('avatar', file);

        // Set the URL so we can see a preview
        file.readAsDataURL().then((url) => {
          changeset.set('url', url);
        });
      }
    }
  });
  ```

  @class FileUpload
  @type Ember.Component
  @yield {Queue} queue
 */
const component = BaseComponent.extend({
  tagName: 'label',
  classNames: ['file-upload'],

  attributeBindings: ['for'],

  /**
    Whether multiple files can be selected when uploading.
    @argument multiple
    @type {boolean}
   */
  multiple: null,

  /**
    The name of the queue to upload the file to.

    @argument name
    @type {string}
    @required
   */
  name: null,

  /**
    If set, disables input and prevents files from being added to the queue

    @argument disabled
    @type {boolean}
    @default false
   */
  disabled: false,


  /**
    A list of MIME types / extensions to be accepted by the input
    @argument accept
    @type {string}
   */
  accept: null,

  /**
    `onfileadd` is called when a file is selected.

    When multiple files are selected, this function
    is called once for every file that was selected.

    @argument onfileadd
    @type {function}
    @required
   */
  onfileadd: null,

  for: computed({
    get() {
      return `file-input-${uuid.short()}`;
    },
    set(key, value) {
      return value;
    }
  }),

  layout,

  /**
    Specify capture devices which the user may select for file input.
    @see https://www.w3.org/TR/html-media-capture/
    @argument capture
    @type {string}
   */
  capture: null,

  actions: {
    change(files) {
      get(this, 'queue')._addFiles(files, 'browse');
      this.element.querySelector('input').value = null;
    }
  }
});

if (DEBUG) {
  const VALID_TAGS = ['a', 'abbr', 'area', 'audio', 'b', 'bdo', 'br', 'canvas',
    'cite', 'circle', 'clipPath', 'code', 'command', 'datalist', 'del', 'dfn',
    'em', 'embed', 'i', 'iframe', 'img', 'kbd', 'line', 'mark', 'mask', 'math',
    'noscript', 'object', 'q', 'radialGradient', 'rect', 'ruby', 'samp',
    'script', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'time', 'var',
    'video', 'wbr', 'path', 'polygon', 'polyline',
    'g', 'use'];

  component.reopen({
    didInsertElement() {
      let id = get(this, 'for');
      assert(`Changing the tagName of {{file-upload}} to "${get(this, 'tagName')}" will break interactions.`, get(this, 'tagName') === 'label');
      let elements = this.element.querySelectorAll('*');
      for (let i = 0; i < elements.length; i++){
        let element = elements[i];
        if (element.id !== id &&
            VALID_TAGS.indexOf(element.tagName.toLowerCase()) === -1) {
          assert(`"${element.outerHTML}" is not allowed as a child of {{file-upload}}.`);
        }
      }
    }
  });
}

export default component;
