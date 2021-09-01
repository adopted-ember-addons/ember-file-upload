import BaseComponent from './base-component';
import { action } from '@ember/object';
import uuid from '../system/uuid';
import { tracked } from '@glimmer/tracking';

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
import { tracked } from '@glimmer/tracking';

  export default Controller.extend({
    actions: {
      submit(changeset) {
        if (changeset.avatar) {
          let file = changeset.avatar;
          file.upload('/upload').then((response) => {
            changeset.set('avatar', {
              name: file.name,
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

  @class FileUploadComponent
  @yield {Queue} queue
 */
export default class FileUploadComponent extends BaseComponent {
  /**
    Whether multiple files can be selected when uploading.
    @argument multiple
    @type {boolean}
   */

  /**
    The name of the queue to upload the file to.

    @argument name
    @type {string}
    @required
   */

  /**
    If set, disables input and prevents files from being added to the queue

    @argument disabled
    @type {boolean}
    @default false
   */

  /**
    A comma-separated list of MIME types / extensions to be accepted by the input, as documented here https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
    @argument accept
    @type {string}
   */

  /**
    `onFileAdd` is called when a file is selected.

    When multiple files are selected, this function
    is called once for every file that was selected.

    @argument onFileAdd
    @type {function}
    @required
   */

  get for() {
    return this.args.for || `file-input-${uuid.short()}`;
  }

  /**
    Specify capture devices which the user may select for file input.
    @see https://www.w3.org/TR/html-media-capture/
    @argument capture
    @type {string}
   */

  @tracked _value = null;

  @action
  change(event) {
    const { files } = event.target;
    this.queue._addFiles(files, 'browse');
    this._value = null;
  }
}
