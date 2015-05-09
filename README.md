# {{pl-uploader}} [![Build Status](https://travis-ci.org/paddle8/ember-plupload.svg)](https://travis-ci.org/paddle8/ember-plupload) [![Code Climate](https://codeclimate.com/github/paddle8/ember-plupload/badges/gpa.svg)](https://codeclimate.com/github/paddle8/ember-plupload)

{{pl-uploader}} is an ember component that provides an API for [Plupload](http://www.plupload.com/). Uploads are persistent accross routes in your application (they continue in the background).

To use the uploader, you must provide a name (for proper queueing and bundling of resources), and an upload URL.

## Configuration

The `{{pl-uploader}}` component exposes a variety of parameters for configuring plupload:


| Attribute           | Definition
|---------------------|------------------|
| `when-queued`       | the name of the action on a route to be called when a file is queued to be uploaded
| `for`               | the ID of the browse button
| `max-file-size`     | the maximum size of file uploads
| `no-duplicates`     | disallow duplicate files (determined by matching the file's name and size)
| `extensions`        | a space-separated list of allowed file extensions
| `multiple`          | whether multiple files can be selected
| `unique-names`      | when set to `true`, this will rename files sent to the server and send the original name as a parameter named `name`
| `runtimes`          | a space-separated list of runtimes for plupload to attempt to use (in order of importance)

This configuration is for the uploader instance as a whole. Most of the configuration deals directly with the feel of the uploader. When the queued event is triggered, you will be given a file object that allows you to configure where the file is being uploaded:

| Property            | Definition
|---------------------|------------------|
| `url`               | the URL to send the upload request to
| `headers`           | the headers to use when uploading the file. it defaults to using the `accept` attribute
| `accepts`           | a string or array of accepted content types that the server can respond with. defaults to `['application/json', 'text/javascript']`
| `contentType`       | how the file should be sent. defaults to `multipart/form-data`; `binary` is the other option
| `data`              | multipart params to send along with the upload
| `maxRetries`        | the maximum number of times to retry uploading the file
| `chunkSize`         | the chunk size to split the file into when sending to the server
| `fileKey`          | the name of the parameter to send the file as. defaults to `file`

The function signature of `upload` is `upload(url, [settings])`, or `upload(settings)`.

For more in-depth documentation on the configuration options, see the [Plupload documentation](http://plupload.com/docs/Options).

## Recipes

The cleanest approach to configure uploaders is to create a component that encapsulates the configuration on the uploader component. Using the uploader as a container, you can provide a clean API for an uploader.

For example, creating an image uploader that uploads images to your API server would look like:

```handlebars
{{#pl-uploader for="upload-image" extensions="jpg jpeg png gif" when-queued="uploadImage" as |queue features|}}
  <div class="dropzone" id={{features.drag-and-drop.dropzone-id}}>
    {{#if features.drag-and-drop.drag-data}}
      {{#if features.drag-and-drop.drag-data.valid}}
        Drop to upload
      {{else}}
        Invalid
      {{/if}}
    {{else if queue.length}}
      Uploading {{queue.length}} files. ({{queue.progress}}%)
    {{else}}
      <h4>Upload Images</h4>
      <p>
        {{#if features.drag-and-drop}}
          Drag and drop images onto this area to upload them or
        {{/if}}
        <a id="upload-image">Add an Image.</a>
      </p>
    {{/if}}
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

      file.read().then(function (url) {
        if (get(image, 'url') == null) {
          set(image, 'url', url);
        }
      });

      file.upload('/api/images/upload').then(function (response) {
        set(image, 'url', response.headers.Location);
        return image.save();
      }, function () {
        image.rollback();
      });
    }
  }
});
```

## Custom File Filters

File filters are supported using a promise based API on top of Plupload.

Begin by generating a new filter:

```bash
ember generate file-filter max-image-resolution
```

Which will generate a new file filter in your application. Call `resolve` if the file is valid, and `reject` with an error code and human readable reason if it's not.

For the `max-image-resolution` filter, the following code will create the correct filter:

```javascript
import Ember from "ember";

const RSVP = Ember.RSVP;

export default function (maxImageResolution, file, resolve, reject) {
  var image = new Image();
  var deferred = RSVP.defer();

  image.onload = deferred.resolve;
  image.onerror = deferred.reject;
  image.load(file.getSource());

  deferred.promise.then(function () {
    if (image.width * image.height < maxImageResolution) {
      throw "Image failed to load";
    }
  }).then(resolve, function () {
    reject(
      plupload.IMAGE_DIMENSIONS_ERROR,
      `Resolution exceeds the allowed limit of ${maxImageResolution} pixels.`
    );
  }).finally(function () {
    image.destroy();
  });
}
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
