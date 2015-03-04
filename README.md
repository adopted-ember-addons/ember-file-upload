# {{pl-uploader}} [![Build Status](https://travis-ci.org/paddle8/ember-plupload.svg)](https://travis-ci.org/paddle8/ember-plupload) [![Code Climate](https://codeclimate.com/github/paddle8/ember-plupload/badges/gpa.svg)](https://codeclimate.com/github/paddle8/ember-plupload)

{{pl-uploader}} is an ember component that provides an API for [Plupload](http://www.plupload.com/). Uploads are long lived in the application, and will happen in the background if the user leaves the page where they're uploading files.

To use the uploader, you must provide a name (for proper queueing and bundling of resources), and an upload URL.

For example:
```handlebars
{{#pl-uploader action="https://my-bucket.s3.amazonaws.com:443/" multipart-params=myAWSCredentials for="my-browse-button" when-queued="uploadAvatar"}}
  <h4>Upload avatar</h4>
  <a id="my-browse-button">Add Avatar</a>
{{/pl-uploader}}
```

## Configuration

The `{{pl-uploader}}` component exposes a variety of parameters for configuring plupload:


| Attribute           | Definition
|---------------------|------------------|
| `action`            | the URL to send the upload request to
| `for`               | the ID of the browse button
| `extensions`        | a space-separated list of allowed file extensions
| `multipart-params`  | multipart params to send along with the upload
| `max-file-size`     | the maximum size of file uploads
| `no-duplicates`     | disallow duplicate files (determined by matching the file's name and size)
| `chunk-size`        | the chunk size to split the file into when sending to the server


## Integration

If your application doesn't use an assets folder, or serves assets from a different domain, you will need to add a PLUPLOAD_BASE_URL to your configuration file.

The addon emits an event when a file is queued for upload. You may trigger the upload by calling the `upload` function on the file, which returns a promise that is resolved when the file has finished uploading and is rejected if the file couldn't be uploaded.

```javascript
import Ember from "ember";

const get = Ember.get;
const set = Ember.set;

export default Ember.Route.extend({

  actions: {
    uploadAvatar: function (file) {
      var user = this.modelFor('user');
      var avatar = this.store.createRecord('avatar', {
        filename: get(file, 'name'),
        filesize: get(file, 'size'),
        file: file
      });

      file.upload().then(function (response) {
        set(avatar, 'remoteUrl', response.headers.Location);
        return avatar.save();
      }, function () {
        avatar.rollback();
      }).finally(function () {
        set(avatar, 'file', null);
      });
    }
  }

});
```

## Installation

* `ember install:addon ember-plupload`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
