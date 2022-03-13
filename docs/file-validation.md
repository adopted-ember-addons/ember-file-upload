---
order: 4
---

# File validation

## Accept attribute

If you're only using the `queue.selectFile` modifer you may use the `accept` attribute to suggest which file types may be selected.

```hbs
<input type="file" accept="image/*" {{queue.selectFile}}>
```

Unforunately this is unreliable as it is not handled the same by all browsers.

For more details see the [MDN accept attribute reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).

## Custom validation

Both `queue.selectFile` and `<FileDropzone>` accept the `filter` argument with which you may implement custom validation of chosen files.

Filter is called *after* files have been chosen and *before* `onFileAdded` is called by the queue. It runs once per selected file.

See the example below where the same validation callback is used for both file-selection methods.

Commonly validated file properties are `type`, `name` and `size`. For more details see the [MDN File reference](https://developer.mozilla.org/en-US/docs/Web/API/File).

```hbs
{{#let (file-queue name="photos") as |queue|}}
  <FileDropzone
    @queue={{queue}}
    @filter={{this.validateFile}}
    as |dropzone|
  >
    <input type="file" {{queue.selectFile filter=this.validateFile}}>
  </FileDropzone>
{{/let}}
```

```js
const allowedTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp'];

export default class ExampleComponent extends Component {
  validateFile(file) {
    return allowedTypes.includes(file.type);
  }
}
```

To ensure your file validation is working correctly refer to [Testing](testing.md).
