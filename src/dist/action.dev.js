"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var core = require("@actions/core");

var DefaultMap = require("./defaultMap");

var _require = require("./execute"),
    runCommands = _require.runCommands;

var CHANGED_FILES = core.getInput("CHANGED_FILES").split(" ");
var ABSOLUTE_PATH = core.getInput("ABSOLUTE_PATH");

var DEPLOYMENT_CONFIGURATIONS_JSON = require("".concat(ABSOLUTE_PATH, "/deployment/deployment.json"));

var DEPLOYMENT_CONFIGURATIONS = JSON.parse(JSON.stringify(DEPLOYMENT_CONFIGURATIONS_JSON));
var doNotPrintProtocols = new Set(['beefy-finance']);

function deploySubgraphs(CHANGED_FILES, ABSOLUTE_PATH, DEPLOYMENT_CONFIGURATIONS, doNotPrintProtocols) {
  var deployAny, deployProtocol, deployDirectoryNotSpecified, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file, subgraphDir, refFolder, dirPresent, _i, _Object$values, protocolData, _protocol, _refFolder, refFolder2, _protocol2, scripts, dependenciesLength, directoriesNotSpecified, directories, protocols, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, directoryNotSpecified, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, directory, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, protocol, path;

  return regeneratorRuntime.async(function deploySubgraphs$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          deployAny = 0;
          deployProtocol = new DefaultMap(function () {
            return new Set();
          });
          deployDirectoryNotSpecified = new Set(); // Iterate through all changed files

          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 6;

          for (_iterator = CHANGED_FILES[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            file = _step.value;

            // If changed file is within a directory containing deployment code.
            if (file.includes("subgraphs/")) {
              subgraphDir = file.split("subgraphs/")[1].split("/")[0];

              if (file.includes("/src/")) {
                refFolder = file.split("/src/")[0].split("/").reverse()[1]; // If src code is in common code folder for the directory

                if (refFolder.includes("subgraphs")) {
                  dirPresent = false;

                  for (_i = 0, _Object$values = Object.values(DEPLOYMENT_CONFIGURATIONS); _i < _Object$values.length; _i++) {
                    protocolData = _Object$values[_i];

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
                  _protocol = file.split("/src/")[0].split("/").reverse()[0];
                  deployProtocol.get(subgraphDir).add(_protocol);
                  deployAny = 1;
                }
              } else if (file.includes("/config/")) {
                _refFolder = file.split("/config/")[0].split("/").reverse()[1];

                if (_refFolder.includes("protocols")) {
                  refFolder2 = file.split("/config/")[1].split("/")[0];

                  if (refFolder2.includes("networks")) {
                    _protocol2 = file.split("/config/")[0].split("/").reverse()[0];
                    deployProtocol.get(subgraphDir).add(_protocol2);
                    deployAny = 1;
                  }
                } else {
                  console.log("Warning: config/ folder should be located at subgraphs/**subgraph**/protocols/config/");
                }
              }
            }
          } // If a relevant file was changed, install dependencies and deploy subgraphs


          _context.next = 14;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](6);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 14:
          _context.prev = 14;
          _context.prev = 15;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 17:
          _context.prev = 17;

          if (!_didIteratorError) {
            _context.next = 20;
            break;
          }

          throw _iteratorError;

        case 20:
          return _context.finish(17);

        case 21:
          return _context.finish(14);

        case 22:
          scripts = [];

          if (!(deployAny === 1)) {
            _context.next = 103;
            break;
          }

          scripts.push("npm install -g @graphprotocol/graph-cli");
          scripts.push("npm install --dev @graphprotocol/graph-ts");
          scripts.push("npm --prefix ".concat(ABSOLUTE_PATH, "/messari-cli install -g ./"));
          scripts.push("npm --prefix ".concat(ABSOLUTE_PATH, "/messari-cli install"));
          scripts.push("npm install mustache");
          scripts.push("npm install minimist");
          scripts.push("npm install -g ./");
          dependenciesLength = scripts.length;
          directoriesNotSpecified = [];
          directories = [];
          protocols = [];
          directoriesNotSpecified = Array.from(deployDirectoryNotSpecified);
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 39;

          for (_iterator2 = directoriesNotSpecified[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            directoryNotSpecified = _step2.value;
            console.log("Warning: ".concat(directoryNotSpecified, " directory is not specified in the deployment configurations\n"));
          } // Deploy protocols if relevant


          _context.next = 47;
          break;

        case 43:
          _context.prev = 43;
          _context.t1 = _context["catch"](39);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t1;

        case 47:
          _context.prev = 47;
          _context.prev = 48;

          if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
            _iterator2["return"]();
          }

        case 50:
          _context.prev = 50;

          if (!_didIteratorError2) {
            _context.next = 53;
            break;
          }

          throw _iteratorError2;

        case 53:
          return _context.finish(50);

        case 54:
          return _context.finish(47);

        case 55:
          directories = _toConsumableArray(deployProtocol.keys());
          _iteratorNormalCompletion3 = true;
          _didIteratorError3 = false;
          _iteratorError3 = undefined;
          _context.prev = 59;
          _iterator3 = directories[Symbol.iterator]();

        case 61:
          if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
            _context.next = 86;
            break;
          }

          directory = _step3.value;
          protocols = Array.from(deployProtocol.get(directory));
          _iteratorNormalCompletion4 = true;
          _didIteratorError4 = false;
          _iteratorError4 = undefined;
          _context.prev = 67;

          for (_iterator4 = protocols[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            protocol = _step4.value;
            path = "".concat(ABSOLUTE_PATH, "/subgraphs/").concat(directory);

            if (doNotPrintProtocols.has(protocol)) {
              scripts.push("npm --prefix ".concat(path, " run -s build --ID=").concat(protocol, " --SPAN=protocol --DEPLOY=false --PRINTLOGS=false"));
            } else {
              scripts.push("npm --prefix ".concat(path, " run -s build --ID=").concat(protocol, " --SPAN=protocol --DEPLOY=false --PRINTLOGS=true"));
            }
          }

          _context.next = 75;
          break;

        case 71:
          _context.prev = 71;
          _context.t2 = _context["catch"](67);
          _didIteratorError4 = true;
          _iteratorError4 = _context.t2;

        case 75:
          _context.prev = 75;
          _context.prev = 76;

          if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
            _iterator4["return"]();
          }

        case 78:
          _context.prev = 78;

          if (!_didIteratorError4) {
            _context.next = 81;
            break;
          }

          throw _iteratorError4;

        case 81:
          return _context.finish(78);

        case 82:
          return _context.finish(75);

        case 83:
          _iteratorNormalCompletion3 = true;
          _context.next = 61;
          break;

        case 86:
          _context.next = 92;
          break;

        case 88:
          _context.prev = 88;
          _context.t3 = _context["catch"](59);
          _didIteratorError3 = true;
          _iteratorError3 = _context.t3;

        case 92:
          _context.prev = 92;
          _context.prev = 93;

          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }

        case 95:
          _context.prev = 95;

          if (!_didIteratorError3) {
            _context.next = 98;
            break;
          }

          throw _iteratorError3;

        case 98:
          return _context.finish(95);

        case 99:
          return _context.finish(92);

        case 100:
          console.log("Running scripts: ");
          console.log(scripts);
          runCommands(scripts, dependenciesLength, function () {});

        case 103:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[6, 10, 14, 22], [15,, 17, 21], [39, 43, 47, 55], [48,, 50, 54], [59, 88, 92, 100], [67, 71, 75, 83], [76,, 78, 82], [93,, 95, 99]]);
}

deploySubgraphs(CHANGED_FILES, ABSOLUTE_PATH, DEPLOYMENT_CONFIGURATIONS, doNotPrintProtocols);