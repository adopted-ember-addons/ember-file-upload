---
order: 3
---

# Add files via Drag and Drop

For adding files to your queue via Drag and Drop you can use the `<FileDropzone>` component.

To upload files once they are added to the queue see: [Uploading files](uploading.md).

```hbs
{{#let (file-queue name="photos") as |queue|}}
  <FileDropzone @queue={{queue}} as |dropzone|>
    {{#if dropzone.active}}
      Drop to upload
    {{else if queue.files.length}}
      Uploading {{queue.files.length}} files. ({{queue.progress}}%)
    {{else if dropzone.supported}}
      Drag and drop photos here to upload them
    {{/if}}
  </FileDropzone>
{{/let}}
```

This component yields a some useful properties:

| Property | Description |
| ----- | ----- |
| dropzone.supported  | `Boolean` – If the user's browser supports Drag and Drop |
| dropzone.active  | `Boolean` – If files are being dragged over the `FileDropzone` |

## Folder drops

Pass `@allowFolderDrop={{true}}` to let users drop folders. Dropped directories are traversed recursively and every contained file is added to the queue.

```hbs
<FileDropzone @queue={{queue}} @allowFolderDrop={{true}} as |dropzone|>
  Drag and drop files or folders here to upload them
</FileDropzone>
```

Each `UploadFile` exposes `relativePath` – its location within the dropped directory, including the directory name itself, e.g. `reports/q3/deck.pdf`. For files not dropped as part of a directory `relativePath` is an empty string. Use it to recreate the folder structure on your server.

`relativePath` is also populated for files chosen via a folder picker (`<input type="file" webkitdirectory multiple>`), using the browser's native `File.webkitRelativePath`.

Hidden files (e.g. `.DS_Store`) are **not** filtered out. Exclude them, or whole subdirectories, with `@filter` – see [File validation](file-validation.md).

Control which files are added to the queue with [File validation](file-validation.md).
