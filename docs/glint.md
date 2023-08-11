---
order: 5
---

# Glint types

All components and helpers have proper [Glint](https://github.com/typed-ember/glint) types, which allow you when using TypeScript to get strict type checking in your templates.

Unless you are using [strict mode](http://emberjs.github.io/rfcs/0496-handlebars-strict-mode.html) templates (via [first class component templates](http://emberjs.github.io/rfcs/0779-first-class-component-templates.html)),
you need to import the addon's Glint template registry and `extend` your app's registry declaration as described in the [Using Addons](https://typed-ember.gitbook.io/glint/using-glint/ember/using-addons#using-glint-enabled-addons) documentation:

```ts
import '@glint/environment-ember-loose';

import type EmberFileUploadRegistry from 'ember-file-upload/template-registry';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends EmberFileUploadRegistry, /* other addon registries */ {
    // local entries
  }
}
```

Should you want to manage the registry by yourself, then omit this import, and instead add the entries in your app by explicitly importing the types of the components and helpers from this addon.

> Note that Glint itself is still under active development, and as such breaking changes might occur. Therefore, Glint support by this addon is also considered experimental, and not covered by our SemVer contract!
