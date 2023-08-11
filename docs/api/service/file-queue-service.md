---
category: service
---

# FileQueueService

The `FileQueueService` is a global file queue that manages all files being uploaded.

This service can be used to query the current upload state when a user leaves the app, asking them whether they want to cancel the remaining uploads.

## Import parth

```js
import FileQueueService from 'ember-file-upload/services/file-queue';
```

# Service API

## Fields

| Field   | Description                                                                                                    | Type           |
| ------- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| `files` | The list of all files in queues. This automatically gets flushed when all the files in the queue have settled. | `UploadFile[]` |

## Accessors

| Accessor   | Description                                                                    | Type     |
| ---------- | ------------------------------------------------------------------------------ | -------- |
| `size`     | The total size of all files currently being uploaded in bytes.                 | `number` |
| `loaded`   | The number of bytes that have been uploaded to the server.                     | `number` |
| `progress` | The current progress of all uploads, as a percentage in the range of 0 to 100. | `number` |

## Methods

| Method         | Description                                                  | Parameters     | Returns              |
| -------------- | ------------------------------------------------------------ | -------------- | -------------------- |
| `find`         | Returns a queue with the given name.                         | `name: string` | `Queue \| undefined` |
| `findOrCreate` | Find or creat a new queue with the given name and return it. | `name: string` | `Queue`              |
| `create`       | Create a new queue with the given name and return it.        | `name: string` | `Queue`              |
