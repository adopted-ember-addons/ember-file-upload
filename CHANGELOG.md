# ember-file-upload Changelog

## 1.13.13 (March 15, 2016)
* Add an API for mocking out file.read() for `ember-plupload/test-helpers`.
* Update ember-cli

## 1.13.12 (February 5, 2016)
* Assert that the browse button is in the DOM before trying to initialize the uploader.

## 1.13.11 (January 26, 2016)
* Fix drag-and-drop cases where the drag-out event is never handled. (Courtesy of @raytiley)

## 1.13.10 (December 9, 2015)
* Fix cases where Chrome would asynchronously load the `document.styleSheet`, causing ember-plupload to mess with app styles. (Courtesy of @mixonic)

## 1.13.9 (November 19, 2015)
* Add acceptance test helper `addFiles` and documentation.

## 1.13.8 (November 18, 2015)
* Use observable methods for the uploader service so properties properly get updated (`files`, `size`, `loaded`, and `progress`). (Courtesy of @schwabix)
* Start of polyfill work for making uploads work on mobile devices.

## 1.13.7 (October 26, 2015)
* Expose plupload internals through `onInitOfUploader` action. This is a stop-gap measure for mobile support, which may be superceded by support in the addon to handle it transparently. (courtesy of @cooperjbrandon)
* Support Ember 2.x and 1.x initializers (courtesy of @Kulja)

## 1.13.6 (August 14, 2015)
* Fixes a bug where drag and drop stopped working when `no-duplicates` was set to true. Courtesy of @cooperjbrandon

## 1.13.5 (August 14, 2015)
* Fixes a bug where the the uploader button's position wasn't invalidated when files are added / removed from the queue. Courtesy of @knownasilya

## 1.13.4 (August 12, 2015)
* Update blueprints to work with new function signature for `addBowerPackageToProject`. See https://github.com/ember-cli/ember-cli/pull/4643 for more information on these changes. Courtesy of @deathbearbrown

