---
order: 6
---

# AWS S3 Direct Uploads

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
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import fetch from 'fetch';

export default class ExampleComponent extends Component {
  @task({ maxConcurrency: 3, enqueue: true })
  *uploadImage(file) {
    const { product } = this.args;
    const apiResponse = yield fetch('/api/s3_direct');
    const s3Response = yield file.upload(apiResponse.url, {
        data: apiResponse.credentials
      });
    product.url = s3Response.headers.Location;
    yield product.save();
  }
}
```
