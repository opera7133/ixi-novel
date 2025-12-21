import { ja } from '../i18n/ja';
import { en } from '../i18n/en';

export const getTranslations = () => {
  const locale = import.meta.env.LOCALE ?? 'ja';
  return locale === 'en' ? en : ja;
};
