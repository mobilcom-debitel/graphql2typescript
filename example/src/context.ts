import { CustomerInternal, ContractInternal } from './types';
import { QuerySearchArgs, SearchResult } from './generated/schema';
import { required, flatMap } from './util';

export class MyContext {
  protected customers: CustomerInternal[] = [
    {
      id: '7',
      type: 1,
      person: {
        type: 4,
        givenName: 'Max',
        familyName: 'Mustermann',
        dateOfBirth: '1992-08-23'
      },
      contractIds: ['a', 'b']
    },
    {
      id: '8',
      type: 2,
      companyName: 'md',
      companyForm: 'GmbH',
      employees: [
        {
          type: 4,
          givenName: 'Max',
          familyName: 'Mustermann',
          dateOfBirth: '1992-08-23'
        },
        {
          type: 4,
          givenName: 'Maria',
          familyName: 'Mustermann',
          dateOfBirth: '1993-07-11'
        }
      ],
      contractIds: ['c', 'd', 'e']
    }
  ];

  protected contracts: ContractInternal[] = [
    { id: 'a', type: 3, name: 'iPhone X', created: '2019-11-15T15:27:00Z' },
    { id: 'b', type: 3, name: 'LTE 20GB', created: '2019-11-15T15:27:00Z' },
    {
      id: 'c',
      type: 3,
      name: 'Muster-Samsung S99',
      created: '2019-11-15T15:27:00Z'
    },
    { id: 'd', type: 3, name: 'LTE 20GB', created: '2019-11-15T15:27:00Z' },
    { id: 'e', type: 3, name: 'Upgrade +20GB', created: 1337 }
  ];

  public getCustomers() {
    return this.customers;
  }

  public getCustomerById(id: string) {
    return required(
      this.customers.find(it => it.id === id),
      'Not found'
    );
  }

  public getCustomerByContractId(contractId: string) {
    return required(
      this.customers.find(it => it.contractIds.includes(contractId)),
      'Not found'
    );
  }

  public getContracts() {
    return this.contracts;
  }

  public getContractById(id: string) {
    return required(
      this.contracts.find(it => it.id === id),
      'Not found'
    );
  }

  public search(args: QuerySearchArgs): SearchResult[] {
    return (this.customers as SearchResult[])
      .concat(this.contracts)
      .concat(
        flatMap(this.customers, it =>
          it.type === 1 ? [it.person] : it.employees
        )
      )
      .filter(it => {
        switch (it.type) {
          case 1:
            return (
              it.person.givenName.match(args.q) ||
              it.person.familyName.match(args.q)
            );
          case 2:
            return it.companyName.match(args.q) || it.companyForm.match(args.q);
          case 3:
            return it.name.match(args.q);
          case 4:
            return it.givenName.match(args.q) || it.familyName.match(args.q);
        }
      });
  }
}
