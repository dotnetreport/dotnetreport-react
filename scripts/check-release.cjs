// Used by azure-pipelines-publish.yml after "npm run build". Checks the package and decides how to publish it.
//   node scripts/check-release.cjs
// Sets the pipeline variables npmPublish (true/false) and npmTag (latest or beta).
// Exits with an error if the package is incomplete or would move "latest" to an older version.
const fs = require('fs');
const { execSync } = require('child_process');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const fail = message => { console.error('##vso[task.logissue type=error]' + message); process.exit(1); };
const setVar = (name, value) => console.log(`##vso[task.setvariable variable=${name}]${value}`);

if (pkg.name !== 'dotnetreport-react') fail(`Package name is "${pkg.name}", expected "dotnetreport-react".`);
const match = /^(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?$/.exec(pkg.version || '');
if (!match) fail(`"${pkg.version}" is not a valid version.`);

const packed = JSON.parse(execSync('npm pack --dry-run --json').toString())[0].files.map(f => f.path);
const expected = ['package.json', 'README.md', 'dist/index.js', 'dist/index.cjs', 'dist/index.d.ts'];
const missing = expected.filter(f => !packed.includes(f));
if (missing.length) fail('Missing from the package: ' + missing.join(', '));
console.log(`dotnetreport-react ${pkg.version}, ${packed.length} files:\n  ` + packed.join('\n  '));

const npmView = args => {
  try { return execSync(`npm view ${args} --json`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch (e) { return ''; }
};

if (npmView(`dotnetreport-react@${pkg.version} version`)) {
  console.log(`dotnetreport-react ${pkg.version} is already on npm. Nothing to publish.`);
  setVar('npmPublish', 'false');
  process.exit(0);
}

const prerelease = !!match[4];
if (!prerelease) {
  const latest = JSON.parse(npmView('dotnetreport-react dist-tags') || '{}').latest;
  const parts = v => v.split('-')[0].split('.').map(Number);
  const newer = (a, b) => { for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] > b[i]; } return false; };
  if (latest && !newer(parts(pkg.version), parts(latest))) {
    fail(`${pkg.version} is not newer than the current latest release ${latest}. Bump <version> in the .nuspec files.`);
  }
}

const tag = prerelease ? 'beta' : 'latest';
console.log(`Will publish dotnetreport-react ${pkg.version} with the "${tag}" tag.`);
setVar('npmPublish', 'true');
setVar('npmTag', tag);
