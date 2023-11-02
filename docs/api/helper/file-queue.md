---
category: helper
---

# file-queue

The `file-queue` helper is one of the core primitives of ember-file-upload.

If a named queue is not found, it will be created for you.

```hbs
{{#let (file-queue name='photos') as |queue|}}
  {{queue.progress}}%
{{/let}}
```

If a name is not provided, the default queue will be used.

```hbs
{{#let (file-queue) as |queue|}}
  {{queue.progress}}%
{{/let}}
```

## Import path

```js
import fileQueue from 'ember-file-upload/helpers/file-queue';
```

# Helper API

## Arguments

| Argument            | Description                                             | Type                                             | Default value |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------ | ------------- |
| `name`              | Name of queue to find or create.                        | `string`                                         |               |
| `onFileAdded`       | Called when a file is added to this queue.              | `(file: UploadFile) => void`                     |               |
| `onFileRemoved`     | Called when a file is removed from this queue.          | `(file: UploadFile) => void`                     |               |
| `onUploadStarted`   | Called when an upload for a file in this queue starts.  | `(file: UploadFile) => void`                     |               |
| `onUploadSucceeded` | Called when an upload of a file in this queue succeeds. | `(file: UploadFile, response: Response) => void` |               |
| `onUploadFailed`    | Called when an upload of a file in this queue fails.    | `(file: UploadFile, response: Response) => void` |               |

## Properties

Yielded by this helpers.

| Property | Description         | Type    |
| -------- | ------------------- | ------- |
| `queue`  | A file upload Queue | `Queue` |
