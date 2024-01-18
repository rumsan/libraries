import { Module } from '@nestjs/common';
import { DocmanModule, IpfsStorage } from '@rumsan/docman';
import { DocController } from './doc.controller';

@Module({
  imports: [
    DocmanModule.forRoot({
      storage: new IpfsStorage(),
      config: {
        host: 'localhost', // Update with your IPFS host
        port: 5001, // Update with your IPFS port
        protocol: 'http', // or 'https', depending on your IPFS setup
      },
    }),
  ],
  controllers: [DocController],
})
export class AppDocModule {}
