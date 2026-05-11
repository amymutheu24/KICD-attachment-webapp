import { apiClient } from '../../../infrastructure/api/client';
import type {
  Application,
  ApplicationWithRelations,
  CreateApplicationDto,
  UpdateApplicationDto,
  Document,
  DocumentUploadDto,
  ApplicationStats,
  Department,
  AttachmentPeriod,
} from '../../../shared/types/application';

export class ApplicationService {
  static async getApplications(
    filters?: {
      status?: string;
      search?: string;
      departmentId?: string;
      periodId?: string;
    }
  ): Promise<ApplicationWithRelations[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.periodId) params.append('periodId', filters.periodId);

    const url = `/api/applications${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClient.get<ApplicationWithRelations[]>(url);
    return response.data;
  }

  static async getMyApplications(userId: string): Promise<ApplicationWithRelations[]> {
    const response = await apiClient.get<ApplicationWithRelations[]>(`/api/applications/my/${userId}`);
    return response.data;
  }

  static async getApplication(id: string): Promise<ApplicationWithRelations> {
    const response = await apiClient.get<ApplicationWithRelations>(`/api/applications/${id}`);
    return response.data;
  }

  static async createApplication(data: CreateApplicationDto): Promise<Application> {
    const response = await apiClient.post<Application>('/api/applications', data);
    return response.data;
  }

  static async updateApplication(id: string, data: UpdateApplicationDto): Promise<Application> {
    const response = await apiClient.put<Application>(`/api/applications/${id}`, data);
    return response.data;
  }

  static async submitApplication(id: string): Promise<Application> {
    const response = await apiClient.put<Application>(`/api/applications/${id}/submit`);
    return response.data;
  }

  static async updateApplicationStatus(
    id: string,
    status: Application['status'],
    reviewNotes?: string
  ): Promise<Application> {
    const response = await apiClient.put<Application>(`/api/applications/${id}/status`, {
      status,
      reviewNotes,
    });
    return response.data;
  }

  static async getApplicationDocuments(applicationId: string): Promise<Document[]> {
    const response = await apiClient.get<Document[]>(`/api/applications/${applicationId}/documents`);
    return response.data;
  }

  static async uploadDocument(
    applicationId: string,
    documentData: DocumentUploadDto
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('docType', documentData.docType);
    formData.append('file', documentData.file);

    const response = await apiClient.upload<Document>(
      `/api/applications/${applicationId}/documents`,
      formData
    );
    return response.data;
  }

  static async deleteDocument(documentId: string): Promise<void> {
    await apiClient.delete(`/api/documents/${documentId}`);
  }

  static async getApplicationStats(): Promise<ApplicationStats> {
    const response = await apiClient.get<ApplicationStats>('/api/applications/stats');
    return response.data;
  }

  static async getDepartments(activeOnly: boolean = true): Promise<Department[]> {
    const url = `/api/departments${activeOnly ? '?active=true' : ''}`;
    const response = await apiClient.get<Department[]>(url);
    return response.data;
  }

  static async getAttachmentPeriods(): Promise<AttachmentPeriod[]> {
    const response = await apiClient.get<AttachmentPeriod[]>('/api/attachment-periods');
    return response.data;
  }

  static async getCurrentAttachmentPeriod(): Promise<AttachmentPeriod | null> {
    const response = await apiClient.get<AttachmentPeriod | null>('/api/attachment-periods/current');
    return response.data;
  }
}
