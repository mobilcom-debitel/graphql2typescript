import {
  IQueryResolver,
  IContractResolver,
  ICustomerResolver,
  IIndividualResolver,
  ICompanyResolver,
  ISearchResultResolver,
  IMutationResolver,
  CustomerType
} from './generated/schema';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';

// split this into multiple files in your app

const QueryResolver: IQueryResolver = {
  hello() {
    return 'World';
  },

  time() {
    // note we could also return a string here
    return new Date(12345678910);
  },

  customers(_, __, context) {
    return context.getCustomers();
  },

  customer(_, args, context) {
    return context.getCustomerById(args.id);
  },

  search(_, args, context) {
    return context.search(args);
  }
};

const MutationResolver: IMutationResolver = {
  register(_, args) {
    return { ok: args.input.username.length > 0 && args.input.password.length > 0 };
  }
};

const CustomerResolver: ICustomerResolver = {
  // the interfaces provide __resolveType definitions where appropriate
  __resolveType(data) {
    switch (data.type) {
      case 1:
        return 'Individual';
      case 2:
        return 'Company';
    }
  },

  // note the usage of the imported enum here
  type(data) {
    switch (data.type) {
      case 1:
        return CustomerType.INDIVIDUAL;
      case 2:
        return CustomerType.COMPANY;
    }
  },

  // note how data is of type CustomerInternal,
  // which has an internal contractIds property
  contracts(data, _, context) {
    return data.contractIds.map(id => context.getContractById(id));
  }
};

const IndividualResolver: IIndividualResolver = {
  name(data) {
    return `${data.person.givenName} ${data.person.familyName}`;
  }
};

const CompanyResolver: ICompanyResolver = {
  name(data) {
    return `${data.companyName} ${data.companyForm}`;
  },

  form(data) {
    return data.companyForm;
  }
};

const ContractResolver: IContractResolver = {
  customer(data, _, context) {
    return context.getCustomerByContractId(data.id);
  }
};

const SearchResultResolver: ISearchResultResolver = {
  __resolveType(data) {
    switch (data.type) {
      case 1:
        return 'Individual';
      case 2:
        return 'Company';
      case 3:
        return 'Contract';
      case 4:
        return 'Person';
    }
  }
};

// the resolver map to be hooked into the app
export const resolvers = {
  Query: QueryResolver,
  Mutation: MutationResolver,
  Customer: CustomerResolver,
  Individual: IndividualResolver,
  Company: CompanyResolver,
  Contract: ContractResolver,
  SearchResult: SearchResultResolver,
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime
};
