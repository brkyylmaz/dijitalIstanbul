import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { NativeModules, Platform } from 'react-native';
import { get_key, set_key } from './fs.js';
import RNRestart from "react-native-restart";

import tr_trans from "../assets/languages/tr.json";
import en_trans from "../assets/languages/en.json";
import de_trans from "../assets/languages/de.json";
import ar_trans from "../assets/languages/ar.json";
import ru_trans from "../assets/languages/ru.json";

// Define types
type Lang = {
  flag: string;
  code: string;
  display_name: string;
  translation: Record<string, string>; // Assuming translation is a simple key-value object
  rtl?: boolean;
};

type LangList = Lang[];

const default_lang: string = "tr";

const lang_list: LangList = [
  {
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/80px-Flag_of_Turkey.svg.png",
    code: "tr",
    display_name: "Turkce",
    translation: tr_trans
  },
  {
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/84px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png",
    code: "en",
    display_name: "English",
    translation: en_trans
  },
  {
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Flag_of_Germany_%28RGB%29.svg/330px-Flag_of_Germany_%28RGB%29.svg.png",
    code: "de",
    display_name: "Deutsch",
    translation: de_trans
  },
  {
    flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/330px-Flag_of_Saudi_Arabia.svg.png",
    code: "ar",
    display_name: "عربي",
    translation: ar_trans,
    rtl: true,
  },
  {
    flag: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Flag_of_Russia.svg/330px-Flag_of_Russia.svg.png",
    code: "ru",
    display_name: "Русский",
    translation: ru_trans
  }
];

// Function to strip locale
const strip_locale = (lang_code: string = "en-US"): string => lang_code.split(/[_-]/)[0];

// Function to get device language
const device_lang: string = (() => {
  const deviceLanguage =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
      : NativeModules.I18nManager.localeIdentifier;

  return strip_locale(deviceLanguage);
})();

// Change language function
const change_lang = async (lang_code: string = default_lang): Promise<void> => {
  if (lang_list.findIndex((e) => e.code === lang_code) > -1) {
    await set_key("lang_setting", lang_code);
  } else {
    return;
  }

  await i18n.changeLanguage(lang_code);

  if (__DEV__) {
    NativeModules.DevSettings.reload();
  } else {
    RNRestart.restart();
  }
};

// Translation function alias
const t = i18n.t;

// Initialize i18n
(async () => {
  const set_lang = await get_key("lang_setting").catch(() => null);

  const start_lang = set_lang || (
    lang_list.findIndex((l) => l.code === device_lang) === -1
      ? default_lang
      : device_lang
  );

  const resources: Record<string, { translation: Record<string, string> }> = {};
  lang_list.forEach((l) => {
    resources[l.code] = { translation: l.translation };
  });

  const i18nOptions: InitOptions = {
    debug: true,
    compatibilityJSON: 'v3',
    lng: start_lang, // Default language
    fallbackLng: default_lang,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    resources: resources
  };

  i18n
    .use(initReactI18next) // Initializes react-i18next
    .init(i18nOptions, (e) => {
      if (e) {
        console.error("i18n init err!:", e);
        return;
      }
      console.log("i18n init");
    });
})();

export default i18n;
export {
  t,
  lang_list,
  device_lang,
  change_lang,
  strip_locale,
};
