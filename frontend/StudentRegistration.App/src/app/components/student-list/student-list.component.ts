import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StudentService } from '../../services/student.service';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-list.component.html',
  styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  selectedStudent: Student | null = null;
  currentIndex = -1;
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
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.filterStudents();

        if (this.selectedStudent) {
          const updatedStudent = students.find(s => s.id === this.selectedStudent!.id);
          if (updatedStudent) {
            this.selectedStudent = updatedStudent;
            this.currentIndex = this.filteredStudents.findIndex(s => s.id === updatedStudent.id);
          } else {
            this.selectedStudent = null;
            this.currentIndex = -1;
          }
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.loading = false;
        this.showError('Error loading students');
      }
    });
  }

  filterStudents(): void {
    this.filteredStudents = [...this.students];
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