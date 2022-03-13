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

Control which files are added to the queue with [File validation](file-validation.md).
