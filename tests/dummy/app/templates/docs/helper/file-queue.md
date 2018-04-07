<!-- TODO remove when https://github.com/ember-learn/ember-cli-addon-docs/issues/136 is fixed -->

# FileQueue Helper

`file-queue` is one of the core primitives of ember-file-upload.
It has three different flavors of invocation. The first is
a bare call, which will return the master queue:

```hbs
{{#with (file-queue) as |queue|}}
  {{queue.progress}}%
{{/with}}
```

If called with a `name` property, it will return the queue
of that name:

```hbs
{{#with (file-queue name="photos") as |queue|}}
  {{queue.progress}}%
{{/with}}
```
