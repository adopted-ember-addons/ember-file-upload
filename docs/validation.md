# Validation

## Accept attribute

If you're only using `<FileUpload>` you may use the `@accept` argument to suggest which file types could be selected. This maps directly to the `accept` attribute on an input element.

Unforunately this is unreliable as it is not handled the same by all browsers.

For more details see the [MDN accept attribute reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept).

## Custom validation

Both `<FileUpload>` and `<FileDropzone>` components accept the `@filter` argument with which you may implement custom validation of chosen files.

This are called *after* files have been chosen and *before* `fileAdded` is called by the queue.

See the example below where the same validation callback is used for both selection methods.

Commonly validated file properties are `type`, `name` and `size`. For more details see the [MDN File reference](https://developer.mozilla.org/en-US/docs/Web/API/File).

```hbs
<FileDropzone
  @queue={{queue}}
  @filter={{this.validateFile}}
  as |dropzone|
>
  ...
  <FileUpload
    @queue={{queue}}
    @filter={{this.validateFile}}
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
  validateFile(file) {
    return allowedTypes.includes(file.type);
  }
}
```
