# Uploading files

Bind a [file input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file) to your queue with the `queue.selectFile` modifier. Files selected from the input will be added to your queue. For example:

```hbs
{{#let (file-queue name="photos" onFileAdded=this.uploadPhoto) as |queue|}}
  <label>
    Choose a photo
    <input type="file" {{queue.selectFile}}>
  </label>
{{/let}}
```

After a file is added to your queue, the `onFileAdded` callback will be called. You may then upload the file to a URL by calling `file.upload()`. This returns a promise that is resolved when the file has finished uploading, or is rejected if the file couldn't be uploaded.

```js
export default class ExampleComponent extends Component {
  @action
  async uploadPhoto(file) {
    try {
      const response = await file.upload('/api/images/upload');
    } catch (error) {
      file.state = 'aborted';
    }
  }
}
```

> ⚠️ Remember that uploads continue in the background. A component may unmount while an upload is in progress. Consider the lifecycle of objects in your application when performing uploads from within them. In general it's safer to perform uploads in a long-lived object like a Service.

## Displaying upload progress

In addition to the file list, the queue tracks properties that indicate the progess of your uploads.

| Property | Description |
| ----- | ----- |
| queue.size  | `number` – Total size of all files currently being uploaded in bytes. |
| queue.loaded  | `number` – Number of bytes that have been uploaded to the server. |
| queue.progress  | `number` – Current progress of all uploads, as a percentage in the range of 0 to 100. |

```hbs
{{#if queue.files.length}}
  Uploading {{queue.files.length}} files. ({{queue.progress}}%)
{{/if}}
```

Another common scenario is to alert users that they still have pending uploads when they are about to leave the page. To do this, look at `queue.files.length` to see if there's any files uploading.

You can also [add files via Drag and Drop](file-dropzone.md).
