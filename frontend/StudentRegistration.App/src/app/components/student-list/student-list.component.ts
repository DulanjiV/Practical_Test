import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StudentService } from '../../services/student.service';
import { Student, StudentSearchRequest, PagedResultDto } from '../../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  Math = Math;
  filteredStudents: Student[] = [];
  selectedStudent: Student | null = null;
  pagedResult: PagedResultDto<Student> | null = null;
  currentIndex = -1;
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  loading = false;
  successMessage = '';
  errorMessage = '';
  warningMessage = '';
  showDeleteConfirm = false;
  studentToDelete: Student | null = null;
  showForm = false;
  isEdit = false;

  formStudent: any = {
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    nic: '',
    dateOfBirth: '',
    address: ''
  };

  constructor(private studentService: StudentService) { }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.loading = true;

    const searchRequest: StudentSearchRequest = {
      searchTerm: this.searchTerm || undefined,
      page: this.currentPage,
      pageSize: this.pageSize
    };

    this.studentService.getAllStudents(searchRequest).subscribe({
      next: (result: PagedResultDto<Student>) => {
        this.pagedResult = result;
        this.filteredStudents = result.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadStudents();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= (this.pagedResult?.totalPages || 1)) {
      this.currentPage = page;
      this.loadStudents();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadStudents();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  getPageNumbers(): number[] {
    if (!this.pagedResult) return [];

    const totalPages = this.pagedResult.totalPages;
    const currentPage = this.pagedResult.currentPage;
    const pages: number[] = [];

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  selectStudent(student: Student): void {
    if (this.selectedStudent?.id === student.id) {
      this.selectedStudent = null;
      this.currentIndex = -1;
    } else {
      this.selectedStudent = student;
      this.currentIndex = this.filteredStudents.findIndex(s => s.id === student.id);
    }
  }

  navigateStudent(direction: string): void {
    if (direction === 'prev' && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (direction === 'next' && this.currentIndex < this.filteredStudents.length - 1) {
      this.currentIndex++;
    }
    this.selectedStudent = this.filteredStudents[this.currentIndex];
  }

  openAddForm(): void {
    this.isEdit = false;
    this.formStudent = {
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      nic: '',
      dateOfBirth: '',
      address: ''
    };
    this.showForm = true;
  }

  openEditForm(): void {
    if (!this.selectedStudent) return;

    this.isEdit = true;
    this.formStudent = {
      ...this.selectedStudent,
      dateOfBirth: this.formatDate(this.selectedStudent.dateOfBirth)
    };
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  saveStudent(): void {
    if (!this.isFormValid()) {
      this.showWarning('Please fill in all required fields');
      return;
    }
    this.loading = true;

    const studentData = {
      ...this.formStudent,
    };

    if (this.isEdit) {
      this.studentService.updateStudent(this.formStudent.id, studentData).subscribe({
        next: () => {
          this.loading = false;
          this.showForm = false;
          this.loadStudents();
          this.showSuccess('Student updated successfully!');
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating student:', error);
          this.showError('Error updating student');
        }
      });
    } else {
      this.studentService.createStudent(studentData).subscribe({
        next: () => {
          this.loading = false;
          this.showForm = false;
          this.loadStudents();
          this.showSuccess('Student added successfully!');
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating student:', error);
          this.showError('Error creating student');
        }
      });
    }
  }

  deleteStudent(): void {
    if (!this.selectedStudent) return;
    this.showDeleteConfirmation(this.selectedStudent);
  }

  private isFormValid(): boolean {
    return !!(
      this.formStudent.firstName &&
      this.formStudent.lastName &&
      this.formStudent.mobile &&
      this.formStudent.email &&
      this.formStudent.nic &&
      this.formStudent.dateOfBirth
    );
  }

  isSelected(student: Student): boolean {
    return this.selectedStudent?.id === student.id;
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  showSuccess(message: string): void {
    this.successMessage = message;
  }

  showError(message: string): void {
    this.errorMessage = message;
  }

  showWarning(message: string): void {
    this.warningMessage = message;
  }

  dismissMessage(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.warningMessage = '';
  }

  showDeleteConfirmation(student: Student): void {
    this.studentToDelete = student;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.studentToDelete = null;
  }

  confirmDelete(): void {
    if (this.studentToDelete) {
      this.loading = true;
      this.studentService.deleteStudent(this.studentToDelete.id).subscribe({
        next: () => {
          this.loading = false;
          this.showSuccess('Student deleted successfully!');
          this.selectedStudent = null;
          this.currentIndex = -1;
          this.loadStudents();
          this.showDeleteConfirm = false;
          this.studentToDelete = null;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error deleting student:', error);
          this.showError('Failed to delete student. Please try again.');
          this.showDeleteConfirm = false;
          this.studentToDelete = null;
        }
      });
    }
  }
}