export default {
   preset: "ts-jest",
   testEnvironment: "node",
   extensionsToTreatAsEsm: [".ts"],
   transform: {
      "^.+\\.ts$": [
         "ts-jest",
         {
            useESM: true,
         },
      ],
   },
   moduleNameMapper: {
      "^(\\.{1,2}/.*)\\.js$": "$1",
   },
   testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],
   collectCoverageFrom: [
      "services/**/*.ts",
      "models/**/*.ts",
      "!**/*.d.ts",
      "!**/node_modules/**",
   ],
   setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};
