import got from 'got';
import * as assert from 'assert';

describe('The example', () => {
  before(done => {
    process.env.PORT = '4999';
    require('../example/app');
    setTimeout(done, 2000);
  });

  it('should run', async () => {
    const r = await got('http://localhost:4999/graphql', {
      method: 'POST',
      json: true,
      body: {
        query: `{
          hello
          time
          customers {
            __typename
            id
            type
            name
            contracts {
              id
              name
              created
            }
            ... on Individual {
              person {
                givenName
                familyName
                dateOfBirth
              }
            }
            ... on Company {
              name
              form
            }
          }
          customer(id: "7") {
            id
            name
          }
          search(q: "Muster") {
            __typename
            ... on Individual {
              id
              name
            }
            ... on Company {
              id
              name
              form
            }
            ... on Person {
              givenName
              familyName
            }
            ... on Contract {
              id
              name
            }
          }
        }`
      }
    });

    assert.deepEqual(r.body, {
      data: {
        hello: 'World',
        time: '21:21:18.910Z',
        customers: [
          {
            __typename: 'Individual',
            id: '7',
            type: 'INDIVIDUAL',
            name: 'Max Mustermann',
            contracts: [
              {
                id: 'a',
                name: 'iPhone X',
                created: '2019-11-15T15:27:00Z'
              },
              {
                id: 'b',
                name: 'LTE 20GB',
                created: '2019-11-15T15:27:00Z'
              }
            ],
            person: {
              givenName: 'Max',
              familyName: 'Mustermann',
              dateOfBirth: '1992-08-23'
            }
          },
          {
            __typename: 'Company',
            id: '8',
            type: 'COMPANY',
            name: 'md GmbH',
            contracts: [
              {
                id: 'c',
                name: 'Muster-Samsung S99',
                created: '2019-11-15T15:27:00Z'
              },
              {
                id: 'd',
                name: 'LTE 20GB',
                created: '2019-11-15T15:27:00Z'
              },
              {
                id: 'e',
                name: 'Upgrade +20GB',
                created: '1970-01-01T00:22:17.000Z'
              }
            ],
            form: 'GmbH'
          }
        ],
        customer: {
          id: '7',
          name: 'Max Mustermann'
        },
        search: [
          {
            __typename: 'Individual',
            id: '7',
            name: 'Max Mustermann'
          },
          {
            __typename: 'Contract',
            id: 'c',
            name: 'Muster-Samsung S99'
          },
          {
            __typename: 'Person',
            givenName: 'Max',
            familyName: 'Mustermann'
          },
          {
            __typename: 'Person',
            givenName: 'Max',
            familyName: 'Mustermann'
          },
          {
            __typename: 'Person',
            givenName: 'Maria',
            familyName: 'Mustermann'
          }
        ]
      }
    });
  });
});
