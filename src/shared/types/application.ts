export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type ApplicationGender = 
  | 'male'
  | 'female'
  | 'other';

export interface Application {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  gender: ApplicationGender;
  dateOfBirth: string;
  institution: string;
  course: string;
  yearOfStudy: string;
  attachmentStart: string;
  attachmentEnd: string;
  departmentId: string;
  periodId: string;
  skills: string;
  motivation: string;
  status: ApplicationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationWithRelations extends Application {
  department?: Department;
  period?: AttachmentPeriod;
  documents?: Document[];
}

export interface CreateApplicationDto {
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  gender: ApplicationGender;
  dateOfBirth: string;
  institution: string;
  course: string;
  yearOfStudy: string;
  attachmentStart: string;
  attachmentEnd: string;
  departmentId: string;
  periodId: string;
  skills: string;
  motivation: string;
}

export interface UpdateApplicationDto extends Partial<CreateApplicationDto> {
  status?: ApplicationStatus;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  slotsTotal: number;
  slotsAvailable: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentPeriod {
  id: string;
  name: string;
  applicationOpen: string;
  applicationClose: string;
  attachmentStart: string;
  attachmentEnd: string;
  status: 'draft' | 'open' | 'closed' | 'opening_soon';
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  applicationId: string;
  userId: string;
  docType: 'cv' | 'intro_letter' | 'national_id' | 'transcripts' | 'other';
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface DocumentUploadDto {
  docType: Document['docType'];
  file: File;
}

export interface ApplicationStats {
  total: number;
  draft: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
}
