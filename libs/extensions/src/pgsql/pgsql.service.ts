// src/postgresql/postgresql.service.ts
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from 'pg';
import createSubscriber from 'pg-listen';
import { PgConfig } from './pgsql.module';

@Injectable()
export class PgSqlService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private subscriber: any;

  constructor(@Inject('PG_CONFIG') private readonly config: PgConfig) {
    this.subscriber = createSubscriber({
      user: this.config.user,
      host: this.config.host,
      database: this.config.database,
      password: this.config.password,
      port: this.config.port || 5432,
    });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.subscriber.close();
  }

  private async connect() {
    await this.subscriber.connect();
    console.log('Connected to PostgreSQL and listening for changes...');
  }

  async listen<T>(channel: string, callback: (payload: T) => void) {
    this.subscriber.notifications.on(channel, callback);
    await this.subscriber.listenTo(channel);
  }

  async unlisten(channel: string) {
    this.subscriber.notifications.removeAllListeners(channel);
    await this.subscriber.unlisten(channel);
  }

  async notify(
    channel: string,
    payload: {
      table: string;
      operation: 'INSERT' | 'UPDATE' | 'DELETE';
      before: any;
      after: any;
    },
  ) {
    await this.subscriber.notify(channel, payload);
  }
}
