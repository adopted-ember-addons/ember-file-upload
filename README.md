# {{pl-uploader}} [![Build Status](https://travis-ci.org/paddle8/ember-plupload.svg)](https://travis-ci.org/paddle8/ember-plupload) [![Code Climate](https://codeclimate.com/github/paddle8/ember-plupload/badges/gpa.svg)](https://codeclimate.com/github/paddle8/ember-plupload) [![Ember Observer Score](http://emberobserver.com/badges/ember-plupload.svg)](http://emberobserver.com/addons/ember-plupload)

{{pl-uploader}} is an ember component that provides an API for [Plupload](http://www.plupload.com/). Uploads are persistent accross routes in your application (they continue in the background).

To use the uploader, you must provide a name (for proper queueing and bundling of resources), and an upload URL.

## Configuration

The `{{pl-uploader}}` component exposes a variety of parameters for configuring plupload:


| Attribute           | Definition
|---------------------|------------------|
| `name`              | a unique identifier of the uploader. used to rehydrate a component with its uploads happening in the background
| `when-queued`       | the name of the action on a route to be called when a file is queued to be uploaded
| `for`               | the ID of the browse button
| `for-dropzone`      | the ID of the dropzone. this is auto generated if not provided
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
| `contentType`       | correlates to the Content-Type header of the file. This will add a property 'Content-Type' to your data. This defaults to the type of the file
| `data`              | multipart params to send along with the upload
| `multipart`         | whether the file should be sent using using a multipart form object or as a binary stream.
| `maxRetries`        | the maximum number of times to retry uploading the file
| `chunkSize`         | the chunk size to split the file into when sending to the server
| `fileKey`          | the name of the parameter to send the file as. defaults to `file`

The function signature of `upload` is `upload(url, [settings])`, or `upload(settings)`.

For more in-depth documentation on the configuration options, see the [Plupload documentation](http://plupload.com/docs/Options).

## Recipes

The cleanest approach to configure uploaders is to create a component that encapsulates the configuration on the uploader component. Using the uploader as a container, you can provide a clean API for an uploader.

For example, creating an image uploader that uploads images to your API server would look like:

```handlebars
{{#pl-uploader for="upload-image" extensions="jpg jpeg png gif" when-queued="uploadImage" as |queue dropzone|}}
  <div class="dropzone" id={{dropzone.id}}>
    {{#if dropzone.active}}
      {{#if dropzone.valid}}
        Drop to upload
      {{else}}
        Invalid
      {{/if}}
    {{else if queue.length}}
      Uploading {{queue.length}} files. ({{queue.progress}}%)
    {{else}}
      <h4>Upload Images</h4>
      <p>
        {{#if dropzone.enabled}}
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

## Access to the global list of uploading files

`ember-plupload` exposes a service called `uploader` that exposes aggregate information on files being uploaded in your app.

A common scenario is to alert users that they still have pending uploads when they are about to leave the page. To do this, look at `uploader.get('files.length')` to see if there's any files uploading.

In addition to the file list, there are properties that indicate how many bytes have been uploaded (`loaded`), the total size of all files in bytes (`size`), and the progress of all files (`progress`). Using these, you may implement a global progress bar indicating files that are uploading in the background.


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

## S3 Direct uploads

If you would like to use the addon to upload directly to S3, you'll need to configure your bucket to accept and expose headers to allow plupload to access your bucket.

The following CORS configuration should be sufficient for most cases:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>Content-Type</AllowedHeader>
    <AllowedHeader>x-amz-acl</AllowedHeader>
    <AllowedHeader>origin</AllowedHeader>
    <AllowedHeader>accept</AllowedHeader>
    <ExposeHeader>Location</ExposeHeader>
  </CORSRule>
</CORSConfiguration>
```

Exposing `Location` to clients is important, since S3 will return the URL of the object where it's stored. This is accessible in the promise resolution as `response.headers.Location`. You may choose to expose more headers for debugging purposes (see [S3 Documentation](http://docs.aws.amazon.com/AmazonS3/latest/API/RESTCommonResponseHeaders.html))

To properly upload a file to S3 directly from the browser, you need to provide a presigned URL. A simple ruby class for S3 direct upload parameter signing is provided below as an example:

```ruby
require 'openssl'
require 'base64'
require 'json'

#
# Generates signed parameters to upload files directly to S3.
#
# S3Direct.new('<AWSAccessKeyId>', '<AWSSecretKey>', {
#   bucket: 'my-bucket',
#   acl: 'public-read',
#   key: 'uploads/${filename}',
#   expiration: Time.now + 10 * 60,
#   conditions: [
#     ['starts-with', '$name', '']
#   ]
# }).to_json
#
class S3Direct
  def initialize(access_key, secret_key, options = {})
    require_options(options, :bucket, :expiration, :key, :acl)
    @access_key = access_key
    @secret_key = secret_key
    @options = options
  end

  def signature
    Base64.strict_encode64(
      OpenSSL::HMAC.digest('sha1', @secret_key, policy)
    )
  end

  def policy
    Base64.strict_encode64({
      expiration: @options[:expiration].utc.iso8601,
      conditions: conditions
    }.to_json)
  end

  def to_json
    {
      url: "https://#{@options[:bucket]}.s3.amazonaws.com",
      credentials: {
        AWSAccessKeyId: @access_key,
        policy:         policy,
        signature:      signature,
        acl:            @options[:acl],
        key:            @options[:key]
      }
    }.to_json
  end

  private

  def conditions
    dynamic_key = @options[:key].include?('${filename}')
    prefix = @options[:key][0..(@options[:key].index('${filename}') - 1)]

    conditions = (@options[:conditions] || []).map(&:clone)
    conditions << { bucket: @options[:bucket] }
    conditions << { acl: @options[:acl] }
    conditions << { key: @options[:key] } unless dynamic_key
    conditions << ['starts-with', '$key', prefix] if dynamic_key
    conditions << ['starts-with', '$Content-Type', '']
  end

  private

  def require_options(options, *keys)
    missing_keys = keys.select { |key| !options.key?(key) }
    return unless missing_keys.any?
    raise ArgumentError, missing_keys.map { |key| ":#{key} is required to generate a S3 upload policy." }.join('\n')
  end
end
```

After setting up your S3 bucket and server, you can start writing the code to upload files directly to S3!

```javascript
import Ember from 'ember';

const RSVP = Ember.RSVP;
const set = Ember.set;

export default Ember.Route.extend({
  actions: {
    uploadImage: function (file) {
      let model = this.modelFor(this.routeName);
      RSVP.cast(Ember.$('/api/s3_direct')).then(function (response) {
        return file.upload(response.url, {
          data: response.credentials
        });
      }).then(function (response) {
        set(model, 'url', response.headers.Location);
        return model.save();
      });
    }
  }
});
```

# Installation

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
