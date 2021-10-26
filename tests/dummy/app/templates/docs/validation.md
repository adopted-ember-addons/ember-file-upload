# Validation

## Accept attribute

If you're only using `<FileUpload>` you may use the `@accept` argument to suggest which file types could be selected. This maps directly to the `accept` attribute on an input element.

Unforunately this is unreliable as it is not handled the same by all browsers.

For more details see the [MDN accept attribute reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).

## Custom validation

Both components provide callback arguments with which you may implement custom validation of chosen files.

`<FileUpload>` may be passed `@onSelect` and `<FileDropzone>` may be passed `@onDrop`.

These are called *after* files have been chosen and *before* `@onFileAdd` is called by the queue.

To implement validation, you may (optionally) return a subset of files from these callbacks to restrict which files are queued for upload.

See the example below where the same validation callback is used for both selection methods.

Commonly validated file properties are `type`, `name` and `size`. For more details see the [MDN File reference](https://developer.mozilla.org/en-US/docs/Web/API/File).

```hbs
<FileDropzone
  @name="photos"
  @onDrop={{this.validateFiles}}
  as |dropzone queue|
>
  ...
  <FileUpload
    @name="photos"
    @onSelect={{this.validateFiles}}
    @onFileAdd={{perform this.uploadImage}}
  />
  ...
</FileDropzone>
```

```js
import Component from '@glimmer/component';

const allowedTypes = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default class ExampleComponent extends Component {
  ...
  validateFiles(files) {
    return files.filter((file) => allowedTypes.includes(file.type));
  }
}
```
