const core = require("@actions/core");
const DefaultMap = require("./defaultMap");
const { runCommands } = require("./execute");

const CHANGED_FILES = core.getInput("CHANGED_FILES").split(" ");
const ABSOLUTE_PATH = core.getInput("ABSOLUTE_PATH");

const DEPLOYMENT_CONFIGURATIONS_JSON = require(`${ABSOLUTE_PATH}/deployment/deployment.json`);
const DEPLOYMENT_CONFIGURATIONS = JSON.parse(
  JSON.stringify(DEPLOYMENT_CONFIGURATIONS_JSON)
);

const doNotPrintProtocols = new Set(['beefy-finance'])

async function deploySubgraphs(
  CHANGED_FILES,
  ABSOLUTE_PATH,
  DEPLOYMENT_CONFIGURATIONS,
  doNotPrintProtocols
) {
  let deployAny = 0;

  const deployProtocol = new DefaultMap(() => new Set());
  const deployDirectoryNotSpecified = new Set();

  // Iterate through all changed files
  for (const file of CHANGED_FILES) {
    // If changed file is within a directory containing deployment code.
    if (file.includes("subgraphs/")) {
      const subgraphDir = file.split("subgraphs/")[1].split("/")[0];

      if (file.includes("/src/")) {
        const refFolder = file.split("/src/")[0].split("/").reverse()[1];

        // If src code is in common code folder for the directory
        if (refFolder.includes("subgraphs")) {
          let dirPresent = false;
          for (const protocolData of Object.values(DEPLOYMENT_CONFIGURATIONS)) {
            if (protocolData.base === subgraphDir) {
              deployProtocol.get(subgraphDir).add(protocolData.protocol);
              dirPresent = true;
              deployAny = 1;
            }
          }

          if (!dirPresent) {
            deployDirectoryNotSpecified.add(subgraphDir);
          }
        } else if (refFolder.includes("protocols")) {
          const protocol = file.split("/src/")[0].split("/").reverse()[0];
          deployProtocol.get(subgraphDir).add(protocol);
          deployAny = 1;
        }
      } else if (file.includes("/config/")) {
        const refFolder = file.split("/config/")[0].split("/").reverse()[1];

        if (refFolder.includes("protocols")) {
          const refFolder2 = file.split("/config/")[1].split("/")[0];

          if (refFolder2.includes("networks")) {
            const protocol = file.split("/config/")[0].split("/").reverse()[0];
            deployProtocol.get(subgraphDir).add(protocol);
            deployAny = 1;
          }
        } else {
          console.log(
            "Warning: config/ folder should be located at subgraphs/**subgraph**/protocols/config/"
          );
        }
      }
    }
  }

  // If a relevant file was changed, install dependencies and deploy subgraphs
  const scripts = [];
  if (deployAny === 1) {
    scripts.push("npm install -g @graphprotocol/graph-cli");
    scripts.push("npm install --dev @graphprotocol/graph-ts");
    scripts.push("npm install mustache");
    scripts.push("npm install minimist");
    const dependenciesLength = scripts.length;

    let directoriesNotSpecified = [];

    let directories = [];
    let protocols = [];

    directoriesNotSpecified = Array.from(deployDirectoryNotSpecified);
    for (const directoryNotSpecified of directoriesNotSpecified) {
      console.log(
        `Warning: ${directoryNotSpecified} directory is not specified in the deployment configurations\n`
      );
    }

    // Deploy protocols if relevant
    directories = [...deployProtocol.keys()];
    for (const directory of directories) {
      protocols = Array.from(deployProtocol.get(directory));
      for (const protocol of protocols) {
        const path = `${ABSOLUTE_PATH}/subgraphs/${directory}`;
        if (doNotPrintProtocols.has(protocol)) {
          scripts.push(
            `npm --prefix ${path} run -s build --ID=${protocol} --SPAN=protocol --DEPLOY=false --PRINTLOGS=false`
          );
        } else {
          scripts.push(
            `npm --prefix ${path} run -s build --ID=${protocol} --SPAN=protocol --DEPLOY=false --PRINTLOGS=true`
          );
          }
      }
    }

    console.log("Running scripts: ");
    console.log(scripts);
    runCommands(scripts, dependenciesLength, () => {});
  }
}

deploySubgraphs(CHANGED_FILES, ABSOLUTE_PATH, DEPLOYMENT_CONFIGURATIONS, doNotPrintProtocols);
