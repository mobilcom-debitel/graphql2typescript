import { Person, Contract } from './generated/schema';

export type CustomerInternal = IndividualInternal | CompanyInternal;

export interface IndividualInternal {
  id: string;
  type: 1;
  contractIds: string[];

  person: Person & { type: 4 };
}

export interface CompanyInternal {
  id: string;
  type: 2;
  contractIds: string[];

  companyName: string;
  companyForm: string;
  employees: Array<Person & { type: 4 }>;
}

export type ContractInternal = Contract & { type: 3 };
