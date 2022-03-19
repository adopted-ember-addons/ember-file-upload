# Ember FileUpload [![CI](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/ci.yml) [![Ember Observer Score](https://emberobserver.com/badges/ember-file-upload.svg)](https://emberobserver.com/addons/ember-file-upload)

Ember FileUpload is an ember addon that makes uploading files easy.

Uploads can be managed through queues and continue in the background, even after a page transition. In other words they are persistent across routes in your application.

## Compatibility

| Support | v4.x | v5.0.0-beta.x |
| ----- | ----- | ----- |
| Ember.js  | 3.16 to 3.28  | 3.25 or above |
| Embroider  | 🤷  | ✅  |
| ember-auto-import |  | 2.0 or above |
| Documentation | [Docsite](https://adopted-ember-addons.github.io/ember-file-upload/docs/) | (Docsite WIP) [Doc files](docs/index.md)  |

* Ember CLI v2.13 or above
* Node.js v12 or above
* Modern browsers. Internet Explorer 11 might work but is not offically supported.
* Strict Content Security Policy (CSP) except for mirage route handlers, which require `data:` protocol to be included in `image-src` and `media-src` directives.

## Upgrading

See: [Upgrading to v5](docs/upgrade-guide.md#upgrading-to-v5).

## Contributing

Contributors are welcome! Please provide a reproducible test case. Details will be worked out on a case-per-case basis. Maintainers will get in touch when they can, so delays are possible. For contribution guidelines, see [Contributing](CONTRIBUTING.md) and [code of conduct](CONDUCT.md).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
