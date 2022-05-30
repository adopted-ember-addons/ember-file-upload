---
category: class
---

# UploadFile

The `UploadFile` class provides a uniform interface for interacting with data that can be uploaded or read.

```js
import UploadFile from 'ember-file-upload/upload-file';
```

## File states

Here is the statechart describing the flow of state:

```
      .------.     .---------.     .--------.
  o--| queued |-->| uploading |-->| uploaded |
      `------`     `---------`     `--------`
         ^              |    .-------.
         |              |`->| aborted |
         |              |    `-------`
         |  .------.    |    .---------.
         `-| failed |<-` `->| timed_out |-.
         |  `------`         `---------`  |
         `-------------------------------`
```

Possible states:

- queued
- uploading
- timed_out
- aborted
- uploaded
- failed

## File sources

The `source` property can be one of the following:

- `browse` is the source when the file is created using the native file picker.
- `drag-and-drop` is the source when the file was created using drag and drop from their desktop.
- `web` is the source when the file was created by dragging the file from another webpage.
- `data-url` is the source when the file is created from a data URL using the fromDataURL method for files. This usually means that the file was created manually by the developer on behalf of the user.
- `blob` is the source when the file is created from a blob using the fromBlob method for files. This usually means that the file was created manually by the developer.

## Upload options

An object which may be passed as an optional second argument to `upload()` and `uploadBinary()`.

| Property          | Description                                                                                                                                                    | Type             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `accepts`         | A list of MIME types to send as the `Accept` header. Default: `['application/json', 'text/javascript']`.                                                       | `Array<string> ` |
| `contentType`     | Override the `Content-Type` value of the data payload. Defaults to the `type` of your file.                                                                    | `string`         |
| `data`            | The data payload to send. Values will be added to this such as `file` and `Content-Type`. Default `{}`.                                                        | `object`         |
| `fileKey`         | The key within the data payload where the file data is set. Default: `'file'`.                                                                                 | `string`         |
| `headers`         | An object representing additional HTTP headers to send with the upload request.                                                                                | `object`         |
| `method`          | The HTTP method to upload with. Default: `'POST'`.                                                                                                             | `string `        |
| `timeout`         | Time in ms to perform the request before considering it timed out. Timed out uploads will transition the file's state to `FileState.TimedOut`. Default `null`. | `number `        |
| `withCredentials` | Include credentials (cookies) with the upload request. Default `false`.                                                                                        | `boolean `       |

# Class API

## Fields

| Field | Description                          | Type     |
| ----- | ------------------------------------ | -------- |
| `id`  | A unique id generated for this file. | `string` |

## Accessors

| Accessor    | Description                                                                                                                 | Type     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| `name`      | The file name.                                                                                                              | `string` |
| `size`      | The size of the file in bytes.                                                                                              | `number` |
| `type`      | The MIME type of the file.                                                                                                  | `string` |
| `extension` | Returns the appropriate file extension of the file according to the type.                                                   | `string` |
| `loaded`    | The number of bytes that have been uploaded to the server.                                                                  | `number` |
| `progress`  | The current progress of the upload, as a percentage in the range of 0 to 100.                                               | `number` |
| `state`     | The current state that the file is in.                                                                                      | `string` |
| `source`    | The source of the file. This is useful for applications that want to gather analytics about how users upload their content. | `string` |

## Methods

| Method               | Description                                               | Parameters                            | Returns                                       |
| -------------------- | --------------------------------------------------------- | ------------------------------------- | --------------------------------------------- |
| `upload`             | Upload file to your server.                               | `url: string, options: UploadOptions` | `Promise<Response>`                           |
| `uploadBinary`       | Upload file with `application/octet-stream` content type. | `url: string, options: UploadOptions` | `Promise<Response>`                           |
| `readAsArrayBuffer`  | Resolves with Blob as ArrayBuffer.                        |                                       | `RSVP.Promise<string \| ArrayBuffer \| null>` |
| `readAsDataUrl`      | Resolves with Blob as DataURL.                            |                                       | `RSVP.Promise<string \| ArrayBuffer \| null>` |
| `readAsBinaryString` | Resolves with Blob as binary string                       |                                       | `RSVP.Promise<string \| ArrayBuffer \| null>` |
| `readAsText`         | Resolves with Blob as plain text                          |                                       | `RSVP.Promise<string \| ArrayBuffer \| null>` |

## Static methods

| Method        | Description                                                                        | Parameters                            | Returns      |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------------- | ------------ |
| `fromBlob`    | Creates a file object that can be read or uploaded to a server from a Blob object. | `blob: Blob, source: FileSource`      | `UploadFile` |
| `fromDataURL` | Creates a file object that can be read or uploaded to a server from a data URL.    | `dataURL: string, source: FileSource` | `UploadFile` |
