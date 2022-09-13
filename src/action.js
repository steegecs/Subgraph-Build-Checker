const core = require('@actions/core')
const DefaultMap = require('./DefaultMap');
const { runCommands } = require('./execute');

const CHANGED_FILES = core.getInput('CHANGED_FILES').split(" ")
const ABSOLUTE_PATH = core.getInput('ABSOLUTE_PATH')
const GRAPH_DEPLOYMENT_LOCATION = core.getInput('GRAPH_DEPLOYMENT_LOCATION')

const DEPLOYMENT_CONFIGURATIONS_JSON = require(ABSOLUTE_PATH + "/deployment/deployment.json");
const DEPLOYMENT_CONFIGURATIONS = JSON.parse(JSON.stringify(DEPLOYMENT_CONFIGURATIONS_JSON));

async function deploySubgraphs(CHANGED_FILES, ABSOLUTE_PATH, GRAPH_DEPLOYMENT_LOCATION, DEPLOYMENT_CONFIGURATIONS) {
    let deployAny = 0

    let deployProtocol = new DefaultMap(() => new Set());
    let deployDirectoryNotSpecified = new Set()

    // Iterate through all changed files
    for (let i = 0; i < CHANGED_FILES.length; i++) {

        // If changed file is within a directory containing deployment code.
        if (CHANGED_FILES[i].includes("subgraphs/")) {

            let subgraphDir = CHANGED_FILES[i].split('subgraphs/')[1].split('/')[0]

            if (CHANGED_FILES[i].includes("/src/")) {
                let refFolder = CHANGED_FILES[i].split('/src/')[0].split('/').reverse()[1]

                // If src code is in common code folder for the directory
                if (refFolder.includes('subgraphs')) {
                    let dirPresent = false
                    for (const [protocol, protocolData] of Object.entries(DEPLOYMENT_CONFIGURATIONS)) {
                        if (protocolData["base"] == subgraphDir) {
                            deployProtocol.get(subgraphDir).add(protocolData['protocol']);
                            dirPresent = true
                            deployAny=1
                        }
                    }

                    if (!dirPresent) {
                        deployDirectoryNotSpecified.add(subgraphDir)
                    }
                } else if (refFolder.includes('protocols')) {
                    protocol = CHANGED_FILES[i].split('/src/')[0].split('/').reverse()[0]
                    deployProtocol.get(subgraphDir).add(protocol)
                    deployAny=1
                }
            } else if (CHANGED_FILES[i].includes("/config/")) {

                let refFolder = CHANGED_FILES[i].split('/config/')[0].split('/').reverse()[1]

                if (refFolder.includes('protocols')) {
                    let refFolder2 = CHANGED_FILES[i].split('/config/')[1].split('/')[0]

                    if (refFolder2.includes('networks')) {
                        let protocol = CHANGED_FILES[i].split('/config/')[0].split('/').reverse()[0]
                        deployProtocol.get(subgraphDir).add(protocol)
                        deployAny=1
                    }
                } else {
                    console.log("Warning: config/ folder should be located at subgraphs/**subgraph**/protocols/config/")
                }
            }
        }
    }

    

    // If a relevant file was changed, install dependencies and deploy subgraphs
    let scripts = []
    if (deployAny == 1) {
        scripts.push('npm install -g @graphprotocol/graph-cli')
        scripts.push('npm install --dev @graphprotocol/graph-ts')
        scripts.push('npm install mustache')
        scripts.push('npm install minimist')
        let dependenciesLength = scripts.length

        let directoriesNotSpecified = []

        let directories = []
        let protocols = []

        directoriesNotSpecified = Array.from(deployDirectoryNotSpecified)
        for (let i = 0; i < directoriesNotSpecified.length; i++) {
            console.log("Warning: " + directoriesNotSpecified[i] + " directory is not specified in the deployment configurations\n")
        }

        // Deploy protocols if relevant
        directories = [...deployProtocol.keys()]
        for (let i = 0; i < directories.length; i++) {
            protocols = Array.from(deployProtocol.get(directories[i]));
            for (let j = 0; j < protocols.length; j++) {
                let path = ABSOLUTE_PATH + '/subgraphs/' + directories[i]
                scripts.push('npm --prefix ' + path + ' run -s build --ID=' + protocols[j] + " --SPAN=protocol" + ' --DEPLOY=false' + ' --PRINTLOGS=true')
            }
        }

    console.log("Running scripts: ")
    console.log(scripts)
    runCommands(scripts, dependenciesLength, function() {})
    }
}

deploySubgraphs(CHANGED_FILES, ABSOLUTE_PATH, GRAPH_DEPLOYMENT_LOCATION, DEPLOYMENT_CONFIGURATIONS);