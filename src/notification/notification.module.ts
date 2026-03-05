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
          // Provide a dummy key to prevent the SDK from crashing on startup
          return new Resend('missing_key');
        }
        return new Resend(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule { }
