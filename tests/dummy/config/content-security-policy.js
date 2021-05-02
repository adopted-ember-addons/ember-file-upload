module.exports = function() {
  return {
    policy: {
      'default-src': ['\'none\''],
      'script-src': [
        '\'self\'',
        // script tag injected by ember-cli-addon-docs
        '\'sha256-vf+ZuKOhXq6af1D+7eWhmYHkEHMV8Z75nTtHTR7oFcg=\''
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
