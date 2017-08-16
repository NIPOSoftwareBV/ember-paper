/**
 * @module ember-paper
 */
import Ember from 'ember';
import layout from '../templates/components/paper-select';
import PowerSelect from 'ember-power-select/components/power-select';
import ValidationMixin from 'ember-paper/mixins/validation-mixin';
import ChildMixin from 'ember-paper/mixins/child-mixin';
import FocusableMixin from 'ember-paper/mixins/focusable-mixin';

const { computed, testing } = Ember;

function concatWithProperty(strings, property) {
  if (property) {
    strings.push(property);
  }
  return strings.join(' ');
}

/**
 * @class PaperSelect
 * @extends PaperInput
 */
export default PowerSelect.extend(ValidationMixin, ChildMixin, FocusableMixin, {
  layout,
  tagName: 'md-input-container',
  onchange: computed.alias('onChange'),
  optionsComponent: 'paper-select-options',
  triggerComponent: 'paper-select-trigger',
  beforeOptionsComponent: 'paper-select-search',
  classNameBindings: ['isInvalidAndTouched:md-input-invalid', 'selected:md-input-has-value', 'focusedAndSelected:md-input-focused'],
  searchEnabled: false,
  validationProperty: 'selected',
  isTouched: false,
  isInvalidAndTouched: computed.and('isInvalid', 'isTouched'),
  attributeBindings: ['parentTabindex:tabindex'],
  shouldShowLabel: computed.and('label', 'selected'),
  focusedAndSelected: computed.and('focused', 'selected'),

  didReceiveAttrs() {
    this._super(...arguments);
    this.notifyValidityChange();
  },

  concatenatedTriggerClasses: computed('triggerClass', 'publicAPI.isActive', function() {
    let classes = ['ember-power-select-trigger'];
    if (this.get('isInvalid')) {
      classes.push('ng-invalid');
    }
    if (this.get('isTouched')) {
      classes.push('ng-dirty');
    }
    if (this.get('publicAPI.isActive')) {
      classes.push('ember-power-select-trigger--active');
    }
    return concatWithProperty(classes, this.get('triggerClass'));
  }),
  actions: {
    choose(selected, e) {
      // _super is not called intentionally; PowerSelect requires the mouse to move vertically
      // for at least 2 pixels, which does not work well in material design, where the first option
      // is always overlapping the select.
      // choose is fired on the 'mouseup' event that actually accompanies the 'mousedown' event
      // that is captured in 'this.openingEvent'. So we need to skip the first 'mouseup' we encounter
      // if the openingEvent was indeed a 'mousedown'
      if (testing) {
        // a problem in in 'ember-testing/helpers/click' prevents this hack from working, so revert to 'default'
        // behaviour when testing
        return this._super(...arguments);
      }
      if (!this.openingFinished && this.openingEvent.type === 'mousedown' && e && e.type === 'mouseup') {
        this.openingFinished = e;
        return;
      }
      this.openingFinished = undefined;
      // this is a copy of the rest of the code in PowerSelect.actions.choose
      let publicAPI = this.get('publicAPI');
      publicAPI.actions.select(this.get('buildSelection')(selected, publicAPI), e);
      if (this.get('closeOnSelect')) {
        publicAPI.actions.close(e);
        return false;
      }
    },
    onClose() {
      this._super(...arguments);
      this.set('isTouched', true);
      this.notifyValidityChange();
    },
    onOpen() {
      this._super(...arguments);
      this.notifyValidityChange();
    }
  }
});
