const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Git worktrees can be nested below the checkout that owns node_modules. Metro
// does not include that ancestor in its resolver automatically.
function findDependencyNodeModules(startDirectory) {
  let directory = path.resolve(startDirectory);

  while (true) {
    const nodeModules = path.join(directory, 'node_modules');
    if (fs.existsSync(path.join(nodeModules, 'expo-router', 'package.json'))) {
      return nodeModules;
    }

    const parent = path.dirname(directory);
    if (parent === directory) {
      return null;
    }
    directory = parent;
  }
}

const projectNodeModules = path.join(projectRoot, 'node_modules');
const dependencyNodeModules = findDependencyNodeModules(projectRoot);

if (
  dependencyNodeModules &&
  path.resolve(dependencyNodeModules) !== path.resolve(projectNodeModules)
) {
  config.watchFolders = [
    ...new Set([...(config.watchFolders ?? []), dependencyNodeModules]),
  ];
  config.resolver = {
    ...config.resolver,
    nodeModulesPaths: [
      ...new Set([
        ...(config.resolver?.nodeModulesPaths ?? []),
        projectNodeModules,
        dependencyNodeModules,
      ]),
    ],
  };
}

module.exports = config;
