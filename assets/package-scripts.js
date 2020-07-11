/* eslint-disable @typescript-eslint/no-var-requires */
const settings = require("./.env-cmdrc");
const { apiUrlReactEnv, noLogReactEnv } = require("./src/utils/env-variables");

const distFolderName = "build";
const reactScript = "react-app-rewired"; // provides HMR
// const reactScript = "react-scripts";

const api_url = process.env.API_URL;

const dev_envs = `BROWSER=none EXTEND_ESLINT=true TSC_COMPILE_ON_ERROR=true REACT_APP_API_URL=${api_url} `;

const startServer = `yarn ${reactScript} start`;

const test_envs =
  "API_URL=http://localhost:4022 IS_UNIT_TEST=true NODE_ENV=test";

const test = `${test_envs} yarn react-scripts test --runInBand`;

function buildFn(flag) {
  const reactBuild = `yarn ${reactScript} build`;
  const preBuild = `rimraf ${distFolderName}/*`;

  let env;

  switch (flag) {
    case "prod":
      env = "prod";
      break;
    default:
      throw new Error("Please specify environment (e.g. 'prod') to build for!");
  }

  const envStmt = `env-cmd -e ${env}`;

  return `${preBuild} && \
    ${apiUrlReactEnv}=${settings.prod.API_URL} \
    ${noLogReactEnv}=true \
    ${envStmt} ${reactBuild}
`;
}

module.exports = {
  scripts: {
    dev: `${dev_envs} ${startServer}`,
    e2eDev: `REACT_APP_API_URL=${api_url} env-cmd -e e2eDev ${startServer}`,
    build: {
      default: buildFn("prod"),
      serve: {
        prod: `${buildFn("prod")} yarn start serve`,
      },
    },
    test: {
      default: `CI=true ${test}`,
      d: `CI=true env-cmd ${test_envs} react-scripts --inspect-brk test --runInBand --no-cache  `, // debug
      dw: `${test_envs} react-scripts --inspect-brk test --runInBand --no-cache`, // debug watch
      // "node --inspect node_modules/.bin/jest --runInBand"
      w: test,
      wc: `${test} --coverage`,
      c: `rimraf coverage && CI=true ${test} --coverage`,
    },
    serve: `serve -s ${distFolderName} -l ${settings.serve.port}`,
    typeCheck: {
      default: "tsc --project .",
      cypress: "tsc --project ./cypress",
    },
    lint: "eslint . --ext .js,.jsx,.ts,.tsx",
  },
};
