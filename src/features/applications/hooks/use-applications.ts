import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApplicationService } from '../services/application.service';
import type {
  Application,
  ApplicationWithRelations,
  CreateApplicationDto,
  UpdateApplicationDto,
  DocumentUploadDto,
} from '../../../shared/types/application';

// Query keys factory
export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters?: any) => [...applicationKeys.lists(), filters] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  my: (userId: string) => [...applicationKeys.all, 'my', userId] as const,
  documents: (applicationId: string) => [...applicationKeys.all, 'documents', applicationId] as const,
  departments: () => [...applicationKeys.all, 'departments'] as const,
  periods: () => [...applicationKeys.all, 'periods'] as const,
  stats: () => [...applicationKeys.all, 'stats'] as const,
};

// Get applications with optional filters
export function useApplications(filters?: {
  status?: string;
  search?: string;
  departmentId?: string;
  periodId?: string;
}) {
  return useQuery({
    queryKey: applicationKeys.list(filters),
    queryFn: () => ApplicationService.getApplications(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get my applications
export function useMyApplications(userId: string) {
  return useQuery({
    queryKey: applicationKeys.my(userId),
    queryFn: () => ApplicationService.getMyApplications(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get single application
export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => ApplicationService.getApplication(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get application documents
export function useApplicationDocuments(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.documents(applicationId),
    queryFn: () => ApplicationService.getApplicationDocuments(applicationId),
    enabled: !!applicationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get departments
export function useDepartments(activeOnly: boolean = true) {
  return useQuery({
    queryKey: applicationKeys.departments(),
    queryFn: () => ApplicationService.getDepartments(activeOnly),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get attachment periods
export function useAttachmentPeriods() {
  return useQuery({
    queryKey: applicationKeys.periods(),
    queryFn: () => ApplicationService.getAttachmentPeriods(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get current attachment period
export function useCurrentAttachmentPeriod() {
  return useQuery({
    queryKey: [...applicationKeys.periods(), 'current'],
    queryFn: () => ApplicationService.getCurrentAttachmentPeriod(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get application stats
export function useApplicationStats() {
  return useQuery({
    queryKey: applicationKeys.stats(),
    queryFn: () => ApplicationService.getApplicationStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Create application mutation
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationDto) => ApplicationService.createApplication(data),
    onSuccess: (newApplication) => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      
      // Add to cache
      queryClient.setQueryData(
        applicationKeys.detail(newApplication.id),
        newApplication
      );
    },
  });
}

// Update application mutation
export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationDto }) =>
      ApplicationService.updateApplication(id, data),
    onSuccess: (updatedApplication, { id }) => {
      // Update cache
      queryClient.setQueryData(applicationKeys.detail(id), updatedApplication);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

// Submit application mutation
export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ApplicationService.submitApplication(id),
    onSuccess: (updatedApplication, id) => {
      // Update cache
      queryClient.setQueryData(applicationKeys.detail(id), updatedApplication);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: applicationKeys.my(updatedApplication.userId) });
    },
  });
}

// Update application status mutation
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      status, 
      reviewNotes 
    }: { 
      id: string; 
      status: Application['status']; 
      reviewNotes?: string;
    }) => ApplicationService.updateApplicationStatus(id, status, reviewNotes),
    onSuccess: (updatedApplication, { id }) => {
      // Update cache
      queryClient.setQueryData(applicationKeys.detail(id), updatedApplication);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

// Upload document mutation
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      applicationId, 
      documentData 
    }: { 
      applicationId: string; 
      documentData: DocumentUploadDto;
    }) => ApplicationService.uploadDocument(applicationId, documentData),
    onSuccess: (newDocument, { applicationId }) => {
      // Invalidate documents list
      queryClient.invalidateQueries({ 
        queryKey: applicationKeys.documents(applicationId) 
      });
    },
  });
}

// Delete document mutation
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => ApplicationService.deleteDocument(documentId),
    onSuccess: (_, documentId) => {
      // Find and invalidate the documents list for this application
      queryClient.invalidateQueries({ 
        queryKey: applicationKeys.documents 
      });
    },
  });
}
