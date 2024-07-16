module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/cdk.out/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
