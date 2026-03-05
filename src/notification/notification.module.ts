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
          pool: false, // Disable pooling for debugging
          family: 4,
          lookup: (hostname, options, callback) => {
            console.log(`[SMTP Debug] Resolving ${hostname}...`);
            return dns.lookup(hostname, { family: 4 }, (err, address, family) => {
              console.log(`[SMTP Debug] Resolved ${hostname} to ${address} (family: ${family})`);
              callback(err, address, family);
            });
          },
          logger: true, // Enable nodemailer internal logging
          debug: true,  // Show SMTP traffic in logs
          connectionTimeout: 60000, // Increase to 60s
          greetingTimeout: 30000,
          socketTimeout: 60000,
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
