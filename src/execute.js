import { exec } from "child_process";

const core = require("@actions/core");

/**
 * @param {string[]} array - Protocol that is being deployed
 * @param {string} callback
 */
async function runCommands(array, dependenciesLength, callback) {
  let index = 0;
  let deploymentResults = "";

  function next() {
    if (index < array.length) {
      exec(array[index], (error, stdout) => {
        index += 1;
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        if (error !== null) {
          // console.log('exec error: ' + error);
          index = array.length;
        }
        // do the next iteration
        if (index >= dependenciesLength) {
          deploymentResults += stdout;
          // console.log(stdout)
        }
        next();
      });
    } else {
      const deploymentResultsList = deploymentResults.split("\n");
      let deployments = "";
      let deploymentResultsFlag = false;
      for (const deploymentResult of deploymentResultsList) {
        if (deploymentResult.includes("RESULTS:")) {
          deploymentResultsFlag = true;
        } else if (deploymentResult.includes("END")) {
          deploymentResultsFlag = false;
        } else if (deploymentResultsFlag) {
          deployments += `${deploymentResult}\n`;
        }
      }

      if (deployments.includes("Deployment Failed:")) {
        core.setFailed("One or more deployments failed");
      }
      if (deployments.includes("Build Failed:")) {
        core.setFailed("One or more builds failed");
      }
      if (deployments === "") {
        core.setFailed(
          "Error in execution of deployments. See logs below. If empty post an issue in the Messari repo."
        );
      }
      console.log(`\nRESULTS:\n${deployments}END\n`);
      console.log(deploymentResults);
      callback();
    }
  }
  // start the first iteration
  next();
}

export default runCommands();
