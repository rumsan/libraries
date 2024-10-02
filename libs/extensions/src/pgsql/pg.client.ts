import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Client, ClientConfig, QueryResult } from 'pg';

@Injectable()
export class PgClient implements OnModuleDestroy {
  private logger = new Logger(PgClient.name);
  private dbClient: Client;
  private paranoidCheckInterval = 30000; // 30 seconds for paranoid checking
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5; // Maximum attempts before giving up
  private reconnectDelay = 1000; // Delay in milliseconds between reconnect attempts
  private interval: NodeJS.Timeout | null = null;

  constructor(private readonly connectionConfig: ClientConfig) {}

  // Establish the connection
  async connect() {
    this.logger.log('Creating PostgreSQL client');
    this.dbClient = new Client({
      ...this.connectionConfig,
      keepAlive: true,
    });

    await this.initializeClient();
  }

  // Initialize the PostgreSQL client connection
  private async initializeClient() {
    try {
      await this.dbClient.connect();
      this.logger.log('PostgreSQL connection established');
      this.registerEventHandlers();
      this.scheduleParanoidChecking();
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL:', error);
      await this.reconnect();
    }
  }

  // Register event handlers for connection errors and end
  private registerEventHandlers() {
    this.dbClient.on('error', async (error) => {
      this.logger.error('PostgreSQL client error occurred:', error);
      await this.reconnect();
    });

    this.dbClient.on('end', async () => {
      this.logger.warn('PostgreSQL connection ended');
      await this.reconnect();
    });
  }

  // Perform paranoid checking periodically
  private scheduleParanoidChecking() {
    if (this.paranoidCheckInterval && !this.interval) {
      this.interval = setInterval(async () => {
        try {
          await this.dbClient.query('SELECT 1'); // Lightweight query to check connection
          this.logger.debug('Paranoid connection check passed');
        } catch (error) {
          this.logger.error('Paranoid connection check failed:', error);
          await this.reconnect();
        }
      }, this.paranoidCheckInterval);
    }
  }

  // Handle reconnection attempts
  private async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Max reconnect attempts (${this.maxReconnectAttempts}) reached.`,
      );
      return;
      //throw new Error('Failed to reconnect to PostgreSQL.');
    }

    this.reconnectAttempts += 1;
    this.logger.warn(
      `Attempting to reconnect to PostgreSQL (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
    );

    await this.delay(this.reconnectDelay);

    try {
      await this.dbClient.end(); // Properly end the previous connection
    } catch (endError) {
      this.logger.warn('Error while ending previous connection:', endError);
    }

    try {
      this.dbClient = new Client({
        ...this.connectionConfig,
        keepAlive: true,
      });

      await this.dbClient.connect();
      this.logger.log('Reconnection to PostgreSQL successful');
      this.reconnectAttempts = 0; // Reset on successful connection
      this.registerEventHandlers();
      this.scheduleParanoidChecking();
    } catch (error) {
      this.logger.error('Reconnection attempt failed:', error);
      await this.reconnect(); // Recursive retry logic
    }
  }

  // Close the connection and clear intervals
  async close() {
    this.logger.log('Closing PostgreSQL connection');
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    await this.dbClient.end();
  }

  // Delay helper function for reconnection attempts
  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onModuleDestroy() {
    this.close();
  }

  // Get the PostgreSQL client instance
  public getClient(): Client {
    return this.dbClient;
  }

  // Perform a query
  async query(queryText: string, values?: any[]): Promise<QueryResult> {
    return this.dbClient.query(queryText, values);
  }
}
