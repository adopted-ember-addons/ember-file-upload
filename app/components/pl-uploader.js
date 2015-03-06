import PlUploader from "ember-plupload/components/pl-uploader";
import config from "../config/environment";

var BASE_URL = config.PLUPLOAD_BASE_URL;

if (BASE_URL == null) {
  if (config.baseURL.slice(-1) === '/') {
    BASE_URL = config.baseURL + 'assets/';
  } else {
    BASE_URL = config.baseURL + '/assets/';
  }
}

export default PlUploader.extend({
  BASE_URL: BASE_URL
});
