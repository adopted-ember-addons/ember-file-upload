var RSVP = require('rsvp');

module.exports = {
  normalizeEntityName: function () {},

  afterInstall: function () {
    return RSVP.all([
      this.addBowerPackageToProject('plupload', 'v2.1.8'),
      this.addBowerPackageToProject('dinosheets', '0.1.1'),
    ]);
  }
};