## 1.13.3 (August 12, 2015)
* Update plupload to [2.1.8](https://github.com/moxiecode/plupload/releases/tag/v2.1.8). Included below are the changelog to mOxie and plupload:

#### Plupload v2.1.4
* Fix: don't cancel current upload on generic file error
* Update moxie to [v1.3](https://github.com/moxiecode/moxie/releases/tag/v1.3)

#### Moxie v1.3
(last minor version to target Flash Player 10.3)

* FileInput, HTML5: Allow multiple file upload on iOS 8+.
* FileInput, HTML5: Where possible filter files by extensions, instead of mime types.
* Encode, Utils: Fix btoa() to properly interpret multi-byte strings.
* FileInput/FileDrop: Unbind all events on destroy.
* Image, HTML5/Flash/Silverlight: Properly extract RATIONAL/SRATIONAL types.
* Runtime, Flash: Make sure SWF is properly removed in IE on destroy.
* FileReader, Silverlight: Constrain conversion of the buffer to amount of bytes that it actually contains.
* Image/Jpeg, HTML5: Survive the cases when there's no embedded thumb.
* Image, HTML5: Extract embedded thumb from JPEG, when available.
* RuntimeClient: Letter-case of the runtime identifier, shouldn't matter.
* FileInput, HTML5: Set relativePath on the File object when it's available (when folder is selected in WebKit).

#### Plupload v2.1.8
* Fix event binding/unbinding logic by partially reverting it.
* Fix UA parser bug that made v2.1.5 unusable.
* Update moxie to [v1.3.4](https://github.com/moxiecode/moxie/releases/tag/v1.3.4)

#### Moxie v1.3.4
* Image, HTML5: Refactor ExifParser, mostly to survive invalid meta data.
* Utils, Env: ua-parser-js has dropped MAJOR version property.
* Utils, Url: Fix resolveUrl() regression.
* Utils, Basic: Fix each() regression.
* Image, Flash/Silverlight: Fix thumb extraction regression.

## 1.13.2 (August 10, 2015)
* Fix a bug introduced in 1.13.1 where dropzones were always marked as active.

## 1.13.1 (August 10, 2015)
* Add support for Ember 2.0.0-beta.5. This removes deprecated API calls from the addon (`Ember.keys`, `Ember.Enumerable.filterProperty`, `Ember.Enumerable.findProperty`).

## 1.13.0 (July 13, 2015)
* Allow files to be retried. Call `upload` on files that you'd like to try again to retry them.
* [BREAKING CHANGE] Remove deprecated code. All deprecations from 0.8.1 and below are removed, along with old behavior. Please upgrade to 0.8.1 before upgrading to 1.13.0 to ensure that there are no deprecation warnings.

## 0.8.1 (July 7, 2015)
* Fix HTML4 runtimes by conditionally adding drag and drop params to the uploader.
* Remove long timeouts before starting the upload in the `file.upload` method.

## 0.8.0 (July 6, 2015)
* Change 'when-queued' action handler to 'onfileadd'. This also adds an error handler called 'onerror'.

## 0.7.0 (July 6, 2015)
* Change UploadQueueManager to a service called Uploader with various aggregate properties about all files uploading.

## 0.6.23 (July 6, 2015)
* Fix file uploads for IE9 by increasing the queue timeout to 100ms. Courtesy of @mgrigis

## 0.6.22 (June 30, 2015)
* Handle code paths for beta versions of plupload. Some users of ember-plupload are using this in the wild. Courtesy of @walter

## 0.6.21 (June 14, 2015)
* Allow any 2XX series status to resolve the file upload
* Headers are case-insensitive, which meant that sometimes responses weren't parsed correctly. Courtesy of @raytiley
* Add a longer delay before uploading a file, trying to solve a race condition where settings were incorrectly reset before uploads. Courtesy of @walter

## 0.6.20 (June 12, 2015)
* Include unminified plupload and moxie for development, which helps with debugging issuse with plupload / moxie. Courtesy of @raytiley

## 0.6.19 (June 12, 2015)
* Fixes #19. Attach event listeners after the initial render is complete. This was causing browser crashes on Ember 1.13+. Courtesy of @raytiley

## 0.6.18 (June 11, 2015)
* Uploads that respond with 201s should be resolved instead of rejected. Courtesy of @raytiley

## 0.6.16 (June 3, 2015)
* 0.6.14 had a bug where the stylesheet would never be applied. This also reduces memory usage and DOM churn by sharing the stylesheet across all instances of the uploader.

## 0.6.14 (June 3, 2015)
* Use extracted dynamic stylesheet library, named dinosheets, for disabling pointer events on the dropzone. Installing the new version should properly add the library to your `bower.json`.

## 0.6.12 (May 28, 2015)
* Allow only an url to be passed to upload without any additional options.

## 0.6.11 (May 26, 2015)
* Add deprecation warnings for users of the old syntax (from 0.5.1).
* Remove deprecations for the new computed property syntax. Support for older versions of ember that do not support this will be dropped in 1.0.0.

## 0.6.10 (May 25, 2015)
* Monkeypatch plupload to take references to the drop_element and browse_button so parts of the interface can be conditionally shown / hidden without breaking the buttons.

## 0.6.9 (May 25, 2015)
* Reset `progress` when all files have finished uploading in the queue.

## 0.6.8 (May 25, 2015)
* Always trigger the `when-queued` event even if the file is invalid. Promise returning functions `read` and `upload` will always be rejected with the error.
* Expose `refresh` on the queue for those having trouble with misaligned plupload input masks. Internally, the uploader will try to refresh the position of the mask at times where there might be changes in templates.

## 0.6.7 (May 24, 2015)
* Rename `features` to `dropzone` (with an alias setup for features).
* Fix #14 by patching dragenter and dragleave events
* Apply `pointer-events: none` to all children of the dropzone so dragenter and dragleave events are stable.

## 0.6.5 (May 24, 2015)
* Set `Content-Type` in the headers if the file is being sent as a binary blob, otherwise, stick it into the multipart_params. These defaults allow for easy integration with uploading directly to S3.

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
