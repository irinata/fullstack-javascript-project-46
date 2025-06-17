import { fileURLToPath } from 'url';
import path from 'path';
import { readFileSync } from 'node:fs';
import { genDiff } from '../src/filesDiff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = filename => path.join(__dirname, '..', '__fixtures__', filename);
const readFixtureFile = filename => readFileSync(getFixturePath(filename), 'utf-8');
const resultFile = 'expected.txt';

test('generate JSON diff', () => {
  const data1 = {
    host: 'hexlet.io',
    timeout: 50,
    ip: '192.168.0.2',
    proxy: '123.234.53.22',
    name: 'text1',
    follow: false,
  };
  const data2 = {
    timeout: 20,
    ip: '192.168.0.2',
    verbose: true,
    host: 'hexlet.io',
    name: 'text2',
    data: 'data2',
  };
  const expected = readFixtureFile(resultFile);
  const actual = genDiff(data1, data2);
  expect(actual).toEqual(expected);
});
