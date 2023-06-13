import { copyFileSync, existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import * as stdVer from 'standard-version';

function createManifest(outDir: string, namespace: string) {
  const projectInfo = JSON.parse(readFileSync(join('package.json')).toString('utf-8'));
  const assemblyManifest = JSON.stringify({
    name: `${namespace}/${projectInfo.name}`,
    author: projectInfo.author,
    license: projectInfo.license,
    version: '0.0.0',
  }, null, 2);
  writeFileSync(join(outDir, 'package.json'), assemblyManifest, { encoding: 'utf-8' });

  const rcFile = join(outDir, '.npmrc');
  if (existsSync(rcFile)) {
    rmSync(rcFile, { force: true });
  }
  copyFileSync('.npmrc', rcFile);
}

function bumpVersion() {
  void stdVer({
    packageFiles: [],
    bumpFiles: [],
    skip: {
      commit: true,
      changelog: true,
    },
    firstRelease: false,
    gitTagFallback: true,
    tagPrefix: '',
  }).then(console.log).catch(console.error);
}

switch (process.argv[2]) {
  case 'create-manifest':
    createManifest(process.argv[3], process.argv[4]);
    break;
  case 'bump':
    bumpVersion();
    break;
  default:
    console.log('Cannot find command: ' + process.argv[2]);
    break;
}
