# ember-plupload Changelog

## 0.5.0 (May 9, 2015)
* #9 [BREAKING CHANGE] `pl-uploader` components no longer accept the following attributes: `action`, `headers`, `accept`, `send-file-as`, `multipart-params`, `max-retries`, `chunk-size`, and `file-key`. These properties must now be sent via the `upload` method on files passed to the `when-queued` action.
