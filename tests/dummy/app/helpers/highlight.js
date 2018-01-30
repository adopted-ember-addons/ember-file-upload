import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export default helper(function (params) {
  return htmlSafe(params.join('').replace(/([a-z]+)=/g, function (_, attr) {
    return `<span class='attribute'>${attr}</span>=`;
  }).replace(/("[^"]*"|true|false)/g, function (string) {
    return `<span class='string'>${string}</span>`;
  }).replace(/title/, function (title) {
    return '<span class="helper">' + title + '</span>';
  }).replace(/[a-z]+\.[a-z]+/g, function (title) {
    return '<span class="literal">' + title + '</span>';
  }));
});
