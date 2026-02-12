import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationGateway } from './notification.gateway';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationGateway: NotificationGateway,
    private readonly mailerService: MailerService,
  ) { }

  async create(createNotificationDto: CreateNotificationDto, extraData?: any) {
    const notification = this.notificationRepository.create(createNotificationDto);
    const savedNotification = await this.notificationRepository.save(notification);

    // Emit real-time notification via WebSocket with extra data (link, patient info, etc.)
    this.notificationGateway.sendToSpeciality(createNotificationDto.type, {
      ...savedNotification,
      ...extraData,
    });

    return savedNotification;
  }

  findAll() {
    return this.notificationRepository.find({ order: { created_at: 'DESC' } });
  }

  findAllByReferenceId(reference_id: number) {
    return this.notificationRepository.find({
      where: { reference_id },
    });
  }

  findOne(id: number) {
    return this.notificationRepository.findOne({ where: { id } });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.notificationRepository.delete(id);
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `http://localhost:5173/reset-password?token=${token}`; // Update with actual frontend URL if needed

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
  }

  async sendAcceptanceEmail(
    patientEmail: string,
    patientName: string,
    professionalName: string,
    professionalSpeciality: string,
    address: string,
    serviceName: string,
    startDate: string,
    availabilityWindow: string,
    estimatedTimeMinutes: number,
    totalPrice: number,
  ) {
    const hours = Math.floor(estimatedTimeMinutes / 60);
    const minutes = Math.round(estimatedTimeMinutes % 60);

    let estimatedTimeText = '';
    if (hours > 0 && minutes > 0) {
      estimatedTimeText = `${hours} heure${hours > 1 ? 's' : ''} et ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      estimatedTimeText = `${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      estimatedTimeText = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    await this.mailerService.sendMail({
      to: patientEmail,
      subject: 'Votre demande de soin a été acceptée - DariCare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; margin-top: 0;">Bonne nouvelle ! Votre demande a été acceptée</h2>
            
            <p style="color: #34495e; font-size: 16px;">Bonjour <strong>${patientName}</strong>,</p>
            
            <p style="color: #34495e; font-size: 16px;">
              Nous avons le plaisir de vous informer que votre demande de soin a été acceptée par un professionnel de santé.
            </p>
            
            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2e7d32; margin-top: 0;">Détails du professionnel</h3>
              <p style="color: #34495e; margin: 5px 0;"><strong>Nom :</strong> ${professionalName}</p>
              <p style="color: #34495e; margin: 5px 0;"><strong>Spécialité :</strong> ${professionalSpeciality}</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1565c0; margin-top: 0;">Détails de votre demande</h3>
              <p style="color: #34495e; margin: 5px 0;"><strong>Service :</strong> ${serviceName}</p>
              <p style="color: #34495e; margin: 5px 0;"><strong>Adresse :</strong> ${address}</p>
              <p style="color: #34495e; margin: 5px 0;"><strong>Date :</strong> ${startDate}</p>
              <p style="color: #34495e; margin: 5px 0;"><strong>Disponibilité :</strong> ${availabilityWindow}</p>
            </div>

            <div style="background-color: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #7b1fa2; margin-top: 0;">Récapitulatif financier</h3>
              <p style="color: #34495e; font-size: 18px; margin: 5px 0;">
                <strong>Montant total :</strong> ${totalPrice} DT
              </p>
            </div>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #ef6c00; margin-top: 0;">⏱️ Temps estimé d'arrivée</h3>
              <p style="color: #34495e; font-size: 18px; margin: 5px 0;">
                Le professionnel devrait arriver dans environ <strong>${estimatedTimeText}</strong>
              </p>
              <p style="color: #757575; font-size: 14px; margin-top: 10px;">
                <em>Ce temps est une estimation basée sur la distance et peut varier selon les conditions de circulation.</em>
              </p>
            </div>
            
            <p style="color: #34495e; font-size: 16px;">
              Le professionnel vous contactera prochainement pour confirmer les détails de l'intervention.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #757575; font-size: 14px; text-align: center;">
              Merci de votre confiance,<br>
              <strong>L'équipe DariCare</strong>
            </p>
          </div>
        </div>
      `,
    });
  }

  async sendRejectionEmail(
    patientEmail: string,
    patientName: string,
    serviceName: string,
    address: string,
  ) {
    await this.mailerService.sendMail({
      to: patientEmail,
      subject: 'Mise à jour concernant votre demande de soin - DariCare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #c62828; margin-top: 0;">Information sur votre demande</h2>
            
            <p style="color: #34495e; font-size: 16px;">Bonjour <strong>${patientName}</strong>,</p>
            
            <p style="color: #34495e; font-size: 16px;">
              Nous vous informons qu'actuellement, aucun professionnel de santé n'est disponible pour répondre à votre demande de <strong>${serviceName}</strong> à l'adresse suivante : ${address}.
            </p>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #ef6c00; margin-top: 0;">Que pouvez-vous faire ?</h3>
              <p style="color: #34495e; margin: 5px 0;">
                Nous vous invitons à <strong>renouveler votre demande</strong> ultérieurement ou à essayer avec une plage horaire différente pour augmenter vos chances de trouver un professionnel disponible.
              </p>
            </div>
            
            <p style="color: #34495e; font-size: 16px;">
              Nous nous excusons pour ce désagrément et restons à votre disposition.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #757575; font-size: 14px; text-align: center;">
              L'équipe DariCare
            </p>
          </div>
        </div>
      `,
    });
  }
}
