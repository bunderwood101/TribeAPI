import path from 'path'
import express from 'express'
import cookie from 'cookie'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import { addSchemaLevelResolveFunction } from 'graphql-tools'
import { Engine } from 'apollo-engine'
import compression from 'compression'
import bodyParser from 'body-parser'
import { invert, isString } from 'lodash'
import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import schema from './graphql/schema'
import query from './graphql/queries/queries'
import config from './config'
import db  from './db'


export function run({
                    PORT = process.env.port || 3010,
                    } = {}) {

  addSchemaLevelResolveFunction(schema, (root, args, context, info) => {
    // hope to be able to place authentication in here by accessing context
    // console.log('context: ',context)

})

  var app = express();
  app.use(compression());
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/graphql', bodyParser.json(), graphqlExpress({
    schema,
    // pass authentication tokens into context
    context: {'hash': 'eifjpiwjpifjepikpnpmstart'},
    tracing: true,
    cacheControl: true
  }));

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
     subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
  }));

  const engine = new Engine({
    //query caching to be looked at later
    engineConfig: './api/engineconfig.json',
    graphqlPort:  PORT,
    endpoint: '/graphql',
    dumpTraffic: true
  });

  engine.start();
  console.log(engine);
  app.use(engine.expressMiddleware());
  const server = createServer(app);
  server.listen(PORT, () => {
    // add subscription server
    new SubscriptionServer(
        {
        execute,
        subscribe,
        schema
        },
        {
          server: server,
          path : '/subscriptions'
        })
    console.log(`API Server is now running on http://localhost:${PORT}`); // eslint-disable-line no-console
    console.log(`API Subscriptions server is now running on ws://localhost:${PORT}/subscriptions`)
  });


  return app;
}
