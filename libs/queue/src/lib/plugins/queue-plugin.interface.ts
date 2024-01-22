export interface QueuePlugin<T> {
  beforeEnqueue(item: T): T;
  afterDequeue(item: T): void;
}
