import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './notification.entity';
import { NotificationGateway } from './notification.gateway';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    ConfigModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    {
      provide: 'RESEND_CLIENT',
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get('RESEND_API_KEY');
        if (!apiKey) {
          console.warn('[NotificationModule] RESEND_API_KEY is missing. Emails will not send.');
          return new Resend('missing_key');
        }
        return new Resend(apiKey);
      },
      inject: [ConfigService],
    },
    {
      provide: 'TWILIO_CLIENT',
      useFactory: (configService: ConfigService) => {
        const accountSid = configService.get('TWILIO_ACCOUNT_SID');
        const authToken = configService.get('TWILIO_AUTH_TOKEN');
        if (!accountSid || !authToken) {
          console.warn('[NotificationModule] Twilio credentials missing. WhatsApp will not send.');
          return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const twilio = require('twilio');
        return twilio(accountSid, authToken);
      },
      inject: [ConfigService],
    },
  ],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule { }
