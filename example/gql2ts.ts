import { importSchema } from 'graphql-import';
import { printServerTypes } from '../src/index'; // from 'graphql2typescript' in your app

printServerTypes({
  // we use graphql-import here, but this is optional
  src: importSchema(`${__dirname}/schema/index.graphql`),
  headers: ['// tslint:disable'],
  context: {
    name: 'MyContext',
    from: '../context'
  },
  typeMap: [
    // scalars
    {
      // Replace a GraphQL Date internally with...
      gqlType: 'Date',
      // ... "string | number | Date" in the source code...
      tsType: 'string | number | Date',
      // ... and "string" if used as an input
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

    // object types
    {
      // Replace a GraphQL Customer internally with...
      gqlType: 'Customer',
      // ... "CustomerInternal" in the source code...
      tsType: 'CustomerInternal',
      // ... importing it from "../types"
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
      // complex types are also possible
      tsType: 'Person & { type: 4 }'
    }
  ]
});
