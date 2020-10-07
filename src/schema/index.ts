import { makeExecutableSchema } from 'graphql-tools';
import resolver from './chat.resolver';
import typeDef from './chat.typeDef';

const schema = makeExecutableSchema({ typeDefs: [typeDef], resolvers: [resolver] });

export { schema };
