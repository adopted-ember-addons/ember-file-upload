import '@glint/environment-ember-loose';
import type EmberFileUploadRegistry from 'ember-file-upload/template-registry';
import DemoUpload from 'test-app/components/demo-upload';
import toString from 'test-app/helpers/to-string';
import perform from 'ember-concurrency/helpers/perform';

// Types for compiled templates
declare module 'test-app/templates/*' {
  import { TemplateFactory } from 'ember-cli-htmlbars';

  const tmpl: TemplateFactory;
  export default tmpl;
}

declare module '@ember/version' {
  const VERSION: string;

  export { VERSION };
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends EmberFileUploadRegistry {
    DemoUpload: typeof DemoUpload;
    'to-string': typeof toString;
    perform: typeof perform;
  }
}
