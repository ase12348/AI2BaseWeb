import { t } from '@/core/locales/setupI18n';

const getTypeName = ({ csType }: { csType: string }) => {
  switch (csType.toLowerCase()) {
    case 'string':
    case 'text':
      return t('字符');
    case 'int':
    case 'int64':
    case 'int32':
    case 'int16':
    case 'long':
    case 'short':
    case 'decimal':
    case 'double':
    case 'float':
      return t('数字');
    case 'datetime':
      return t('日期');
    case 'bool':
      return t('布尔');
    default:
      return csType;
  }
};
const getColor = ({ csType }: { csType: string }) => {
  switch (csType.toLowerCase()) {
    case 'string':
    case 'text':
      return 'var(--color-primary)';
    case 'int':
    case 'int64':
    case 'int32':
    case 'int16':
    case 'long':
    case 'short':
    case 'decimal':
    case 'double':
    case 'float':
      return 'var(--color-warning)';
    case 'datetime':
      return 'var(--color-success)';
    case 'bool':
      return 'var(--color-error)';
    default:
      return 'var(--color-text)';
  }
};

export { getTypeName, getColor };
