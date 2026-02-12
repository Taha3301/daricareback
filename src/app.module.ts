import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { ProfessionalModule } from './professional/professional.module';
import { ZoneModule } from './zone/zone.module';
import { ServicesModule } from './services/services.module';
import { SoinsModule } from './soins/soins.module';
import { NotificationModule } from './notification/notification.module';
import { DocumentsModule } from './documents/documents.module';
import { AuthModule } from './auth/auth.module';
import { AlertModule } from './alert/alert.module';
import { BookingsModule } from './bookings/bookings.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),
    UserModule,
    AdminModule,
    ProfessionalModule,
    ZoneModule,
    ServicesModule,
    SoinsModule,
    NotificationModule,
    DocumentsModule,
    AuthModule,
    AlertModule,
    BookingsModule,
    PatientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
