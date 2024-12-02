import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const usePageTitle = (titleKey: string, defaultTitle = 'Quick Note Garden') => {
  const { t } = useTranslation();

  useEffect(() => {
    const translatedTitle = titleKey ? t(titleKey) : defaultTitle;
    document.title = `${translatedTitle} | Quick Note Garden`;
  }, [titleKey, t, defaultTitle]);
};
