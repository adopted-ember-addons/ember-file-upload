# Ember FileUpload [![CI](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/ci.yml) [![Deploy](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/adopted-ember-addons/ember-file-upload/actions/workflows/deploy.yml) [![Ember Observer Score](https://emberobserver.com/badges/ember-file-upload.svg)](https://emberobserver.com/addons/ember-file-upload)

Ember FileUpload is an ember addon that makes uploading files easy.

Uploads continue in the background, even after a page transition. In other words they are persistent across routes in your application.

[View the docs here.](https://adopted-ember-addons.github.io/ember-file-upload/docs/)

## Compatibility

* Ember.js v3.16 or above
* Ember CLI v2.13 or above
* Node.js v12 or above
* Modern browsers. Internet Explorer 11 might work but is not offically supported.
* Strict Content Security Policy (CSP) except for mirage route handlers, which require `data:` protocol to be included in `image-src` and `media-src` directives.

## Installation

* `ember install ember-file-upload`

## Contributing

Contributors are welcome! Please provide a reproducible test case. Details will be worked out on a case-per-case basis. Maintainers will get in touch when they can, so delays are possible. For contribution guidelines, see [Contributing](CONTRIBUTING.md) and [code of conduct](CONDUCT.md).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
