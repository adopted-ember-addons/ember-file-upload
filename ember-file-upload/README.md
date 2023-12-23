# Ember File Upload [![CI](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/ci.yml) [![Ember Observer Score](https://emberobserver.com/badges/ember-file-upload.svg)](https://emberobserver.com/addons/ember-file-upload)

Ember File Upload is an ember addon that makes uploading files easy.

Uploads can be managed through queues and continue in the background, even after a page transition. In other words they are persistent across routes in your application.

## Documentation

[View docs](https://ember-file-upload.pages.dev)

## Compatibility

* Ember.js 3.28 or above
* TypeScript 5.0 or above
* ember-auto-import 2.0 or above
* Modern browsers. Internet Explorer 11 might work but is not offically supported.
* Strict Content Security Policy (CSP) except for mirage route handlers, which require `data:` protocol to be included in `image-src` and `media-src` directives.

## Upgrading

See: [Upgrade guide](https://ember-file-upload.pages.dev/docs/upgrade-guide).

## Contributing

Contributors are welcome! Please provide a reproducible test case. Details will be worked out on a case-per-case basis. Maintainers will get in touch when they can, so delays are possible. For contribution guidelines, see [Contributing](CONTRIBUTING.md) and [code of conduct](CONDUCT.md).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
