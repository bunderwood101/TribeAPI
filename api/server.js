import path from 'path';
import express from 'express';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { Engine } from 'apollo-engine';
import compression from 'compression';
import bodyParser from 'body-parser';
import { invert, isString } from 'lodash';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { postSchema } from './models/blog-post';
import schema from './graphql/schema';
import query from './graphql/queries/queries';
import config from './config'

export function run({
                    PORT: portFromEnv = 3010,
                    } = {}) {


  let port = portFromEnv;
  if (isString(portFromEnv)) {
    port = parseInt(portFromEnv, 10);
  }

  var app = express();
  app.use(compression());
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/graphql', bodyParser.json(), graphqlExpress({
    schema,
    context: {},
    tracing: true,
    cacheControl: true
  }));

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    query: `
       {post(_id:"59e9d02366adf5394033c520"){
        title,
        content
      }
      }
      {
      mutation {
        createPost(post: {
          title: "andy",
          content: "hope is a good thing",
        }) {
          _id
        }
      }
      }
        `,
  }));

  const engine = new Engine({
    //query caching to be looked at later
    engineConfig: './api/engineconfig.json',
    graphqlPort:  port,
    endpoint: '/graphql',
    dumpTraffic: true
  });

  engine.start();
  console.log(engine);
  app.use(engine.expressMiddleware());
  const server = createServer(app);
  server.listen(port, () => {
    console.log(`API Server is now running on http://localhost:${port}`); // eslint-disable-line no-console
  });

  return app;
}
