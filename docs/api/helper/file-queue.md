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

# Helper API

## Arguments

| Argument            | Description                               | Type                                             | Default value |
| ------------------- | ----------------------------------------- | ------------------------------------------------ | ------------- |
| `name`              | Name of queue to find or create.          | `string`                                         |               |
| `onFileAdded`       | Called when each file is added.           | `(file: UploadFile) => void`                     |               |
| `onFileRemoved`     | Called when each file is removed.         | `(file: UploadFile) => void`                     |               |
| `onUploadStarted`   | Called when each upload begins.           | `(file: UploadFile) => void`                     |               |
| `onUploadSucceeded` | Called when each upload request succeeds. | `(file: UploadFile, response: Response) => void` |               |
| `onUploadFailed`    | Called when each upload request fails.    | `(file: UploadFile, response: Response) => void` |               |

## Properties

Yielded by this helpers.

| Property | Description         | Type    |
| -------- | ------------------- | ------- |
| `queue`  | A file upload Queue | `Queue` |
