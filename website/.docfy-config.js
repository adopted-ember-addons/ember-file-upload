const path = require('path');
const autolinkHeadings = require('remark-autolink-headings');
const codeTitle = require('remark-code-titles');
const highlight = require('rehype-highlight');

/**
 * @type {import('@docfy/core/lib/types').DocfyConfig}
 */
module.exports = {
  repository: {
    url: 'https://github.com/adopted-ember-addons/ember-file-upload',
    editBranch: 'master',
  },
  tocMaxDepth: 3,
  remarkPlugins: [codeTitle, autolinkHeadings],
  rehypePlugins: [highlight],
  sources: [
    {
      root: path.resolve(__dirname, '../docs'),
      pattern: '*.md',
      urlSchema: 'manual',
      urlPrefix: 'docs',
    },
    {
      root: path.resolve(__dirname, '../docs/api'),
      pattern: '*/**.md',
      urlSchema: 'manual',
      urlPrefix: 'api',
    },
  ],
};
