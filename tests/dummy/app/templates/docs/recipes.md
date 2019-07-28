# Recipes

The cleanest approach to configure uploaders is to create a component that encapsulates the configuration on the uploader component. Using the uploader as a container, you can provide a clean API for an uploader.

For example, creating an image uploader that uploads images to your API server would look like:

```hbs
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

It is also possible for you to create a simple file upload button which yields the queue:

```hbs
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
