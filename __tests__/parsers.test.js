import { fileURLToPath } from 'url'
import path from 'path'
import { readFileSync } from 'node:fs'
import genDiff from '../src/parse.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getFixturePath = filename => path.join(__dirname, '..', '__fixtures__', filename)
const readFixtureFile = filename => readFileSync(getFixturePath(filename), 'utf-8')
const stylishResult = 'stylish.txt'
const plainResult = 'plain.txt'
const jsonResult = 'json.txt'

describe('check default stylish output format', () => {
  test.each([
    ['file1.json', 'file2.json'],
    ['file1.yml', 'file2.yaml'],
    ['file1.json', 'file2.yaml'],
  ])('should generate diff for %s and %s', (file1, file2) => {
    const expected = readFixtureFile(stylishResult).trim()
    const filepath1 = getFixturePath(file1)
    const filepath2 = getFixturePath(file2)
    const actual = genDiff(filepath1, filepath2)
    expect(actual).toEqual(expected)
  })
})

describe('check plain output format', () => {
  test.each([
    ['file1.json', 'file2.json'],
    ['file1.yml', 'file2.yaml'],
    ['file1.yml', 'file2.json'],
  ])('should generate diff for %s and %s', (file1, file2) => {
    const expected = readFixtureFile(plainResult).trim()
    const filepath1 = getFixturePath(file1)
    const filepath2 = getFixturePath(file2)
    const actual = genDiff(filepath1, filepath2, 'plain')
    expect(actual).toEqual(expected)
  })
})

describe('check json output format', () => {
  test.each([
    ['file1.json', 'file2.json'],
    ['file1.yml', 'file2.yaml'],
    ['file1.json', 'file2.yaml'],
  ])('should generate diff for %s and %s', (file1, file2) => {
    const expected = readFixtureFile(jsonResult).trim()
    const filepath1 = getFixturePath(file1)
    const filepath2 = getFixturePath(file2)
    const actual = genDiff(filepath1, filepath2, 'json')
    expect(actual).toEqual(expected)
  })
})
