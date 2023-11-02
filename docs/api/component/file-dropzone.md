---
category: component
---

# FileDropzone

`FileDropzone` is a component that will allow users to upload files by
drag and drop.

```hbs
<FileDropzone @queue={{queue}} as |dropzone|>
  {{#if dropzone.active}}
    Drop to upload
  {{else if queue.files.length}}
    Uploading
    {{queue.files.length}}
    files. ({{queue.progress}}%)
  {{else}}
    <h4>Upload Images</h4>
    <p>
      {{#if dropzone.supported}}
        Drag and drop images onto this area to upload them
      {{/if}}
    </p>
  {{/if}}
</FileDropzone>
```

## Import path

```js
import FileDropzone from 'ember-file-upload/components/file-dropzone';
```

# Component API

## Arguments

| Argument             | Description                                             | Type      | Default value |
| -------------------- | ------------------------------------------------------- | --------- | ------------- |
| `@queue`      | Queue which files will be added to. | `Queue`  |    |
| `@cursor`      | Type of cursor that should be shown when a drag event happens. Corresponds to [DataTransfer.dropEffect](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/dropEffect). | `string`  | `'copy'`    |
| `@filter`      | Optionally provide this to validate dropped files before adding them to the queue. | `(file: File, files: File[], index: number) => boolean`  |   |
| `@onDragEnter`      | Called when files have entered the dropzone. | `(files: File[], dataTransfer: DataTransferWrapper) => void`  |   |
| `@onDragLeave`      | Called when files have left the dropzone. | `(files: File[], dataTransfer: DataTransferWrapper) => void`  |   |
| `@onDrop`           | Called when file have been dropped on the dropzone. | `(files: UploadFile[], dataTransfer: DataTransferWrapper) => void`  |   |

## Properties

Yielded by this component.

| Property             | Description                                             | Type      |
| -------------------- | ------------------------------------------------------- | --------- |
| `dropzone`           | Hash containing `supported` and `active`                |  `Object` |
| `dropzone.supported` | If the user's browser supports Drag and Drop            | `Boolean` |
| `dropzone.active`    | If files are being dragged over the `FileDropzone`      | `Boolean` |
| `queue`              | The file upload queue which the dropzone is attached to | `Queue`   |
