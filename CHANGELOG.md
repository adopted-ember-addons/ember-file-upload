# ember-plupload Changelog

## 0.6.4 (May 24, 2015)
* #13 Fix dropzone hover events

## 0.6.3 (May 23, 2015)
* Simplify the interface to deal with drag and drop. This doesn't change the current semantics, but the old style semantics will be dropped in a future release. The `features.drag-and-drop` is flattened onto the second yield param and has the properties `id`, `enabled`, `valid`, and `active`.
* Add `for-dropzone` so uploaders can easily use the `<body>` element as their dropzone.

## 0.6.2 (May 23, 2015)
* `contentType` is now sent in the multipart_params by default. Otherwise, the `Content-Type` of the form submission would be overriden and the file simply wouldn't upload.

## 0.6.1 (May 19, 2015)
* Update plupload bower component.
* Allow settings to be unset when uploading. (For example, some users may not want to have the `Content-Type` header sent)

## 0.6.0 (May 12, 2015)
* #9 [BREAKING CHANGE] The `contentType` property now refers to the actual content type of the file to send. Use the `multipart` setting to determine whether the file will be sent in multiple parts using form data, or whether it's sent as a binary blob

## 0.5.1 (May 9, 2015)
* #9 [BREAKING CHANGE] `pl-uploader` components no longer accept the following attributes: `action`, `headers`, `accept`, `send-file-as`, `multipart-params`, `max-retries`, `chunk-size`, and `file-key`. These properties must now be sent via the `upload` method on files passed to the `when-queued` action.
