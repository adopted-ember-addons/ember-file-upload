import { assert } from '@ember/debug';
import BaseComponent from '../base-component';
import { DEBUG } from '@glimmer/env';
import { computed } from '@ember/object';
import { deprecatingAlias } from '@ember/object/computed';
import layout from './template';
import uuid from '../../system/uuid';

/**
  `FileUpload` is a component that will open a dialog for
  users to browse their device for files that they want to upload.

  For the component to work at its best, each `FileUpload`
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

      <FileUpload @name="avatar"
                  @accept="image/*"
                  @onFileAdd={{fn this.setAvatar changeset}}>
        {{#if changeset.avatar}}
          <img src={{changeset.avatar.url}} />
          <a id="upload-avatar" tabindex=0>Add a photo of yourself</a>
        {{else}}
          <a id="upload-avatar" tabindex=0>Add a photo of yourself</a>
        {{/if}}
      </FileUpload>
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
    A comma-separated list of MIME types / extensions to be accepted by the input, as documented here https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
    @argument accept
    @type {string}
   */
  accept: null,

  /**
    `onFileAdd` is called when a file is selected.

    When multiple files are selected, this function
    is called once for every file that was selected.

    @argument onFileAdd
    @type {function}
    @required
   */
  onFileAdd: null,
  onfileadd: deprecatingAlias('onFileAdd', {
    id: 'ember-file-upload.deprecate-non-camel-case-events',
    until: '5.0.0',
  }),

  for: computed({
    get() {
      return `file-input-${uuid.short()}`;
    },
    set(key, value) {
      return value;
    },
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
      this.queue._addFiles(files, 'browse');
      this.element.querySelector('input').value = null;
    },
  },
});

if (DEBUG) {
  const VALID_TAGS = [
    'a',
    'abbr',
    'area',
    'audio',
    'b',
    'bdo',
    'br',
    'canvas',
    'cite',
    'circle',
    'clipPath',
    'code',
    'command',
    'datalist',
    'del',
    'dfn',
    'em',
    'embed',
    'i',
    'iframe',
    'img',
    'kbd',
    'line',
    'mark',
    'mask',
    'math',
    'noscript',
    'object',
    'q',
    'radialGradient',
    'rect',
    'ruby',
    'samp',
    'script',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'svg',
    'time',
    'var',
    'video',
    'wbr',
    'path',
    'polygon',
    'polyline',
    'g',
    'use',
  ];

  component.reopen({
    didInsertElement() {
      let id = this.for;
      assert(
        `Changing the tagName of FileUpload to "${this.tagName}" will break interactions.`,
        this.tagName === 'label'
      );
      let elements = this.element.querySelectorAll('*');
      for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        if (
          element.id !== id &&
          VALID_TAGS.indexOf(element.tagName.toLowerCase()) === -1
        ) {
          assert(
            `"${element.outerHTML}" is not allowed as a child of FileUpload.`
          );
        }
      }
    },
  });
}

export default component;
