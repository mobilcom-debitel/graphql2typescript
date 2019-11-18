# GraphQL 2 TypeScript

Opinionated toolset for GraphQL + TypeScript development,
including code generation. Made for *GraphQL first* scenarios.

Converts GraphQL SDL to TypeScript interfaces for types and resolvers
for usage in server-side resolving.
Supports mapping GraphQL types to custom internal types
for advanced, type-safe resolving.

## Usage

See `example` for a working, minimal app.
The code has additional comments and is (hopefully) self-explanatory.

Here's a quick walkthrough:

- Install with `npm install graphql2typescript -D`.
- Design a GraphQL schema using the GraphQL SDL (see `example/schema`).
- Create a `gql2ts.ts` script (see `example/gql2ts.ts`).
  - Use code completion to explore the possible options.
- Add a `gql2ts` script to your `package.json` (see `example/package.json`).
  - The example uses `ts-node` to run the script, and
  - prettifies it using `prettier`.
  - Customize to fit your needs.
- Use `npm run gql2ts` to generate TypeScript interfaces for types and resolvers (see `example/src/generated/schema.ts`).
- Implement resolvers using the generated interfaces (see `example/src/resolvers.ts`).
- Hook resolvers into your GraphQL app (works well with `express-graphql` and `apollo-server-express`).
- Use `npm run gql2ts` on schema changes to regenerate the interfaces.
- Update and restart your app accordingly.

## Questions & Answers

*Why another code generation tool?*

Existing solutions are obtrusive in some ways (e.g. missing features)
and over-engineered in others.
Especially the mapping of GraphQL types to customized internal types
is implemented poorly in other solutions.

*Why is there no CLI?*

By providing a TypeScript-only library and having users write
their own script(s), we support a myriad of use cases,
avoid any dependencies besides `graphql`,
eliminate the need for a custom configuration format,
and get type completion and type safety for free.

`example/gql2ts.ts` almost looks like configuration, can be wrapped
into a CLI with `ts-node` and `prettier`,
and can be developed in a type-safe way
(as opposed to a JSON/YAML configuration file).

*What interfaces are generated?*

- Type interfaces for the defined GraphQL types, including enums and scalars
- Interfaces for field arguments
- Resolver interfaces with type-safe `field(data, args, context, info)` definitions

*When should I add a type mapping from a GraphQL type to an internal type?*

Usually, your internal data (e.g. from a database or an external endpoint)
will not exactly match the types defined in your schema. In the example app,
a `Customer` references `Contracts` internally through IDs, whereas
the schema naturally allows retrieving the full `Contract` objects
from the `Customer`.

By creating an internal interface `CustomerInternal`
which knows about the `contractIds`, and adding
the mapping to your `gql2ts` script, you will *receive* and *return*
`CustomerInternal` objects instead of `Customer` objects in your resolvers.

For example, the `QueryResolver` can now safely *return* customer data as
`CustomerInternal` objects.
In turn, the `CustomerResolver` is then able to resolve the `contracts` field
by using the internal customer data in a type-safe way,
because it *receives* `CustomerInternal` objects in the `data`-argument
of it's resolver functions.

Note how almost none of the types in `example/src/resolvers.ts`
have to be made explicit, which makes the code very readable and
greatly reduces the chance of programmer errors.

*When should I use `tsInputType` in a type mapping?*

For some scalars, it is often useful to be able to return multiple types
in resolvers. A `DateTime`-scalar may be returned as a JavaScript
`Date`-object or as a ISO-string because the serializer accepts both,
so it is useful to map the GraphQL `DateTime` to `string | Date`
internally using `tsType`.

When a scalar is used as an input, you'll likely know the specific
type being returned by the deserializer. For example, if you know
the deserializer for `DateTime` always returns a `Date`-object,
you should add `tsInputType: "Date"` to your mapping.

## Known Issues

- Type extension via `extend type X { ... }` is not supported. PRs welcome!

## Contributors

- [Morris Brodersen](https://morrisbrodersen.de)