/*
 * @Author: WangZhuoYi 13317149311@163.com
 * @Date: 2023-07-25 10:41:42
 * @LastEditors: WangZhuoYi 13317149311@163.com
 * @LastEditTime: 2023-07-25 15:31:39
 * @FilePath: /vite-project/.eslintrc.cjs
 * @Description:
 */
// eslint-disable-next-line no-undef
module.exports = {
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
	plugins: ['react-refresh'],
	rules: {
		'react-refresh/only-export-components': 'warn',
		'@typescript-eslint/no-explicit-any': 'off',
		'react-hooks/exhaustive-deps': 'off',
	},
}
