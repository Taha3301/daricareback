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
      useFactory: async (configService: ConfigService) => {
        const smtpHost = configService.get('SMTP_HOST');

        // Manually resolve to IPv4 to bypass Render's IPv6 networking issues
        const resolvedHost = await new Promise<string>((resolve, reject) => {
          dns.lookup(smtpHost, { family: 4 }, (err, address) => {
            if (err) {
              console.error(`[SMTP] Failed to resolve ${smtpHost} to IPv4:`, err);
              resolve(smtpHost); // Fallback to original hostname if lookup fails
            } else {
              console.log(`[SMTP] Manually resolved ${smtpHost} to IPv4: ${address}`);
              resolve(address);
            }
          });
        });

        return {
          transport: {
            host: resolvedHost,
            port: parseInt(configService.get('SMTP_PORT')),
            secure: configService.get('SMTP_SECURE') === 'true',
            pool: false,
            family: 4,
            logger: true,
            debug: true,
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
            tls: {
              servername: smtpHost, // CRITICAL: Must match original host for SSL certificate validation
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
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule { }
