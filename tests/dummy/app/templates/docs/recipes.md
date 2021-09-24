# Recipes

The cleanest approach to configure uploaders is to create a component that encapsulates the configuration on the uploader component. Using the uploader as a container, you can provide a clean API for an uploader.

For example, creating an image uploader that uploads images to your API server would look like:

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
      <FileUpload
        @name="photos"
        @for="upload-photo"
        @accept="image/*"
        @multiple={{true}}
        @onFileAdd={{this.uploadImage}}
      >
        <a tabindex="0">Add an Image.</a>
      </FileUpload>
    </p>
  {{/if}}
</FileDropzone>
```

It is also possible for you to create a simple file upload button which yields the queue:

```handlebars
<FileUpload
  @name="photos"
  @accept="image/*"
  @onFileAdd={{this.uploadImage}}
  as |queue|
>
  <a tabindex="0">
    {{#if queue.files.length}}
      Uploading...
    {{else}}
      Upload file
    {{/if}}
  </a>
</FileUpload>
```
