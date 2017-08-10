import FormDataUploader from 'ember-file-upload/uploaders/base';

/**
  BinaryUploader

  @class FormDataUploader
  @extends Ember.Object
 */
export default FormDataUploader.extend({

  defaultOptions: {
    method: 'POST',
    headers: {
      accepts: 'application/json,text/javascript'
    },
    data: {},
    fileKey: 'file',
    withCredentials: false,
    contentType: 'application/octet-stream'
  },

  createData(file) {
    return file.get('blob');
  }

});
