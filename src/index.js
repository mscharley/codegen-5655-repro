import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { GraphQLSchema, GraphQLString, GraphQLObjectType, graphql } from "graphql";

const port = parseInt(process.env.PORT ?? "8080", 10);
const apiKey = process.env.TEST_API_KEY ?? "Hello world";
console.log("API Key:", apiKey);

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      helloWorld: {
        type: GraphQLString,
        resolve() {
          return 'Hello!';
        },
      },
    },
  }),
});

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (req.headers['api-key'] == null) {
    next(new Error("Invalid request"));
  }
  if (req.headers['api-key'] !== apiKey) {
    next(new Error("Wrong API key"));
  }
  next();
});
app.use("/graphql", (req, res, next) => {
  console.log("Got a new request:", req.body);
  graphql(schema, req.body.query).then((result) => {
    console.log("Result:", result);
    res.send(result);
  });
});
app.use((err, req, res, next) => {
  if (err) {
    res.status(400);
    res.send(err.message);
    next();
  }
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/graphql`);
});
