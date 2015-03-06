# {{pl-uploader}} [![Build Status](https://travis-ci.org/paddle8/ember-plupload.svg)](https://travis-ci.org/paddle8/ember-plupload) [![Code Climate](https://codeclimate.com/github/paddle8/ember-plupload/badges/gpa.svg)](https://codeclimate.com/github/paddle8/ember-plupload)

{{pl-uploader}} is an ember component that provides an API for [Plupload](http://www.plupload.com/). Uploads are long lived in the application, and will happen in the background if the user leaves the page where they're uploading files.

To use the uploader, you must provide a name (for proper queueing and bundling of resources), and an upload URL.

## Configuration

The `{{pl-uploader}}` component exposes a variety of parameters for configuring plupload:


| Attribute           | Definition
|---------------------|------------------|
| `when-queued`       | the name of the action on a route to be called when a file is queued to be uploaded
| `action`            | the URL to send the upload request to
| `for`               | the ID of the browse button
| `runtimes`          | a space-separated list of runtimes for plupload to attempt to use (in order of importance)
| `extensions`        | a space-separated list of allowed file extensions
| `accepts`           | a space-separated list of accepted content types that the server can respond with
| `multipart-params`  | multipart params to send along with the upload
| `max-file-size`     | the maximum size of file uploads
| `no-duplicates`     | disallow duplicate files (determined by matching the file's name and size)
| `max-retries`       | the maximum number of times to retry uploading the file
| `chunk-size`        | the chunk size to split the file into when sending to the server


## Recipes

The cleanest approach to configure uploaders is to create a component that encapsulates the configuration on the uploader component. Using the uploader as a container, you can provide a clean API for an uploader.

For example, creating an image uploader that uploads images to your API server would look like:

```handlebars
{{#pl-uploader extensions="jpg jpeg png gif" action="/api/images/upload" for="upload-image" when-queued="uploadImage" as |files features|}}
  <div class="dropzone" id={{features.drag-and-drop.dropzone-id}}>
    {{#with features.drag-and-drop.drag-data as |dragData|}}
      {{#if dragData}}
        {{#if dragData.valid}}
          Drop to upload
        {{else}}
          Invalid
        {{/if}}
      {{else if files.length}}
        Uploading {{files.length}} files. ({{files.progress}}%)
      {{else}}
        <h4>Upload Images</h4>
        <p>
          {{#if features.drag-and-drop}}
            Drag and drop images onto this area to upload them or
          {{/if}}
          <a id="upload-image">Add an Image.</a>
        </p>
      {{/if}}
    {{/with}}
  </div>
{{/pl-uploader}}
```

## Integration

If your application doesn't use an assets folder, or serves assets from a different domain, you will need to add a PLUPLOAD_BASE_URL to your configuration file.

The addon emits an event when a file is queued for upload. You may trigger the upload by calling the `upload` function on the file, which returns a promise that is resolved when the file has finished uploading and is rejected if the file couldn't be uploaded.

```javascript
import Ember from "ember";

const get = Ember.get;
const set = Ember.set;

export default Ember.Route.extend({

  actions: {
    uploadImage: function (file) {
      var product = this.modelFor('product');
      var image = this.store.createRecord('image', {
        product: product,
        filename: get(file, 'name'),
        filesize: get(file, 'size')
      });

      file.upload().then(function (response) {
        set(image, 'url', response.headers.Location);
        return image.save();
      }, function () {
        image.rollback();
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
