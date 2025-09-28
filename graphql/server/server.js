import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `#graphql
  type Query {}

  type Mutation {}

  type User {
    id: ID
    name: String
    age: Int 
    isMarried: Boolean
  }
`;

// age can be Int or Float

const server = new ApolloServer({ typeDefs });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Server Running at: ${url}`);

///// Query, Mutation
//// typeDefs represent our types or schemas not how we deal with data
