import { Kafka } from 'kafkajs';
import { KafkaPubSub } from 'graphql-kafka-subscriptions';

const kafka = new Kafka({
  clientId: 'the4pet',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

producer.connect();
producer.send({
  topic: 'the4pet',
  messages: [],
});

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
