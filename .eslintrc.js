module.exports = {
  root: true,
  extends: ['@vben'],
  rules: {
    'no-undef': 'off',
  },
  overrides: [
    {
      // 由 ui-vue3 合并进来的组件源码，回调签名由各组件 API 固定，保留其原有写法
      files: ['src/core/components/ui/**/*.{js,ts,vue}'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { args: 'none', varsIgnorePattern: '^_' }],
      },
    },
  ],
};
