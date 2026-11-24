module.exports = {
  root: true,
  extends: ['@vben/stylelint-config'],
  rules: {
    // CSS View Transitions 已进入标准，但 stylelint 15 的 known 列表尚未收录
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'function',
          'if',
          'each',
          'include',
          'mixin',
          'extend',
          'view-transition',
        ],
      },
    ],
    'property-no-unknown': [true, { ignoreProperties: ['navigation'] }],
  },
};
