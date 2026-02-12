import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    UseInterceptors,
    UploadedFiles,
    ParseIntPipe,
    BadRequestException,
    UseGuards,
    Request,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiResponse, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { MedicalRequest } from './entities/medical-request.entity';
import { MedicalRequestProfessional } from './entities/medical-request-professional.entity';
import { Notification } from '../notification/notification.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new medical care booking' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateBookingDto })
    @ApiResponse({ status: 201, description: 'The booking has been successfully created.', type: MedicalRequest })
    @ApiResponse({ status: 400, description: 'Invalid input data or file format.' })
    @UseInterceptors(
        FilesInterceptor('prescriptions', 6, {
            storage: diskStorage({
                destination: './uploads/prescriptions',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
                    return cb(new BadRequestException('Only JPG, PNG and PDF files are allowed!'), false);
                }
                cb(null, true);
            },
            limits: {
                fileSize: 6 * 1024 * 1024, // 6MB
            },
        }),
    )
    async create(
        @Body() createBookingDto: CreateBookingDto,
        @UploadedFiles() files: Express.Multer.File[],
    ): Promise<MedicalRequest> {
        return this.bookingsService.createBooking(createBookingDto, files);
    }

    @Get()
    @ApiOperation({ summary: 'List all medical care bookings' })
    @ApiResponse({ status: 200, description: 'Return all bookings.', type: [MedicalRequest] })
    async findAll(): Promise<MedicalRequest[]> {
        return this.bookingsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific booking by ID' })
    @ApiResponse({ status: 200, description: 'Return the booking details.', type: MedicalRequest })
    @ApiResponse({ status: 404, description: 'Booking not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<MedicalRequest> {
        return this.bookingsService.findOne(id);
    }

    @Get('notifications/all')
    @ApiOperation({ summary: 'Get all notifications' })
    @ApiResponse({ status: 200, description: 'Return all notifications.', type: [Notification] })
    async findAllNotifications(): Promise<any[]> {
        return this.bookingsService.findAllNotifications();
    }

    @Get('notifications/professional/:id')
    @ApiOperation({ summary: 'Get notifications for a specific professional' })
    @ApiResponse({ status: 200, description: 'Return specific professional notifications.', type: [Notification] })
    async findNotificationsByProfessional(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
        return this.bookingsService.findNotificationsByProfessional(id);
    }

    @Post(':id/accept')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Accept a medical request' })
    @ApiResponse({ status: 200, description: 'Request accepted successfully.' })
    @ApiResponse({ status: 400, description: 'Request already taken or not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async accept(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any,
    ): Promise<{ requestId: number, professionalId: number }> {
        // Automatically use the ID from the JWT token and the ID from the path as Request ID
        const professionalId = req.user.userId;
        return this.bookingsService.acceptBooking(id, professionalId);
    }

    @Post(':id/deny')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Deny a medical request' })
    @ApiResponse({ status: 200, description: 'Request denied successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async deny(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any,
    ): Promise<{ requestId: number, professionalId: number }> {
        const professionalId = req.user.userId;
        return this.bookingsService.denyBooking(id, professionalId);
    }

    @Post(':id/complete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mark a medical request as completed (DONE)' })
    @ApiResponse({ status: 200, description: 'Request marked as DONE successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid request status or unauthorized professional.' })
    @ApiResponse({ status: 404, description: 'Request not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async complete(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any,
    ): Promise<{ requestId: number, status: string }> {
        const professionalId = req.user.userId;
        return this.bookingsService.completeBooking(id, professionalId);
    }

    @Get('distance/:requestId/:professionalId')
    @ApiOperation({ summary: 'Get distance between a professional and a medical request' })
    @ApiResponse({ status: 200, description: 'Return the distance.' })
    @ApiResponse({ status: 404, description: 'Assignment not found.' })
    async getDistance(
        @Param('requestId', ParseIntPipe) requestId: number,
        @Param('professionalId', ParseIntPipe) professionalId: number,
    ): Promise<{ distance: number | null }> {
        return this.bookingsService.findDistance(requestId, professionalId);
    }

    @Get('status/:requestId/:professionalId')
    @ApiOperation({ summary: 'Get assignment status for a specific professional and medical request' })
    @ApiResponse({ status: 200, description: 'Return the assignment details (including status).', type: MedicalRequestProfessional })
    @ApiResponse({ status: 404, description: 'Assignment not found.' })
    async getAssignmentStatus(
        @Param('requestId', ParseIntPipe) requestId: number,
        @Param('professionalId', ParseIntPipe) professionalId: number,
    ): Promise<MedicalRequestProfessional> {
        return this.bookingsService.findAssignment(requestId, professionalId);
    }

    @Get('professional/:id/assignments')
    @ApiOperation({ summary: 'Get all assignments for a specific professional' })
    @ApiResponse({ status: 200, description: 'Return professional assignments.', type: [MedicalRequestProfessional] })
    async getAssignmentsByProfessional(@Param('id', ParseIntPipe) id: number): Promise<MedicalRequestProfessional[]> {
        return this.bookingsService.findAssignmentsByProfessional(id);
    }
}
