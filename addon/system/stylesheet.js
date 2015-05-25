import Ember from 'ember';

const dasherize = Ember.String.dasherize;
const keys = Ember.keys;

function insertRule(styleSheet, selector, css, index) {
  if (css.length) {
    if (styleSheet.insertRule) {
      styleSheet.insertRule(`${selector} { ${css} }`, index);
    } else {
      styleSheet.addRule(selector, css, index);
    }
  }
}

function deleteRule(styleSheet, selector, index) {
  if (styleSheet.deleteRule) {
    styleSheet.deleteRule(selector, index);
  } else {
    styleSheet.removeRule(index);
  }
}

function toCSS(rules, format = { tab: '', newline: '' }) {
  if (rules == null) { return ''; }

  let css = Ember.A(keys(rules)).map((key) => {
    return `${format.tab}${key}: ${rules[key]};`;
  });
  return css.join(format.newline) + format.newline;
}

class Stylesheet {
  constructor(media='all') {
    const element = document.createElement('style');
    const head = document.getElementsByTagName('head')[0] ||
                 document.documentElement;
    element.type = 'text/css';
    element.media = media;
    this.media = media;
    this.element = element;
    this.id = this.element.id = Ember.guidFor(this);

    head.appendChild(element);

    this.styleSheet = document.styleSheets[document.styleSheets.length - 1];
    this.activeStyles = {};
    this.bufferedStyles = {};
    this.indexes = {};
  }

  destroy() {
    const head = document.getElementsByTagName('head')[0] ||
                 document.documentElement;
    head.removeChild(this.element);
    this.element = null;
    this.styleSheet = null;
    this.activeStyles = null;
    this.bufferedStyles = null;
    this.indexes = null;
  }

  rule(selector, styles) {
    this._locked = true;
    if (styles == null) {
      this.deleteSelector(selector);
    }

    for (let rule in styles) {
      if (!styles.hasOwnProperty(rule)) { continue; }

      let value = styles[rule];
      if (value == null) {
        this.deleteRule(selector, rule);
      } else if (typeof value === 'string') {
        this.insertRule(selector, rule, value);
      } else {
        if (rule.indexOf('&') !== -1) {
          rule = rule.replace(/&/g, selector);
        } else {
          rule = `${selector} ${rule}`;
        }
        this.rule(rule, value);
      }
    }

    this.sync();
    this._locked = false;
  }

  insertRule(selector, rule, value) {
    rule = dasherize(rule);
    this.bufferedStyles[selector] = this.bufferedStyles[selector] || {};
    this.bufferedStyles[selector][rule] = value;
    if (!this._locked) {
      this.sync();
    }
  }

  deleteRule(selector, rule) {
    rule = dasherize(rule);
    if (this.bufferedStyles[selector]) {
      delete this.bufferedStyles[selector][rule];
    }
    if (!this._locked) {
      this.sync();
    }
  }

  deleteSelector(selector) {
    delete this.styles[selector];
    if (!this._locked) {
      this.sync();
    }
  }

  sync() {
    const styleSheet = this.styleSheet;
    const indexes = this.indexes;
    const styles = this.bufferedStyles;

    this.changedSelectors().forEach((selector) => {
      let index = indexes[selector];
      let rules = styles[selector];
      if (index != null) {
        deleteRule(styleSheet, selector, index);
        delete indexes[selector];
      } else {
        indexes[selector] = styleSheet.cssRules ? styleSheet.cssRules.length : 0;
      }

      insertRule(styleSheet, selector, toCSS(rules), index);
    });

    this.activeStyles = Ember.copy(styles, true);
  }

  changedSelectors() {
    const activeStyles = this.activeStyles;
    const bufferedStyles = this.bufferedStyles;

    const changes = Ember.A([]);
    const selectors = Ember.A(keys(activeStyles).concat(keys(bufferedStyles))).uniq();
    selectors.forEach((selector) => {
      const activeRules = activeStyles[selector];
      const bufferedRules = bufferedStyles[selector];
      if (activeRules == null || bufferedRules == null) {
        changes.push(selector);
      } else {
        const rules = Ember.A(keys(bufferedRules).concat(keys(activeRules))).uniq();
        const hasChanges = rules.some((rule) => {
          return activeRules[rule] !== bufferedRules[rule];
        });
        if (hasChanges) {
          changes.push(selector);
        }
      }
    });

    return changes;
  }

  toString() {
    let sortedStyles = [];
    let styles = this.activeStyles;
    let indexes = this.indexes;
    for (let selector in styles) {
      let rules = styles[selector];
      let index = indexes[selector];
      sortedStyles[index] = {
        selector: selector,
        rules: rules
      };
    }

    let css = [];
    Ember.A(sortedStyles).forEach((style) => {
      let selector = [];
      if (style == null) { return; }
      selector.push(`${style.selector} {\n`);
      selector.push(toCSS(style.rules, { tab: '  ', newline: '\n' }));
      selector.push('}');
      css.push(selector.join(''));
    });
    return css.join('\n\n');
  }
}

export default Stylesheet;
