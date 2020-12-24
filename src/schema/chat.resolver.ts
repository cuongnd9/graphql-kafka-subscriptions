import { Kafka } from 'kafkajs';
import { KafkaPubSub } from 'graphql-kafka-subscriptions';

const kafka = new Kafka({
  clientId: 'the4pet',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 100,
  },
});

const admin = kafka.admin();
// eslint-disable-next-line promise/catch-or-return
admin
  .connect()
  .then(() => admin.createTopics({
    topics: [{ topic: 'the4pet' }],
    waitForLeaders: true,
  }));

const pubsub = new KafkaPubSub({
  topic: 'the4pet',
  host: 'localhost',
  port: '9092',
  globalConfig: {}, // options passed directly to the consumer and producer
});

const CHAT_CHANNEL = 'ABC_XYZ';
let chats = [
  {
    id: '1', from: '103cuong', content: 'hi', createdAt: '',
  },
];

const resolver = {
  Query: {
    chats: () => chats,
  },

  Mutation: {
    createChat: (_: any, { content, from }: any) => {
      const id = `_${
        Math.random()
          .toString(36)
          .substr(2, 9)}`;
      const chat = {
        id,
        from,
        content,
        createdAt: new Date().toISOString(),
      };

      chats = [chat, ...chats];
      chats = chats.splice(0, 8);
      pubsub.publish(CHAT_CHANNEL, { messageSent: chat });

      return chat;
    },
  },

  Subscription: {
    messageSent: {
      subscribe: () => pubsub.asyncIterator(CHAT_CHANNEL),
    },
  },
};

export default resolver;
