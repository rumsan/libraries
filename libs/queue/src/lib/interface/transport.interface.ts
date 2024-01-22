// transport.interface.ts

export interface TransportInterface {
  connect(): Promise<void>;
  sendMessage(queue: string, data: any): Promise<void>;
  receiveMessage(queue: string, callback: (data: any) => void): Promise<void>;
  disconnect(): Promise<void>;
}
