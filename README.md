# {{file-upload}} [![Build Status](https://travis-ci.org/tim-evans/ember-file-upload.svg)](https://travis-ci.org/tim-evans/ember-file-upload) [![Code Climate](https://codeclimate.com/github/tim-evans/ember-file-upload/badges/gpa.svg)](https://codeclimate.com/github/tim-evans/ember-file-upload) [![Ember Observer Score](http://emberobserver.com/badges/ember-file-upload.svg)](http://emberobserver.com/addons/ember-file-upload)

{{file-upload}} is an ember component that provides an API for file uploads. Uploads are persistent accross routes in your application (they continue in the background).

To use the uploader, you must provide a name (for proper queueing and bundling of resources), and an upload URL.

## Configuration

The `{{file-upload}}` component is configured with a single property: a queue. A queue is configured with options that
exposes a variety of parameters for configuring file-uploader:


| Attribute           | Definition
|---------------------|------------------|
| `accept`            | a list of MIME types / extensions to accept by the input
| `multiple`          | whether multiple files can be selected
| `onfileadd`         | the name of the action to be called when a file is added to a queue

The `{{file-dropzone}}` component:

| Attribute           | Definition
|---------------------|------------------|
| `ondragenter`       | the name of the action to be called when a file is added to a queue
| `ondragleave`       | the name of the action to be called when a file is added to a queue
| `ondrop`            | the name of the action to be called when a file is added to a queue


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

The function signature of `upload` is `upload(url, [settings])`, or `upload(settings)`.

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
                     accept="image/*"
                     multiple=true
                     onfileadd=(route-action "uploadImage")}}
        <a id="upload-image" tabindex=0>Add an Image.</a>
      {{/file-upload}}
    </p>
  {{/if}}
{{/file-dropzone}}
```

## Integration

The addon emits an event when a file is queued for upload. You may trigger the upload by calling the `upload` function on the file, which returns a promise that is resolved when the file has finished uploading and is rejected if the file couldn't be uploaded.

```javascript
import Ember from 'ember';
import { task } from 'ember-concurrency';

const { get, set } = Ember;

export default Ember.Route.extend({

  uploadPhoto: task(function * (file) {
    try {
      let product = this.modelFor('product');
      let photo = this.store.createRecord('photo', {
        product,
        filename: get(file, 'name'),
        filesize: get(file, 'size')
      });

      file.read().then(function (url) {
        if (get(photo, 'url') == null) {
          set(photo, 'url', url);
        }
      });

      let response = yield file.upload('/api/images/upload');
      set(photo, 'url', response.headers.Location);
      yield photo.save();
    } catch {
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

`ember-file-upload` exposes a service called `uploader` that exposes aggregate information on files being uploaded in your app.

A common scenario is to alert users that they still have pending uploads when they are about to leave the page. To do this, look at `uploader.get('files.length')` to see if there's any files uploading.

In addition to the file list, there are properties that indicate how many bytes have been uploaded (`loaded`), the total size of all files in bytes (`size`), and the progress of all files (`progress`). Using these, you may implement a global progress bar indicating files that are uploading in the background.

## Acceptance Tests

`ember-file-upload` integrates with `ember-cli-mirage` for acceptance tests. This helper provides a way to realistically simulate file uploads, including progress events and failure states. The helper adds another method to the mirage server called `upload`, which will handle upload requests.


`mirage/config.js`
```javascript
import { upload } from 'ember-file-upload/mirage';

export default function () {
  this.post('/photos/new', upload(function (db, file) {
    let { name: filename, size: filesize, url } = file;
    let photo = db.create('photo', { filename, filesize, url, uploadedAt: new Date() });
    return photo;
  });
}
```

```javascript
import { upload } from '../../helpers/upload';
import File from 'ember-file-upload/file';

moduleForAcceptance('/photos');

test('uploading an image', async function (assert) {
  let file = File.fromDataURL('data:image/gif;base64,R0lGODdhCgAKAIAAAAEBAf///ywAAAAACgAKAAACEoyPBhp7vlySqVVFL8oWg89VBQA7');

  await upload('#upload-photo', file, 'smile.gif');

  let photo = server.db.photos[0];
  assert.equal(photo.filename, 'smile.gif');
});
```

If the file isn't uploaded to the server, you don't need to use the mirage helper. The same approach applies for all types of files; encode them as a Base64 data url or read them from a file as a blob.

```javascript
import upload from '../helpers/upload';

moduleForAcceptance('/notes');

test('showing a note', async function (assert) {
  let file = File.fromDataUrl('data:text/plain;base64,SSBjYW4gZmVlbCB0aGUgbW9uZXkgbGVhdmluZyBteSBib2R5');

  await upload('#upload-note', file, 'douglas_coupland.txt');

  assert.equal(find('.note').text(), 'I can feel the money leaving my body');
});
```

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

# Installation

* `ember install ember-file-upload`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

# Contributing

Contributors are welcome! Please provide a reproducible test case. Details will be worked out on a case-per-case basis. Maintainers will get in touch when they can, so delays are possible. For contribution guidelines, see the [code of conduct](https://github.com/tim-evans/ember-file-upload/blob/master/CONDUCT.md).


## Publishing

* `ember github-pages:commit --message "Releasing docs"`

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
