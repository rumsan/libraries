export interface Broker {
  publish(queueName: string, message: string): Promise<void>;
  consume(
    queueName: string,
    callback: (message: string) => void,
  ): Promise<void>;

  add(queueName: string, message: string): Promise<void>;
}
