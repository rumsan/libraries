## Queue Library Documentation

The Queue library is a module that provides a way to handle message queues in your application. It uses the BullMQ library as the default transport layer for sending and receiving messages, but you can also implement your own transport layer.

Setup
First, import the QueueModule in your application module:

```ts
import { QueueModule } from 'libs/queue/src/lib/queue.module';
```

# Configuration

The QueueModule accepts a configuration object of type IQueueModuleOptions from queue-config.interfaces.ts. This configuration object includes the queue configuration and transport layer.

Here is an example of how to use the forRoot method to configure the QueueModule:

```ts
@Module({
  imports: [
    QueueModule.forRoot({
      config: {
        queueName: 'myQueue',
        // other BullMQ options...
      },
      transport: new BullMQTransport(/* transport options... */),
    }),
  ],
})
export class AppModule {}
```

In this example, myQueue is the name of the queue, and BullMQTransport is the transport layer. You can replace BullMQTransport with your own transport layer if you want.

# Queue Library

This library provides a way to handle message queues in your application. It uses the BullMQ library as the default transport layer for sending and receiving messages, but you can also implement your own transport layer.

## Queue Service

The QueueService provides methods to interact with the queue. You can inject it into your services or controllers:

Here are the methods provided by the QueueService:

- `connect()`: Connects to the queue.
- `disconnect()`: Disconnects from the queue.
- `sendMessage(queue: string, data: any)`: Sends a message to the specified queue.
- `receiveMessage(queue: string, callback: (data: any) => void)`: Receives a message from the specified queue and processes it with the provided callback function.

## Queue Plugins

You can create custom plugins to modify the behavior of the queue. A plugin must implement the QueuePlugin interface from queue-plugin.interface.ts. The DefaultQueuePluginService from default-queue-plugin.service.ts is an example of a queue plugin.

## Transports

The transport layer is responsible for the actual sending and receiving of messages. The default transport is BullMQTransport from bull.transport.ts, but you can create your own by implementing the TransportInterface from transport.interface.ts.

## Testing

To run tests for the queue library, use the test script in the project.json file:

```sh
npm run test
```
