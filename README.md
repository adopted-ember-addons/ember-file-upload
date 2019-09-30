# {{file-upload}} [![Build Status](https://travis-ci.org/adopted-ember-addons/ember-file-upload.svg?branch=latest)](https://travis-ci.org/adopted-ember-addons/ember-file-upload) [![Code Climate](https://codeclimate.com/github/adopted-ember-addons/ember-file-upload/badges/gpa.svg)](https://codeclimate.com/github/adopted-ember-addons/ember-file-upload) [![Ember Observer Score](https://emberobserver.com/badges/ember-file-upload.svg)](https://emberobserver.com/addons/ember-file-upload)

{{file-upload}} is an ember component that provides an API for file uploads. Uploads are persistent across routes in your application (they continue in the background).

To use the uploader, you must provide a name (for proper queueing and bundling of resources), and an upload URL.

## Table of Contents

<!-- toc -->

- [Installation](#installation)
- [Configuration](#configuration)
- [Recipes](#recipes)
- [Integration](#integration)
- [Access to the global list of uploading files](#access-to-the-global-list-of-uploading-files)
- [Acceptance Tests](#acceptance-tests)
- [S3 Direct uploads](#s3-direct-uploads)
- [Contributing](#contributing)
- [Publishing](#publishing)

<!-- tocstop -->

## Installation

* `ember install ember-file-upload`

## Configuration

The `{{file-upload}}` component is configured with a single property: a queue. A queue is configured with options that
exposes a variety of parameters for configuring file-uploader:


| Attribute           | Definition
|---------------------|------------------|
| `name`              | The name of the queue to use
| `accept`            | a list of MIME types/extensions to accept by input
| `multiple`          | whether multiple files can be selected
| `disabled`          | if set, disables input and prevents files from being added to the queue
| `onfileadd`         | the name of the action to be called when a file is added to a queue

The `{{file-dropzone}}` component:

| Attribute           | Definition
|---------------------|------------------|
| `name`              | The name of the queue to use
| `ondragenter`       | the name of the action to be called when a file has entered the dropzone
| `ondragleave`       | the name of the action to be called when a file has left the dropzone
| `ondrop`            | the name of the action to be called when a file has been dropped in the dropzone


This configuration is for the uploader instance as a whole. Most of the configuration deals directly with the feel of the uploader. When the queued event is triggered, you will be given a file object that allows you to configure where the file is being uploaded:

| Property            | Definition
|---------------------|------------------|
| `url`               | the URL to send the upload request to
| `method`            | the HTTP method to use when uploading the file; defaults to `POST`
| `headers`           | the headers to use when uploading the file. it defaults to using the `accept` attribute
| `accepts`           | a string or array of accepted content types that the server can respond with. defaults to `['application/json', 'text/javascript']`
| `contentType`       | correlates to the Content-Type header of the file. This will add a property 'Content-Type' to your data. This defaults to the type of the file
| `data`              | multipart params to send along with the upload
| `fileKey`           | the name of the parameter to send the file as. defaults to `file`


The function signature of `upload` is `upload(url, [settings])`, or `upload(settings)`. If you want to send your file to your server unencoded (as a binary file), you can do so using `uploadBinary`. This will transmit the content using `application/octet-stream` instead of `multipart/form-data`.

## Recipes

The cleanest approach to configure uploaders is to create a component that encapsulates the configuration on the uploader component. Using the uploader as a container, you can provide a clean API for an uploader.

For example, creating an image uploader that uploads images to your API server would look like:

```handlebars
{{#file-dropzone name="photos" as |dropzone queue|}}
  {{#if dropzone.active}}
    {{#if dropzone.valid}}
      Drop to upload
    {{else}}
      Invalid
    {{/if}}
  {{else if queue.files.length}}
    Uploading {{queue.files.length}} files. ({{queue.progress}}%)
  {{else}}
    <h4>Upload Images</h4>
    <p>
      {{#if dropzone.supported}}
        Drag and drop images onto this area to upload them or
      {{/if}}
      {{#file-upload name="photos"
                     for="upload-photo"
                     accept="image/*"
                     multiple=true
                     onfileadd=(action "uploadImage")}}
        <a tabindex=0>Add an Image.</a>
      {{/file-upload}}
    </p>
  {{/if}}
{{/file-dropzone}}
```

It is also possible for you to create a simple file upload button which yields the queue:

```handlebars
{{#file-upload name="photos"
               accept="image/*"
               onfileadd=(action "uploadImage") as |queue|}}
  <a class="button">
    {{#if queue.files.length}}
      Uploading...
    {{else}}
      Upload file
    {{/if}}
  </a>
{{/file-upload}}
```

The examples above using angle bracket invocation, available in Ember 3.4+

```handlebars
<FileDropzone @name="photos" as |dropzone queue|>
  {{#if dropzone.active}}
    {{#if dropzone.valid}}
      Drop to upload
    {{else}}
      Invalid
    {{/if}}
  {{else if queue.files.length}}
    Uploading {{queue.files.length}} files. ({{queue.progress}}%)
  {{else}}
    <h4>Upload Images</h4>
    <p>
      {{#if dropzone.supported}}
        Drag and drop images onto this area to upload them or
      {{/if}}
      <FileUpload @name="photos"
                  @for="upload-photo"
                  @accept="image/*"
                  @multiple={{true}}
                  @onfileadd={{action this.uploadImage}}>
        <a tabindex=0>Add an Image.</a>
      </FileUpload>
    </p>
  {{/if}}
</FileDropzone>
```

```handlebars
<FileUpload @name="photos"
            @accept="image/*"
            @onfileadd={{action this.uploadImage}} as |queue|>
  <a class="button">
    {{#if queue.files.length}}
      Uploading...
    {{else}}
      Upload file
    {{/if}}
  </a>
</FileUpload>
```
## Integration

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

## Testing

`ember-file-upload` provides a test helper for testing as well as an integration for `ember-cli-mirage`. Please have a look in the [documentation](https://adopted-ember-addons.github.io/ember-file-upload/docs/testing) for details.

## S3 Direct uploads

If you would like to use the addon to upload directly to S3, you'll need to configure your bucket to accept and expose headers to allow the addon to access your bucket.

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
      RSVP.cast(Ember.$.get('/api/s3_direct')).then(function (response) {
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


## Contributing

Contributors are welcome! Please provide a reproducible test case. Details will be worked out on a case-per-case basis. Maintainers will get in touch when they can, so delays are possible. For contribution guidelines, see [Contributing](CONTRIBUTING.md) and [code of conduct](CONDUCT.md).


## Publishing

* `ember github-pages:commit --message "Releasing docs"`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
