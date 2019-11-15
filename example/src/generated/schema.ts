// tslint:disable

import { GraphQLResolveInfo } from "graphql";
import { MyContext } from "../context";
import {
  CustomerInternal,
  IndividualInternal,
  CompanyInternal,
  ContractInternal
} from "../types";

type AsyncResult<T> = T | Promise<T>;

export interface Query {
  /**
   * (String)
   */
  hello: string;
  /**
   * (Time)
   */
  time: string | number | Date;
  /**
   * (Array<Customer>)
   */
  customers?: Array<CustomerInternal>;
  /**
   * (Customer)
   */
  customer?: CustomerInternal;

  login?: Login;

  search?: Array<SearchResult>;
}

export interface IQueryResolver {
  /**
   * (String)
   */
  hello?: (
    data: Query,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (Time)
   */
  time?: (
    data: Query,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string | number | Date>;
  /**
   * (Array<Customer>)
   */
  customers?: (
    data: Query,
    args: QueryCustomersArgs,
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<Array<CustomerInternal> | undefined>;
  /**
   * (Customer)
   */
  customer?: (
    data: Query,
    args: QueryCustomerArgs,
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<CustomerInternal | undefined>;

  login?: (
    data: Query,
    args: QueryLoginArgs,
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<Login | undefined>;

  search?: (
    data: Query,
    args: QuerySearchArgs,
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<Array<SearchResult> | undefined>;
}

export interface QueryCustomersArgs {
  /**
   * (Int)
   */
  limit?: number;
  /**
   * (Int)
   */
  offset?: number;
  /**
   * (String)
   */
  q?: string;
}

export interface QueryCustomerArgs {
  /**
   * (String)
   */
  id: string;
}

export interface QueryLoginArgs {
  /**
   * (String)
   */
  username: string;
  /**
   * (String)
   */
  password: string;
}

export interface QuerySearchArgs {
  /**
   * (String)
   */
  q: string;
}

export interface Mutation {
  register?: RegistrationResult;
}

export interface IMutationResolver {
  register?: (
    data: Mutation,
    args: MutationRegisterArgs,
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<RegistrationResult | undefined>;
}

export interface MutationRegisterArgs {
  input: RegistrationInput;
}

/**
 * A customer
 */
export interface Customer {
  /**
   * (String)
   */
  id: string;

  type: CustomerType;
  /**
   * (String)
   */
  name: string;
  /**
   * (Array<Contract>) The customer's contracts
   */
  contracts?: Array<ContractInternal>;
}

/**
 * A customer
 */
export interface ICustomerResolver {
  __resolveType?: (
    data: CustomerInternal,
    context: MyContext,
    info: GraphQLResolveInfo
  ) => string;
  /**
   * (String)
   */
  id?: (
    data: CustomerInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;

  type?: (
    data: CustomerInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<CustomerType>;
  /**
   * (String)
   */
  name?: (
    data: CustomerInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (Array<Contract>) The customer's contracts
   */
  contracts?: (
    data: CustomerInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<Array<ContractInternal> | undefined>;
}

export interface Login {
  /**
   * (String)
   */
  token: string;
}

export interface ILoginResolver {
  /**
   * (String)
   */
  token?: (
    data: Login,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
}

export type SearchResult =
  | IndividualInternal
  | CompanyInternal
  | ContractInternal
  | (Person & { type: 4 });

export interface ISearchResultResolver {
  __resolveType?: (
    data: SearchResult,
    context: MyContext,
    info: GraphQLResolveInfo
  ) => string;
}

export interface RegistrationResult {
  /**
   * (Boolean)
   */
  ok: boolean;
}

export interface IRegistrationResultResolver {
  /**
   * (Boolean)
   */
  ok?: (
    data: RegistrationResult,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<boolean>;
}

export interface RegistrationInput {
  /**
   * (String)
   */
  username: string;
  /**
   * (String)
   */
  password: string;
}

export enum CustomerType {
  INDIVIDUAL = "INDIVIDUAL",

  COMPANY = "COMPANY"
}

export interface Contract {
  /**
   * (String)
   */
  id: string;
  /**
   * (String)
   */
  name: string;
  /**
   * (Customer)
   */
  customer?: CustomerInternal;
  /**
   * (DateTime)
   */
  created: string | number | Date;
}

export interface IContractResolver {
  /**
   * (String)
   */
  id?: (
    data: ContractInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (String)
   */
  name?: (
    data: ContractInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (Customer)
   */
  customer?: (
    data: ContractInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<CustomerInternal | undefined>;
  /**
   * (DateTime)
   */
  created?: (
    data: ContractInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string | number | Date>;
}

export interface Individual {
  /**
   * (String)
   */
  id: string;

  type: CustomerType;
  /**
   * (String)
   */
  name: string;
  /**
   * (Array<Contract>)
   */
  contracts?: Array<ContractInternal>;
  /**
   * (Person)
   */
  person?: Person & { type: 4 };
}

export interface IIndividualResolver {
  /**
   * (String)
   */
  id?: (
    data: IndividualInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;

  type?: (
    data: IndividualInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<CustomerType>;
  /**
   * (String)
   */
  name?: (
    data: IndividualInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (Array<Contract>)
   */
  contracts?: (
    data: IndividualInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<Array<ContractInternal> | undefined>;
  /**
   * (Person)
   */
  person?: (
    data: IndividualInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<(Person & { type: 4 }) | undefined>;
}

export interface Company {
  /**
   * (String)
   */
  id: string;

  type: CustomerType;
  /**
   * (String)
   */
  name: string;
  /**
   * (Array<Contract>)
   */
  contracts?: Array<ContractInternal>;
  /**
   * (String)
   */
  form: string;
  /**
   * (Array<Person>)
   */
  employees?: Array<Person & { type: 4 }>;
}

export interface ICompanyResolver {
  /**
   * (String)
   */
  id?: (
    data: CompanyInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;

  type?: (
    data: CompanyInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<CustomerType>;
  /**
   * (String)
   */
  name?: (
    data: CompanyInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (Array<Contract>)
   */
  contracts?: (
    data: CompanyInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<Array<ContractInternal> | undefined>;
  /**
   * (String)
   */
  form?: (
    data: CompanyInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (Array<Person>)
   */
  employees?: (
    data: CompanyInternal,
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<Array<Person & { type: 4 }> | undefined>;
}

export interface Person {
  /**
   * (String)
   */
  givenName: string;
  /**
   * (String)
   */
  familyName: string;
  /**
   * (Date)
   */
  dateOfBirth: string | number | Date;
}

export interface IPersonResolver {
  /**
   * (String)
   */
  givenName?: (
    data: Person & { type: 4 },
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (String)
   */
  familyName?: (
    data: Person & { type: 4 },
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string>;
  /**
   * (Date)
   */
  dateOfBirth?: (
    data: Person & { type: 4 },
    args: {},
    context: MyContext,
    info: GraphQLResolveInfo
  ) => AsyncResult<string | number | Date>;
}
