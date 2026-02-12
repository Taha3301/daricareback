import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';
import { MedicalRequest } from '../bookings/entities/medical-request.entity';
import { MedicalRequestProfessional, AssignmentStatus } from '../bookings/entities/medical-request-professional.entity';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalService {
  constructor(
    @InjectRepository(Professional)
    private professionalRepository: Repository<Professional>,
    @InjectRepository(MedicalRequest)
    private medicalRequestRepository: Repository<MedicalRequest>,
    @InjectRepository(MedicalRequestProfessional)
    private assignmentRepository: Repository<MedicalRequestProfessional>,
  ) { }
  create(createProfessionalDto: CreateProfessionalDto) {
    return 'This action adds a new professional';
  }

  async getAnalytics(professionalId: number) {
    const assignments = await this.assignmentRepository.find({
      where: { professionalId },
      relations: ['medicalRequest', 'medicalRequest.service'],
    });

    const completedAssignments = assignments.filter(a => a.status === AssignmentStatus.ACCEPTED && a.medicalRequest.status === 'done');
    const acceptedAssignments = assignments.filter(a => a.status === AssignmentStatus.ACCEPTED);

    const totalEarning = completedAssignments.reduce((sum, a) => sum + (a.medicalRequest.totalPrice || 0), 0);
    const totalRequests = assignments.length;
    const acceptedCount = acceptedAssignments.length;
    const completionRate = acceptedCount > 0 ? (completedAssignments.length / acceptedCount) * 100 : 0;
    const acceptanceRate = totalRequests > 0 ? (acceptedCount / totalRequests) * 100 : 0;

    // Graph Data: Earnings over the last 6 months
    const now = new Date();
    const monthlyEarnings = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthGains = completedAssignments
        .filter(a => {
          const reqDate = new Date(a.medicalRequest.createdAt);
          return reqDate.getFullYear() === year && reqDate.getMonth() === month;
        })
        .reduce((sum, a) => sum + (a.medicalRequest.totalPrice || 0), 0);

      monthlyEarnings.push({ month: monthLabel, amount: monthGains });
    }

    // Performance by Service
    const servicePerformance = {};
    completedAssignments.forEach(a => {
      const serviceName = a.medicalRequest.service?.name || 'Autre';
      if (!servicePerformance[serviceName]) {
        servicePerformance[serviceName] = { count: 0, gains: 0 };
      }
      servicePerformance[serviceName].count++;
      servicePerformance[serviceName].gains += (a.medicalRequest.totalPrice || 0);
    });

    const topServices = Object.entries(servicePerformance)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.gains - a.gains);

    return {
      summary: {
        totalEarning,
        totalRequests,
        acceptedCount,
        completionRate: parseFloat(completionRate.toFixed(1)),
        acceptanceRate: parseFloat(acceptanceRate.toFixed(1)),
      },
      graphData: {
        monthlyEarnings,
      },
      topServices,
      recentActivity: assignments
        .sort((a, b) => new Date(b.medicalRequest.createdAt).getTime() - new Date(a.medicalRequest.createdAt).getTime())
        .slice(0, 5)
        .map(a => ({
          requestId: a.medicalRequest.id,
          service: a.medicalRequest.service?.name,
          status: a.status,
          date: a.medicalRequest.createdAt,
          price: a.medicalRequest.totalPrice,
        })),
    };
  }

  findAll() {
    return `This action returns all professional`;
  }

  findOne(id: number) {
    return `This action returns a #${id} professional`;
  }

  update(id: number, updateProfessionalDto: UpdateProfessionalDto) {
    return `This action updates a #${id} professional`;
  }

  remove(id: number) {
    return `This action removes a #${id} professional`;
  }
}
