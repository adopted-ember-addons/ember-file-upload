---
order: 7
---

# Upgrade guide

## Upgrading to v5

### File validation

Validating files with the `@accept` arg has been removed. See: [Custom validation](file-validation.md#custom-validation) for a more reliable solution.

### `<FileUpload>` component

Due to accessibility concerns and DOM inflexibility, as of v5 this component is deprecated.

It has been replaced by the `queue.selectFile` modifier which can be applied to a file input.

```hbs
{{#let (file-queue name="photos") as |queue|}}
  <input type="file" {{queue.selectFile}}>
{{/let}}
```

The `<FileUpload>` component renders a hidden `<input type="file">` within a label, and yields to a block for the implementer to define their own "button".

This technique is not necessarily endorsed, but it may be replicated with the following example:

```hbs
{{! v4 syntax}}
<FileUpload
  @name="photos"
  @onFileAdd={{this.uploadPhoto}}
  @for="upload-photo"
  @accept="image/*"
  @multiple={{true}}
>
  <a tabindex="0">Choose photo</a>
</FileUpload>

{{! v5 syntax}}
{{#let (file-queue name="photos" onFileAdded=this.uploadPhoto) as |queue|}}
  <label for="upload-photo">
    <span role="button" tabindex="0" aria-controls="upload-photo">
      Choose photo
    </span>
  </label>
  <input
    type="file"
    id="upload-photo"
    accept="image/*"
    multiple
    hidden
    {{queue.selectFile}}
  >
{{/let}}
```

> ℹ️ Consider if this is necessary in your application – you may simplify your template and improve accessibility with a visible file input.
>
> ```hbs
> {{#let (file-queue name="photos" onFileAdded=this.uploadPhoto) as |queue|}}
>   <label for="upload-photo">
>     Choose photo
>     <input
>       type="file"
>       id="upload-photo"
>       accept="image/*"
>       multiple
>       {{queue.selectFile}}
>     >
>   </label>
> {{/let}}
> ```

### `<FileDropzone>` component

- `@accept` has been removed in favour of [Custom validation](file-validation.md#custom-validation).
- `@disabled` has been removed. Disable uploads in your application code.
- `@name` has been deprecated in favour of passing a queue directly via `@queue`.
- `@onFileAdd` has been deprecated. Use `onFileAdded` with `{{file-queue}}` helper or `@onDrop`.
- HTML attributes are be applied to the Dropzone element.

```hbs
{{! v4 syntax}}
<FileDropzone
  @name="photos"
  @onFileAdd={{this.uploadPhoto}}
  @accept="image/*"
  @class="photo-dropzone"
  as |dropzone|
>
</FileDropzone>

{{! v5 syntax}}
{{#let (file-queue name="photos" onFileAdded=this.uploadPhoto) as |queue|}}
  <FileDropzone
    @queue={{queue}}
    @filter={{this.validatePhoto}}
    class="photo-dropzone"
    as |dropzone|
  >
  </FileDropzone>
{{/let}}
```

### `File` class

The `File` class has been renamed to `UploadFile`. This is to avoid conflict and confusion with the [native File class](https://developer.mozilla.org/en-US/docs/Web/API/File).

```js
// v4
import File from 'ember-file-upload/file';
// v5
import UploadFile from 'ember-file-upload/upload-file';
```
