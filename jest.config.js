module.exports = {
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**/*.{js,jsx}",
  ],
  "coveragePathIgnorePatterns": [
    "/node_modules/",
    "/tests/"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 40,
      "functions": 40,
      "lines": 40,
      "statements": 40
    }
  },
  "testEnvironment": "node",
  "testMatch": ["<rootDir>/tests/units/**/*.spec.js", "<rootDir>/tests/integrations/**/*.spec.js"],
  "transformIgnorePatterns": ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"],
  "testPathIgnorePatterns": [
    "<rootDir>/(dist|docs|dll|config|flow-typed|node_modules)/"
  ]
};