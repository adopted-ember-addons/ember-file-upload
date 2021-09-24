import { deprecate } from '@ember/debug';

export default (oldEventName, newEventName) => {
  deprecate(
    `Usage of ${oldEventName} is deprecated, use ${newEventName} instead.`,
    false,
    {
      id: 'ember-file-upload.deprecate-non-camel-case-events',
      since: '4.0.0',
      until: '5.0.0',
      for: 'ember-file-upload',
    }
  );
};
