# Ember File Upload [![CI](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/ci.yml) [![Ember Observer Score](https://emberobserver.com/badges/ember-file-upload.svg)](https://emberobserver.com/addons/ember-file-upload)

Ember File Upload is an ember addon that makes uploading files easy.

Uploads can be managed through queues and continue in the background, even after a page transition. In other words they are persistent across routes in your application.

## Documentation

[View docs](https://ember-file-upload.pages.dev)

## Folder uploads (fork feature)

> This fork adds folder upload support ahead of upstream. See
> [adopted-ember-addons/ember-file-upload#1066](https://github.com/adopted-ember-addons/ember-file-upload/pull/1066)
> for the upstream discussion.

Enable folder drops on a dropzone with `@allowFolderDrop`:

```hbs
<FileDropzone @queue={{queue}} @allowFolderDrop={{true}} as |dropzone|>
  ...
</FileDropzone>
```

Dropped directories are traversed recursively and every contained file is
added to the queue. Each `UploadFile` exposes `relativePath` — the file's
location within the dropped directory, including the directory name itself,
e.g. `reports/q3/deck.pdf`. For files not dropped as part of a directory,
`relativePath` is an empty string.

`relativePath` is also populated for files selected via a folder picker
(`<input type="file" webkitdirectory multiple>`), using the browser's native
`File.webkitRelativePath`.

Hidden files (e.g. `.DS_Store`) are **not** filtered out by the addon —
exclude them with `@filter` if your application needs to:

```js
filter = (file) => !file.name.startsWith('.');
```

In tests, simulate a folder drop with the `dragAndDropDirectory` helper:

```js
import { dragAndDropDirectory } from 'ember-file-upload/test-support';

await dragAndDropDirectory('.dropzone', {
  directories: [
    {
      name: 'reports',
      files: [new File([], 'summary.pdf')],
      directories: [{ name: 'q3', files: [new File([], 'deck.pdf')] }],
    },
  ],
  files: [new File([], 'loose.txt')], // dropped alongside the directory
});
```

## Compatibility

* Ember.js 4.4 or above
* TypeScript 5.0 or above
* ember-auto-import 2.0 or above
* Modern browsers. Internet Explorer 11 might work but is not offically supported.
* Strict Content Security Policy (CSP) except for mirage route handlers, which require `data:` protocol to be included in `image-src` and `media-src` directives.

## Upgrading

See: [Upgrade guide](https://ember-file-upload.pages.dev/docs/upgrade-guide).

## Contributing

Contributors are welcome! Please provide a reproducible test case. Details will be worked out on a case-per-case basis. Maintainers will get in touch when they can, so delays are possible. For contribution guidelines, see [Contributing](CONTRIBUTING.md) and [code of conduct](CONDUCT.md).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
