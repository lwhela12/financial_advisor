/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Cache directory within project to avoid permission issues on OS temp dirs
  cacheDirectory: '<rootDir>/tmp/jest-cache',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  verbose: true,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  testMatch: ['**/*.spec.ts'],
  watchman: false,
};
