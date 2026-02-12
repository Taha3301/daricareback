import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { MedicalRequest, RequestStatus } from './entities/medical-request.entity';
import { RequestSoin } from './entities/request-soin.entity';
import { RequestDocument } from './entities/request-document.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Professional } from '../professional/entities/professional.entity';
import { NotificationService } from '../notification/notification.service';
import { MedicalRequestProfessional, AssignmentStatus } from './entities/medical-request-professional.entity';
import { Soin } from '../soins/soins.entity';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class BookingsService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(MedicalRequest)
        private medicalRequestRepository: Repository<MedicalRequest>,
        @InjectRepository(Professional)
        private professionalRepository: Repository<Professional>,
        private notificationService: NotificationService,
        private patientsService: PatientsService,
    ) { }

    async createBooking(createBookingDto: CreateBookingDto, files: Express.Multer.File[]): Promise<MedicalRequest> {
        const { soins, prescriptions, ...requestData } = createBookingDto;

        // Validate availability difference (min 2 hours)
        const startTime = this.timeToMinutes(requestData.availabilityStart);
        const endTime = this.timeToMinutes(requestData.availabilityEnd);

        if (endTime - startTime < 120) {
            throw new BadRequestException('Availability start and end must have a minimum difference of 2 hours.');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Create Medical Request
            const medicalRequest = queryRunner.manager.create(MedicalRequest, {
                ...requestData,
                status: RequestStatus.PENDING,
            });
            const savedRequest = await queryRunner.manager.save(medicalRequest);

            // 2. Create Request Soins
            let totalPrice = 0;
            if (soins && soins.length > 0) {
                const requestSoins = [];
                for (const soinDto of soins) {
                    const rs = queryRunner.manager.create(RequestSoin, {
                        ...soinDto,
                        requestId: savedRequest.id,
                    });
                    requestSoins.push(rs);

                    // Fetch soin price and add to total
                    const soin = await queryRunner.manager.findOne(Soin, { where: { id: soinDto.soinId } });
                    if (soin) {
                        totalPrice += (soin.price || 0);
                    }
                }
                await queryRunner.manager.save(requestSoins);
            }

            // Update Medical Request with final total price
            savedRequest.totalPrice = totalPrice;
            await queryRunner.manager.save(savedRequest);

            // 3. Create Request Documents
            if (files && files.length > 0) {
                const requestDocuments = files.map(file =>
                    queryRunner.manager.create(RequestDocument, {
                        requestId: savedRequest.id,
                        filePath: file.path.replace(/\\/g, '/'),
                        fileOriginalName: file.originalname,
                        mimeType: file.mimetype,
                    })
                );
                await queryRunner.manager.save(requestDocuments);
            }

            // 4. Sync Patient Record
            await this.patientsService.syncPatient({
                civility: savedRequest.patientCivility,
                firstname: savedRequest.patientFirstname,
                lastname: savedRequest.patientLastname,
                birthdate: savedRequest.patientBirthdate ? new Date(savedRequest.patientBirthdate) : null,
                phone: savedRequest.patientPhone,
                email: savedRequest.patientEmail,
                address: savedRequest.address,
                latitude: savedRequest.latitude,
                longitude: savedRequest.longitude,
            });

            // 5. Notify (Single notification for the request)
            const service = await queryRunner.manager.findOne('Service', { where: { id: savedRequest.serviceId } }) as any;
            const serviceName = service ? service.name : 'Unknown Service';
            const notificationMessage = `Nouvelle demande de soin pour le service ${serviceName}`;

            await this.notificationService.create(
                {
                    type: serviceName, // Type is the service name
                    reference_id: savedRequest.id,
                    message: notificationMessage
                },
                {
                    patientName: `${savedRequest.patientFirstname} ${savedRequest.patientLastname}`,
                    address: savedRequest.address,
                    dashboardUrl: `http://localhost:5173/dashboard/demands?id=${savedRequest.id}`,
                    requestDetails: {
                        patientPhone: savedRequest.patientPhone,
                        startDate: savedRequest.startDate,
                        availability: `${savedRequest.availabilityStart} - ${savedRequest.availabilityEnd}`
                    }
                }
            );

            // 5. Create assignment for Professionals (Only those with matching speciality)
            const professionals = await queryRunner.manager.find(Professional, {
                where: { speciality: serviceName }
            });
            for (const prof of professionals) {
                let distance = null;
                if (prof.latitude && prof.longitude && savedRequest.latitude && savedRequest.longitude) {
                    distance = this.calculateDistance(
                        prof.latitude,
                        prof.longitude,
                        savedRequest.latitude,
                        savedRequest.longitude
                    );
                }

                const assignment = queryRunner.manager.create(MedicalRequestProfessional, {
                    medicalRequestId: savedRequest.id,
                    professionalId: prof.id,
                    status: AssignmentStatus.PENDING,
                    message: notificationMessage,
                    distance: distance
                });
                await queryRunner.manager.save(assignment);
            }

            await queryRunner.commitTransaction();
            return savedRequest;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return Math.round(d * 100) / 100; // Round to 2 decimal places
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    async findAll(): Promise<MedicalRequest[]> {
        return this.medicalRequestRepository.find({
            relations: ['service', 'requestSoins', 'requestSoins.soin', 'documents'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<any> {
        const request = await this.medicalRequestRepository.findOne({
            where: { id },
            relations: [
                'service',
                'requestSoins',
                'requestSoins.soin',
                'requestSoins.soin.checkboxes',
                'requestSoins.soin.radios',
                'requestSoins.soin.dropdowns',
                'requestSoins.soin.texts',
                'documents'
            ],
        });

        if (!request) {
            throw new NotFoundException(`Medical request with ID ${id} not found`);
        }

        // Process answers for each requestSoin to include question details
        const processedRequestSoins = request.requestSoins.map(rs => {
            const questionAnswers = [];
            const answers = rs.answers || {};

            for (const [key, value] of Object.entries(answers)) {
                const [type, questionIdStr] = key.split(':');
                const questionId = parseInt(questionIdStr);

                let questionData = null;
                switch (type) {
                    case 'text':
                        questionData = rs.soin.texts.find(t => t.id === questionId);
                        break;
                    case 'radio':
                        questionData = rs.soin.radios.find(r => r.id === questionId);
                        break;
                    case 'checkbox':
                        questionData = rs.soin.checkboxes.find(c => c.id === questionId);
                        break;
                    case 'dropdown':
                        questionData = rs.soin.dropdowns.find(d => d.id === questionId);
                        break;
                }

                if (questionData) {
                    questionAnswers.push({
                        question: questionData.name,
                        answer: value,
                        type: type,
                        choices: (questionData as any).choices || null
                    });
                }
            }

            return {
                ...rs,
                questionAnswers
            };
        });

        return {
            ...request,
            requestSoins: processedRequestSoins
        };
    }

    async findAllNotifications(): Promise<any[]> {
        return this.notificationService.findAll();
    }

    async findNotificationsByProfessional(professionalId: number): Promise<any[]> {
        return this.notificationService.findAll();
    }

    async acceptBooking(requestId: number, professionalId: number): Promise<{ requestId: number, professionalId: number }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Check if request is still pending
            const request = await queryRunner.manager.findOne(MedicalRequest, {
                where: { id: requestId },
                lock: { mode: 'pessimistic_write' }
            });

            if (!request) {
                throw new BadRequestException('Request not found.');
            }

            // Load service relation separately to avoid "FOR UPDATE cannot be applied to the nullable side of an outer join" error
            const service = await queryRunner.manager.findOne('Service', { where: { id: request.serviceId } }) as any;
            (request as any).service = service;

            if (request.status !== RequestStatus.PENDING) {
                throw new BadRequestException('Request is no longer available.');
            }

            // 2. Get professional details
            const professional = await queryRunner.manager.findOne(Professional, {
                where: { id: professionalId }
            });

            if (!professional) {
                throw new BadRequestException('Professional not found.');
            }

            // 3. Get assignment to retrieve distance
            const assignment = await queryRunner.manager.findOne(MedicalRequestProfessional, {
                where: { medicalRequestId: requestId, professionalId: professionalId }
            });

            // 4. Update all professional assignments for this request using Raw SQL (Postgres compatible)
            // Explicitly cast 'accepted' and 'denied' to the enum type for PostgreSQL
            await queryRunner.manager.query(
                `UPDATE medical_request_professional 
                 SET status = CASE WHEN professional_id = $1 THEN 'accepted'::medical_request_professional_status_enum ELSE 'denied'::medical_request_professional_status_enum END 
                 WHERE medical_request_id = $2`,
                [professionalId, requestId]
            );

            // 5. Update main request status
            request.status = RequestStatus.ACCEPTED;
            await queryRunner.manager.save(request);

            // 6. Mark notification for this request as read
            try {
                const notifications = await this.notificationService.findAllByReferenceId(requestId);
                if (notifications.length > 0) {
                    await this.notificationService.update(notifications[0].id, { is_read: true });
                }
            } catch (notifError) {
                console.error('Failed to update notification:', notifError);
            }

            // 7. Send acceptance email to patient if email is provided
            if (request.patientEmail) {
                try {
                    const estimatedTime = this.calculateEstimatedTime(assignment?.distance);
                    const patientName = `${request.patientFirstname} ${request.patientLastname}`;
                    const serviceName = request.service?.name || 'Service';
                    const availabilityWindow = `${request.availabilityStart} - ${request.availabilityEnd}`;
                    const startDate = new Date(request.startDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    await this.notificationService.sendAcceptanceEmail(
                        request.patientEmail,
                        patientName,
                        professional.name,
                        professional.speciality,
                        request.address,
                        serviceName,
                        startDate,
                        availabilityWindow,
                        estimatedTime,
                        request.totalPrice
                    );
                } catch (emailError) {
                    // Log error but don't fail the acceptance
                    console.error('Failed to send acceptance email:', emailError);
                }
            }

            await queryRunner.commitTransaction();
            return { requestId, professionalId };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async completeBooking(requestId: number, professionalId: number): Promise<{ requestId: number, status: string }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Check if the request exists and is currently ACCEPTED
            const request = await queryRunner.manager.findOne(MedicalRequest, {
                where: { id: requestId },
                lock: { mode: 'pessimistic_write' }
            });

            if (!request) {
                throw new NotFoundException(`Medical request with ID ${requestId} not found`);
            }

            if (request.status !== RequestStatus.ACCEPTED) {
                throw new BadRequestException(`Only accepted requests can be marked as done. Current status: ${request.status}`);
            }

            // 2. Verify that this professional is the one who was accepted for this request
            const assignment = await queryRunner.manager.findOne(MedicalRequestProfessional, {
                where: {
                    medicalRequestId: requestId,
                    professionalId: professionalId,
                    status: AssignmentStatus.ACCEPTED
                }
            });

            if (!assignment) {
                throw new BadRequestException('You are not authorized to complete this request as you are not the accepted professional for it.');
            }

            // 3. Update the status to DONE
            request.status = RequestStatus.DONE;
            await queryRunner.manager.save(request);

            await queryRunner.commitTransaction();
            return { requestId, status: request.status };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async denyBooking(requestId: number, professionalId: number): Promise<{ requestId: number, professionalId: number }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Update the professional's assignment status
            const assignment = await queryRunner.manager.findOne(MedicalRequestProfessional, {
                where: { medicalRequestId: requestId, professionalId: professionalId }
            });

            if (assignment) {
                assignment.status = AssignmentStatus.DENIED;
                await queryRunner.manager.save(assignment);
            }

            // 2. Check if all assignments for this request are now DENIED
            const allAssignments = await queryRunner.manager.find(MedicalRequestProfessional, {
                where: { medicalRequestId: requestId }
            });

            const allDenied = allAssignments.length > 0 && allAssignments.every(a => a.status === AssignmentStatus.DENIED);

            if (allDenied) {
                // 3. Update the medical request status to REJECTED
                const request = await queryRunner.manager.findOne(MedicalRequest, {
                    where: { id: requestId },
                    relations: ['service']
                });

                if (request && request.status === RequestStatus.PENDING) {
                    request.status = RequestStatus.REJECTED;
                    await queryRunner.manager.save(request);

                    // 4. Send rejection email to patient
                    if (request.patientEmail) {
                        try {
                            const patientName = `${request.patientFirstname} ${request.patientLastname}`;
                            const serviceName = request.service?.name || 'Service';
                            await this.notificationService.sendRejectionEmail(
                                request.patientEmail,
                                patientName,
                                serviceName,
                                request.address
                            );
                        } catch (emailError) {
                            console.error('Failed to send rejection email:', emailError);
                        }
                    }
                }
            }

            await queryRunner.commitTransaction();
            return { requestId, professionalId };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findDistance(requestId: number, professionalId: number): Promise<{ distance: number | null }> {
        const assignment = await this.findAssignment(requestId, professionalId);
        return { distance: assignment.distance };
    }

    async findAssignment(requestId: number, professionalId: number): Promise<MedicalRequestProfessional> {
        const assignment = await this.dataSource.getRepository(MedicalRequestProfessional).findOne({
            where: {
                medicalRequestId: requestId,
                professionalId: professionalId
            }
        });

        if (!assignment) {
            throw new NotFoundException(`Assignment for request ${requestId} and professional ${professionalId} not found`);
        }

        return assignment;
    }

    async findAssignmentsByProfessional(professionalId: number): Promise<MedicalRequestProfessional[]> {
        return this.dataSource.getRepository(MedicalRequestProfessional).find({
            where: { professionalId }
        });
    }

    async findAllRequestsForAdmin(): Promise<any[]> {
        const requests = await this.medicalRequestRepository.find({
            relations: [
                'service',
                'requestSoins',
                'requestSoins.soin',
                'documents'
            ],
            order: { createdAt: 'DESC' },
        });

        const results = [];

        for (const req of requests) {
            // Find accepted professional info
            const acceptedAssignment = await this.dataSource.getRepository(MedicalRequestProfessional).findOne({
                where: {
                    medicalRequestId: req.id,
                    status: AssignmentStatus.ACCEPTED
                },
                relations: ['professional']
            });

            results.push({
                request: req,
                acceptedProfessional: acceptedAssignment ? {
                    id: acceptedAssignment.professional.id,
                    name: acceptedAssignment.professional.name,
                    email: acceptedAssignment.professional.email,
                    phone: acceptedAssignment.professional.phone,
                    speciality: acceptedAssignment.professional.speciality,
                } : null,
                distance: acceptedAssignment ? acceptedAssignment.distance : null,
                assignmentStatus: acceptedAssignment ? 'ACCEPTED' : (req.status === RequestStatus.REJECTED ? 'REJECTED' : 'PENDING')
            });
        }

        return results;
    }

    async findAllRequestsDetailed(): Promise<any[]> {
        const requests = await this.medicalRequestRepository.find({
            relations: [
                'service',
                'requestSoins',
                'requestSoins.soin',
                'documents'
            ],
            order: { createdAt: 'DESC' },
        });

        const results = [];

        for (const req of requests) {
            // Find ALL professionals assigned (accepted, pending, or denied)
            const assignments = await this.dataSource.getRepository(MedicalRequestProfessional).find({
                where: { medicalRequestId: req.id },
                relations: ['professional']
            });

            const acceptedAssignment = assignments.find(a => a.status === AssignmentStatus.ACCEPTED);

            results.push({
                requestId: req.id,
                status: req.status,
                totalPrice: req.totalPrice,
                createdAt: req.createdAt,
                patient: {
                    name: `${req.patientFirstname} ${req.patientLastname}`,
                    email: req.patientEmail,
                    phone: req.patientPhone,
                    address: req.address
                },
                service: req.service ? {
                    id: req.service.id,
                    name: req.service.name
                } : null,
                acceptedProfessional: acceptedAssignment ? {
                    id: acceptedAssignment.professional.id,
                    name: acceptedAssignment.professional.name,
                    email: acceptedAssignment.professional.email,
                    phone: acceptedAssignment.professional.phone,
                    speciality: acceptedAssignment.professional.speciality,
                } : null,
                distance: acceptedAssignment ? acceptedAssignment.distance : null,
                allAssignments: assignments.map(a => ({
                    professionalId: a.professional.id,
                    professionalName: a.professional.name,
                    status: a.status,
                    distance: a.distance
                }))
            });
        }

        return results;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private calculateEstimatedTime(distanceKm: number | null): number {
        if (!distanceKm || distanceKm <= 0) {
            return 30; // Default to 30 minutes if distance is not available
        }

        const averageSpeedKmh = 30; // Average speed in urban areas (km/h)
        const estimatedTimeMinutes = (distanceKm / averageSpeedKmh) * 60;

        return Math.round(estimatedTimeMinutes);
    }
}
