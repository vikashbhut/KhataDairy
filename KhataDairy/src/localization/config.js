// @flow

import I18n from 'react-native-i18n';

const english = require('./Languages/en.json');
const gujrati = require('./Languages/gu.json');

// Enable fallbacks if you want `en-US` and `en-GB` to fallback to `en`
I18n.fallbacks = true;

/**
 * A method for selected language.
 * @getCurrentSelectedLanguage
 *
 * @summary This method returns selected language file.
 *
 */
function getCurrentSelectedLanguage(languageCode) {
  // All other translations for the app goes to the respective language file:
  switch (languageCode) {
    case 'gu':
      I18n.translations.gu = gujrati;
    default:
      I18n.translations.en = english;
  }
}

/**
 * A method for get locale language text.
 * @getLocalizedText
 *
 * @summary This method will provide a locale text.
 *
 */
export function getLocalizedText(text) {
  I18n.locale = 'gu';
  const languageCode = I18n.locale.substr(0, 2);
  getCurrentSelectedLanguage(languageCode);
  return I18n.t(text);
}

export function setLanguage(lang) {
  I18n.locale = lang;
}
