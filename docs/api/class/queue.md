---
category: class
---

# Queue

The Queue is a collection of files that are being manipulated by the user.

Queues are designed to persist the state of uploads when a user navigates around your application.

## Import path

```js
import { Queue } from 'ember-file-upload';
```

## Queue names

Queue names should be deterministic so they can be retrieved. It's recommended to provide a helpful name.

If the queue belongs to a top level collection, photos, the good name for this queue may be `'photos'`.

If you're uploading images to an artwork, the best name would incoporate both "artworks" and the identifier of the artwork. A good name for this queue may be `'artworks/{{id}}/photos'`, where `{{id}}` is a dynamic segment that is generated from the artwork id.

## Failed uploads

Note that files that have failed need to be manually removed from the queue. This is so they can be retried without resetting the state of the queue, orphaning the file from its queue.

Upload failures can happen due to a timeout or a server response. If you choose to use the abort method, the file will fail to upload, but will be removed from the requeuing proccess, and will be considered to be in a settled state.

# Class API

## Fields

| Field       | Description                                                                                                   | Type               |
| ----------- | ------------------------------------------------------------------------------------------------------------- | ------------------ |
| `fileQueue` | The FileQueue service.                                                                                        | `FileQueue`        |
| `name`      | The unique identifier of the queue.                                                                           | `string \| symbol` |
| `files`     | The list of files in the queue. This automatically gets flushed when all the files in the queue have settled. | `UploadFile[]`     |
| `size`      | Total size of all files currently being uploaded in bytes.                                                    | `number`           |
| `loaded`    | Number of bytes that have been uploaded to the server.                                                        | `number`           |
| `progress`  | Current progress of all uploads, as a percentage in the range of 0 to 100.                                    | `number`           |
| `rate`      | Current time in ms it is taking to upload 1 byte.                                                             | `number`           |

## Methods

| Method   | Description                    | Parameters   | Returns |
| -------- | ------------------------------ | ------------ | ------- |
| `add`    | Add a file to this queue.      | `UploadFile` |         |
| `remove` | Remove a file from this queue. | `UploadFile` |         |

## Modifiers

| Modifier     | Description                                   | Parameters                                                                                                      |
| ------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `selectFile` | Bind a file input to add files to this queue. | `filter: (file: File, files: File[], index: number) => Boolean, onFilesSelected: (files: UploadFile[]) => void` |
