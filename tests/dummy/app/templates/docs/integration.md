# Integration

The addon emits an event when a file is queued for upload. You may trigger the upload by calling the `upload` function on the file, which returns a promise that is resolved when the file has finished uploading and is rejected if the file couldn't be uploaded.

```javascript
import Ember from 'ember';
import { task } from 'ember-concurrency';

const { get, set } = Ember;

export default Ember.Route.extend({

  uploadPhoto: task(function * (file) {
    let product = this.modelFor('product');
    let photo = this.store.createRecord('photo', {
      product,
      filename: get(file, 'name'),
      filesize: get(file, 'size')
    });

    try {
      file.readAsDataURL().then(function (url) {
        if (get(photo, 'url') == null) {
          set(photo, 'url', url);
        }
      });

      let response = yield file.upload('/api/images/upload');
      set(photo, 'url', response.headers.Location);
      yield photo.save();
    } catch (e) {
      photo.rollback();
    }
  }).maxConcurrency(3).enqueue(),

  actions: {
    uploadImage(file) {
      get(this, 'uploadPhoto').perform(file);
    }
  }
});
```

## Access to the global list of uploading files

`ember-file-upload` exposes a service called `fileQueue` that exposes aggregate information on files being uploaded in your app.

A common scenario is to alert users that they still have pending uploads when they are about to leave the page. To do this, look at `fileQueue.get('files.length')` to see if there's any files uploading.

In addition to the file list, there are properties that indicate how many bytes have been uploaded (`loaded`), the total size of all files in bytes (`size`), and the progress of all files (`progress`). Using these, you may implement a global progress bar indicating files that are uploading in the background.
