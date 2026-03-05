import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './notification.entity';
import { NotificationGateway } from './notification.gateway';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dns from 'node:dns';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: parseInt(configService.get('SMTP_PORT')),
          secure: configService.get('SMTP_SECURE') === 'true',
          pool: true,
          family: 4,
          lookup: (hostname, options, callback) => dns.lookup(hostname, { family: 4 }, callback),
          connectionTimeout: 20000,
          greetingTimeout: 20000,
          socketTimeout: 30000,
          tls: {
            rejectUnauthorized: false
          },
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"Daricare" <${configService.get('SMTP_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule { }
