import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, CreateStudentDto, UpdateStudentDto, StudentSearchRequest, PagedResultDto } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'https://localhost:7132/api/Students';

  constructor(private http: HttpClient) {}

  getAllStudents(request: StudentSearchRequest): Observable<PagedResultDto<Student>> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('pageSize', request.pageSize.toString())

    if (request.searchTerm) {
      params = params.set('searchTerm', request.searchTerm);
    }
    return this.http.get<PagedResultDto<Student>>(this.apiUrl, { params });
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: CreateStudentDto): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  updateStudent(id: number, student: UpdateStudentDto): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}