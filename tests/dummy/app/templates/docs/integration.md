# Integration

The addon calls `onFileAdd` when a file is queued for upload. You may trigger the upload by calling the `upload` function on the file, which returns a promise that is resolved when the file has finished uploading and is rejected if the file couldn't be uploaded.

```hbs
<FileUpload
  @name="photos"
  @accept="image/*"
  @onFileAdd={{perform this.uploadPhoto}}
  as |queue|
>
  <a tabindex="0">
    {{#if queue.files.length}}
      Uploading...
    {{else}}
      Upload file
    {{/if}}
  </a>
</FileUpload>
```

```javascript
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class ExampleComponent extends Component {
  @service store;

  @task({ maxConcurrency: 3, enqueue: true })
  *uploadPhoto(file) {
    const { product } = this.args;
    const photo = this.store.createRecord('photo', {
      product,
      fileName: file.name,
      fileSize: file.size,
    });

    try {
      const url = yield file.readAsDataURL();
      if (!photo.url) {
        photo.url = url;
      }

      const response = yield file.upload('/api/images/upload');
      photo.url = response.headers.Location;
      yield photo.save();
    } catch (e) {
      photo.rollback();
    }
  }
}
```

## Access to the global list of uploading files

`ember-file-upload` exposes a service called `fileQueue` that exposes aggregate information on files being uploaded in your app.

A common scenario is to alert users that they still have pending uploads when they are about to leave the page. To do this, look at `fileQueue.files.length` to see if there's any files uploading.

In addition to the file list, there are properties that indicate how many bytes have been uploaded (`loaded`), the total size of all files in bytes (`size`), and the progress of all files (`progress`). Using these, you may implement a global progress bar indicating files that are uploading in the background.
