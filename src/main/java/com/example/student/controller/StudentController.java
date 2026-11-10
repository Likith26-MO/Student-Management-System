package com.example.student.controller;

import com.example.student.entity.Student;
import com.example.student.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // 1. Get all students or search by name / USN
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(studentService.searchStudentsByNameOrUsn(search));
        }
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // Get student by USN
    @GetMapping("/{usn}")
    public ResponseEntity<Student> getStudentByUsn(@PathVariable String usn) {
        Optional<Student> student = studentService.getStudentByUsn(usn);
        return student.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // 2. Add student
    @PostMapping
    public ResponseEntity<Student> addStudent(@RequestBody Student student) {
        // Option to check if USN already exists to avoid silently overwriting
        if (studentService.getStudentByUsn(student.getUsn()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Student savedStudent = studentService.addStudent(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);
    }

    // 3. Update student
    @PutMapping("/{usn}")
    public ResponseEntity<Student> updateStudent(@PathVariable String usn, @RequestBody Student studentDetails) {
        Student updatedStudent = studentService.updateStudent(usn, studentDetails);
        if (updatedStudent != null) {
            return ResponseEntity.ok(updatedStudent);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // 4. Delete student
    @DeleteMapping("/{usn}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String usn) {
        if (studentService.deleteStudent(usn)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
