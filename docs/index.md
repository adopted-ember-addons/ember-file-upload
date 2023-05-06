---
order: 1
---

# Getting started

Ember FileUpload is an ember addon that makes uploading files easy.

Uploads can be managed through queues and continue in the background, even after a page transition. In other words they are persistent across routes in your application.

## Installation

```sh
ember install ember-file-upload
```

To ensure your app has all requred `devDependencies` you may also run:

```sh
# pnpm
pnpm add --save-dev @ember/test-helpers @glimmer/component @glimmer/tracking ember-modifier tracked-built-ins

# npm
npm install --save-dev @ember/test-helpers @glimmer/component @glimmer/tracking ember-modifier tracked-built-ins

# Yarn
yarn add --dev @ember/test-helpers @glimmer/component @glimmer/tracking ember-modifier tracked-built-ins
```


## Introducing queues

Queues contain the state of file uploads as a user navigates around your application. They are the core of this addon.

To access a queue in your templates compose the [`let` helper](https://guides.emberjs.com/release/components/helper-functions/#toc_the-let-helper) with the `file-queue` helper like this:

```hbs
{{#let (file-queue name="photos") as |queue|}}
  Files in queue: {{queue.files.length}}
{{/let}}
```

The `name` property is optional but recommended as you may manage multiple queues in the future.

> ℹ️ You can also access queues in your app JavaScript by injecting the `fileQueue` service.
>
> ```js
> export default class ExampleComponent extends Component {
>   @service fileQueue;
>
>   get queue() {
>     return this.fileQueue.findOrCreate('photos');
>   }
> }
> ```

Once you have access to a queue, you can start [Uploading files](uploading.md).
