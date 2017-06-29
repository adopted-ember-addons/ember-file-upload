import Ember from 'ember';
import $ from 'jquery';

function remoteFilename(filename) {
  return '/' + filename.match(/\.tmp\/(.*)$/)[1].trim();
}

function localFilename(filename) {
  let match = filename.match(/^(.*)\/tmp\/.*\.tmp\/(.*)$/);
  return (match[1] + '/' + match[2]).trim();
}

export default Ember.Route.extend({
  model() {
    return $.get(`${location.pathname}docs/data.json`).then(function (docs) {
      docs.classitems.forEach(function (classitem) {
        docs.classes[classitem.class].classitems.push(classitem);
        docs.classes[classitem.class].file = remoteFilename(classitem.file);
      });

      return {
        components: Ember.A(Object.values(docs.elements)),
        services: Ember.A(Object.values(docs.classes).filter(function (service) {
          return service.file.indexOf('/services/') !== -1;
        })),
        objects: Ember.A(Object.values(docs.classes).filter(function (service) {
          return service.file.indexOf('/services/') === -1;
        })),
        helpers: Ember.A(Object.values(docs.classitems).filter(function (method) {
          return method.file.indexOf('/helpers/') !== -1;
        })),
        warnings: docs.warnings.map(function (warning) {
          warning.line = localFilename(warning.line);
          warning.file = warning.line.replace(/:\d+$/, '');
          return warning;
        })
      };
    });
  }
});
