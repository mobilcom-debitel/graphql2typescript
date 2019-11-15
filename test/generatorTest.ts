import { generateServerTypes } from '../src';
import { importSchema } from 'graphql-import';
import { format } from 'prettier';
import { readFileSync } from 'fs';
import * as assert from 'assert';

describe('The generator', () => {
  it('should generate TypeScript interfaces from a GraphQL Schema', () => {
    const actual = generateServerTypes({
      src: importSchema(`example/schema/index.graphql`),
      headers: ['// tslint:disable'],
      context: {
        name: 'MyContext',
        from: '../context'
      },
      typeMap: [
        {
          gqlType: 'Date',
          tsType: 'string | number | Date',
          tsInputType: 'string'
        },
        {
          gqlType: 'Time',
          tsType: 'string | number | Date',
          tsInputType: 'string'
        },
        {
          gqlType: 'DateTime',
          tsType: 'string | number | Date',
          tsInputType: 'Date'
        },
        {
          gqlType: 'Customer',
          tsType: 'CustomerInternal',
          from: '../types'
        },
        {
          gqlType: 'Individual',
          tsType: 'IndividualInternal',
          from: '../types'
        },
        {
          gqlType: 'Company',
          tsType: 'CompanyInternal',
          from: '../types'
        },
        {
          gqlType: 'Contract',
          tsType: 'ContractInternal',
          from: '../types'
        },
        {
          gqlType: 'Person',
          tsType: 'Person & { type: 4 }'
        }
      ]
    });

    const expected = readFileSync('example/src/generated/schema.ts', 'utf-8');

    assert.equal(
      format(actual, { parser: 'typescript' }),
      format(expected, { parser: 'typescript' })
    );
  });
});
