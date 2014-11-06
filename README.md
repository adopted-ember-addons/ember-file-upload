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

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
