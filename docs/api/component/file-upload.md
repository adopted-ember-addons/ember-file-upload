---
category: component
---

# FileUpload

⚠️ This component has been deprecated in favour of the `queue.selectFiles` modifier. See: [Upgrading to v5](../../docs/upgrade-guide#fileupload-component).

`FileUpload` is a component that allows users to upload files using their browser's file chooser.

Legacy usage:

```hbs
<FileUpload
  @name='photos'
  @accept='image/*'
  @multiple='true'
  @onFileAdd={{perform this.uploadImage}}
  as |queue|
>
  <a tabindex='0'>Add an image.</a>
  {{#if queue.files.length}}
    Uploading
    {{queue.files.length}}
    files. ({{queue.progress}}%)
  {{/if}}
</FileUpload>
```

```js
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export default class ExampleComponent extends Component {
  @task({ maxConcurrency: 3, enqueue: true })
  *uploadImage(file) {
    const response = yield file.upload(url, options);
    ...
  }
}
```

# Component API

FileUpload accepts the following arguments.

| Argument           | Description                                                                        | Type                                                    | Default value |
| ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------- |
| `@queue`           | Queue which files will be added to.                                                | `Queue`                                                 |               |
| `@filter`          | Optionally provide this to validate dropped files before adding them to the queue. | `(file: File, files: File[], index: number) => boolean` |               |
| `@onFilesSelected` | Called when files have been selected.                                              | `(files: UploadFile[]) => void`                         |               |

# Block API

FileUpload yields the following properties.

| Property | Description                                                | Type    |
| -------- | ---------------------------------------------------------- | ------- |
| `queue`  | The file upload queue which the FileUpload is attached to. | `Queue` |
