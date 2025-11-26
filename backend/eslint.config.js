import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/', 'dist/', 'coverage/']
  },
  {
    rules: {
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'no-console': 'off' // Allow console.log for server logging
    }
  }
];

