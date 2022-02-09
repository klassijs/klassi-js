import fs from 'fs-extra';

export default function (configFilePath) {
  const json = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

  // TODO: add validation if schema
  return json;
}
