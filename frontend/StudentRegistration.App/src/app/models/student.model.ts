export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  nic: string;
  dateOfBirth: Date;
  address: string;
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  nic: string;
  dateOfBirth: string;
  address: string;
}

export interface UpdateStudentDto {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  nic: string;
  dateOfBirth: string;
  address: string;
}

export interface StudentSearchRequest {
  searchTerm?: string;
  page: number;
  pageSize: number;
}
export interface PagedResultDto<T> {
  data: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}