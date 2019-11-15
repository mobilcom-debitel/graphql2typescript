import express from 'express';
import graphqlHTTP from 'express-graphql';
import { makeExecutableSchema, IResolvers } from 'graphql-tools';
import { resolvers } from './src/resolvers';
import { importSchema } from 'graphql-import';
import { MyContext } from './src/context';

const schema = makeExecutableSchema({
  typeDefs: importSchema(`${__dirname}/schema/index.graphql`),
  resolvers: resolvers as IResolvers,
  inheritResolversFromInterfaces: true
});

const app = express();

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    context: new MyContext(),
    graphiql: true
  })
);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`Up and running at http://localhost:${port}/graphql`);
});
