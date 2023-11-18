import Component from '@glimmer/component';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { htmlSafe } from '@ember/template';

export const UPLOAD_TYPES = {
  simulated: 'Simulated 🧑‍🔬',
  http: 'HTTP 📡',
};

// Simulated
// Values in kilobits per second (kbps)
const RATES = {
  'Disconnected - 0 Mbps': 0,
  'Very slow - 0.1 Mbps': 100,
  'Slow 3G - 0.4 Mbps': 400,
  'Fast 3G - 0.675 Mbps': 675,
  'ADSL - 1.5 Mbps': 1_500,
  '4G/LTE - 50 Mbps': 50_000,
  'Fast Fibre - 100 Mbps': 100_000,
};
const DEFAULT_RATE = RATES['Fast 3G - 0.675 Mbps'];

// HTTP
const DEFAULT_URL = 'https://m6v5v.wiremockapi.cloud/files';
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD'];
const DEFAULT_METHOD = 'POST';
const DEFAULT_HEADERS = {
  Authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l',
};

export const DEFAULT_OPTIONS = {
  type: UPLOAD_TYPES.simulated,
  // Simulated
  rate: DEFAULT_RATE,
  // HTTP
  url: DEFAULT_URL,
  method: DEFAULT_METHOD,
  headers: DEFAULT_HEADERS,
};

const eq = (a, b) => a === b;

export default class OptionsFormComponent extends Component {
  @action
  setOptions(event) {
    const formData = new FormData(event.currentTarget);
    const entries = Object.fromEntries(formData.entries());
    const uploadOptions = {
      ...entries,
      rate: parseInt(entries.rate, 10),
      headers: JSON.parse(entries.headers),
    };
    this.args.onUpdate(uploadOptions);
  }

  // Keep forms in DOM to prevent data loss
  toggleVisibility = (type) => {
    return this.args.uploadOptions.type === type
      ? htmlSafe('')
      : htmlSafe('display: none');
  };

  <template>
    <form aria-label='Upload options' {{on 'change' this.setOptions}}>
      <fieldset>
        <legend>Upload type:</legend>
        {{#each (Object.values UPLOAD_TYPES) as |type|}}
          <div>
            <input
              type='radio'
              name='type'
              id={{type}}
              value={{type}}
              checked={{eq @uploadOptions.type type}}
            />
            <label for={{type}}>{{type}}</label>
          </div>
        {{/each}}
      </fieldset>

      <label style={{this.toggleVisibility UPLOAD_TYPES.simulated}}>
        Simulated speed:
        <select name='rate'>
          {{#each-in RATES as |name rate|}}
            <option value={{rate}} selected={{eq @uploadOptions.rate rate}}>
              {{name}}
            </option>
          {{/each-in}}
        </select>
      </label>

      <label style={{this.toggleVisibility UPLOAD_TYPES.http}}>
        URL:
        <input type='text' name='url' value={{DEFAULT_URL}} />
      </label>

      <label style={{this.toggleVisibility UPLOAD_TYPES.http}}>
        Method:
        <select name='method'>
          {{#each METHODS as |method|}}
            <option value={{method}} selected={{eq @uploadOptions.method method}}>
              {{method}}
            </option>
          {{/each}}
        </select>
      </label>

      <label style={{this.toggleVisibility UPLOAD_TYPES.http}}>
        Headers:
        <textarea name='headers' rows='5' spellcheck='false'>{{JSON.stringify
            DEFAULT_HEADERS
            null
            2
          }}</textarea>
      </label>
    </form>
  </template>
}
