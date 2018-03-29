import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

// This method is taken from
// https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/ajax/parseXML.js

export default function parseXML(data) {
    let xml;
    if (!data || typeof data !== "string" ) {
      return null;
    }

    // Support: IE 9 - 11 only
    // IE throws on parseFromString with invalid input.
    try {
      xml = (new window.DOMParser()).parseFromString( data, "text/xml" );
    } catch ( e ) {
      xml = undefined;
    }

    if (DEBUG) {
      if (!xml || xml.getElementsByTagName( "parsererror" ).length) {
        assert(`Invalid XML: ${data}`);
      }
    }
    return xml;
}
