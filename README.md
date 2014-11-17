# {{pl-uploader}}

{{pl-uploader}} is an ember component that provides an API for Plupload. Uploads are long lived in the application, and will happen in the background if the user leaves the page where they're uploading files.

To use the uploader, you must provide a name (for proper queueing and bundling of resources), an upload URL, optional parameters, and data.

For example:
```handlebars
{{#pl-uploader action="https://my-bucket.s3.amazonaws.com:443/" params=myAWSCredentials data=dataToBePassedToActionHandler for="my-browse-button"}}
  <h4>Upload documents</h4>
  <a id="my-browse-button">Add Files</a>
{{/pl-uploader}}
```

## Configuration

The `{{pl-uploader}}` component exposes a variety of parameters available to plupload itself. The public fields are:


| Attribute       | Definition
|-----------------|------------------|
| `action`        | the URL to send the upload request to
| `extensions`    | a space-separated list of extensions to allow users to pick from
| `params`        | multipart params to send along with the upload
| `max-file-size` | the maximum size of the file to allow users to upload
| `no-duplicates` | disallow duplicated files (determined by matching the file's name and size)
| `chunk-size`    | the chunk size to split the file into when sending to the server


## Integration

If your application doesn't use an assets folder, or serves assets from a different domain, you will need to add a PLUPLOAD_BASE_URL to your configuration file.

The addon emits events when files are queued, uploaded, and failure. You may configure these per component by setting `when-queued`, `when-uploaded`, and `when-failed`. These actions default to `fileQueued`, `fileUploaded`, and `fileUploadFailed`.

To handle these events, simply implement the action on the route of your choosing. Since these events may be triggered in *any* route, it is recommended that you put these actions on a root route (eg. ApplicationRoute).

```javascript
import Ember from "ember";

var get = Ember.get;
var set = Ember.set;

var ApplicationRoute = Ember.Route.extend({

  actions: {
    fileQueued: function (evt) {
      var context = evt.context;
      var store = this.store;
      var file = evt.file;

      var document = store.createRecord('document', {
        filename: get(file, 'name'),
        filesize: get(file, 'file.size')
      });

      // Setting the file on the record allows observation
      // of file upload progress on the file
      set(document, 'file', file);

      set(file, 'promise', document.save());
    },

    fileUploaded: function (evt) {
      var file = evt.file;
      get(file, 'promise').then(function (document) {
        set(document, 'remoteUrl', evt.headers.Location);
        return document.save();
      }).then(function (document) {
        set(document, 'file', null);
      });
    },

    fileUploadFailed: function (evt) {
      var file = evt.file;
      get(file, 'promise').then(function (document) {
        set(document, 'file', null);
        document.deleteRecord();
        return document.save();
      });
    }
  }

});

export default ApplicationRoute;
```

## Installation

* `npm install --save-dev ember-plupload`
* `ember g ember-plupload`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
