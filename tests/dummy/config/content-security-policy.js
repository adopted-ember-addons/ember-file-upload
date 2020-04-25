module.exports = function() {
  return {
    policy: {
      'default-src': ['\'none\''],
      'script-src': [
        '\'self\'',
        // script tag injected by ember-cli-addon-docs
        '\'sha256-vf+ZuKOhXq6af1D+7eWhmYHkEHMV8Z75nTtHTR7oFcg=\'',
        // Instanbul used by ember-cli-code-coverage uses eval by default through
        // `new Function('return this')`. It provides a configuratoin option
        // to prevent this but that one is not exposed by ember-cli-code-coverage
        // yet.
        // Additionally it injects a script tag into the page.
        // Please see details in this GitHub issue:
        // https://github.com/kategengler/ember-cli-code-coverage/issues/214#issuecomment-619398136
        process.env.COVERAGE ? '\'unsafe-eval\'' : null,
        process.env.COVERAGE ? '\'sha256-bOFF6I2TCLkFw5Vfln8TzDOIau151BOflG6fMzQXGY8=\'' : null
      ].filter(Boolean),
      'font-src': [
        '\'self\'',
        // font used in docs app
        'https://fonts.gstatic.com/'
      ],
      'connect-src': ['\'self\''],
      'img-src': [
        '\'self\'',
        // Provided mirage util extracts metadata from file. To do so it reads
        // the file as a data url and assign it to an <image> element as source.
        // This violates the CSP unless data protocol is allowed.
        //
        // TODO: Do not require data protocol to be whitelisted in CSP just for
        //       development utilities.
        'data:'
      ],
      'style-src': [
        '\'self\'',
        // stylesheet loaded for docs app
        'https://fonts.googleapis.com/css'
      ],
      'media-src': [
        '\'self\'',
        // The provided mirage util already discussed for image directive does
        // the same for other media types like video and audio.
        //
        // TODO: Do not require data protocol to be whitelisted in CSP just for
        //       development utilities.
        'data:'
      ]
    },
    reportOnly: false
  };
};
