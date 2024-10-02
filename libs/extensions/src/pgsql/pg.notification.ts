import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Client, QueryResult } from 'pg';
import { PgClient } from './pg.client';

@Injectable()
export class PgNotificationService implements OnModuleDestroy {
  private logger = new Logger(PgNotificationService.name);
  private subscribedChannels: Set<string> = new Set();
  private notificationEmitter = new EventEmitter2();

  constructor(private readonly pgClientService: PgClient) {}

  // Initialize the service and start listening to notifications
  async initialize() {
    try {
      const client = this.pgClientService.getClient(); // Get the connected client from PgClientService
      this.registerNotificationHandlers(client);
      this.logger.log('PostgreSQL Notification Service initialized');
    } catch (error) {
      this.logger.error(
        'Failed to initialize PostgreSQL Notification Service:',
        error,
      );
      throw error;
    }
  }

  // Register handlers for receiving notifications
  private registerNotificationHandlers(client: Client) {
    client.on('notification', (msg) => {
      this.logger.debug(
        `Received notification on channel ${msg.channel}: ${msg.payload}`,
      );
      this.notificationEmitter.emit(
        msg.channel,
        msg.payload ? JSON.parse(msg.payload) : undefined,
      );
    });

    client.on('error', (error) => {
      this.logger.error('Error in notification handling:', error);
    });

    client.on('end', () => {
      this.logger.warn('Notification listener connection ended.');
    });
  }

  // Subscribe to a PostgreSQL notification channel
  async listenTo(channel: string): Promise<void> {
    if (this.subscribedChannels.has(channel)) {
      this.logger.debug(`Already subscribed to channel: ${channel}`);
      return;
    }

    try {
      await this.pgClientService.query(`LISTEN ${channel}`);
      this.logger.log(`Subscribed to PostgreSQL channel: ${channel}`);
      this.subscribedChannels.add(channel);
    } catch (error) {
      this.logger.error(`Failed to subscribe to channel ${channel}:`, error);
      throw error;
    }
  }

  // Unsubscribe from a specific channel
  async unlisten(channel: string): Promise<void> {
    if (!this.subscribedChannels.has(channel)) {
      this.logger.debug(`Not subscribed to channel: ${channel}`);
      return;
    }

    try {
      await this.pgClientService.query(`UNLISTEN ${channel}`);
      this.logger.log(`Unsubscribed from PostgreSQL channel: ${channel}`);
      this.subscribedChannels.delete(channel);
    } catch (error) {
      this.logger.error(
        `Failed to unsubscribe from channel ${channel}:`,
        error,
      );
      throw error;
    }
  }

  // Unsubscribe from all channels
  async unlistenAll(): Promise<void> {
    try {
      await this.pgClientService.query('UNLISTEN *');
      this.logger.log('Unsubscribed from all PostgreSQL channels');
      this.subscribedChannels.clear();
    } catch (error) {
      this.logger.error('Failed to unsubscribe from all channels:', error);
      throw error;
    }
  }

  // Handle module destruction
  onModuleDestroy() {
    this.logger.log('Closing PostgreSQL Notification Service');
    this.unlistenAll();
  }

  // Add listeners for specific channels
  on(channel: string, listener: (payload: any) => void) {
    this.notificationEmitter.on(channel, listener);
  }

  // Send a notification with optional payload
  async notify<T>(channel: string, payload?: T): Promise<QueryResult> {
    const serializedPayload = payload ? JSON.stringify(payload) : undefined;

    const query = payload
      ? `NOTIFY ${channel}, '${serializedPayload}'`
      : `NOTIFY ${channel}`;

    try {
      this.logger.debug(
        `Notifying on channel ${channel} with payload: ${serializedPayload}`,
      );
      return this.pgClientService.query(query);
    } catch (error) {
      this.logger.error(
        `Failed to send notification on channel ${channel}:`,
        error,
      );
      throw error;
    }
  }
}
