import { fileURLToPath } from 'url'
import path from 'path'
import { readFileSync } from 'node:fs'
import { gendiff } from '../src/parsers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getFixturePath = filename => path.join(__dirname, '..', '__fixtures__', filename)
const readFixtureFile = filename => readFileSync(getFixturePath(filename), 'utf-8')
const resultFile = 'expected.txt'

describe('check default stylish format', () => {
  test.each([
    ['file1.json', 'file2.json'],
    ['file1.yml', 'file2.yaml'],
    ['file1.json', 'file2.yaml'],
  ])('should generate diff for %s and %s', (file1, file2) => {
    const expected = readFixtureFile(resultFile).trim()
    const filepath1 = getFixturePath(file1)
    const filepath2 = getFixturePath(file2)
    const actual = gendiff(filepath1, filepath2)
    expect(actual).toEqual(expected)
  })
})
