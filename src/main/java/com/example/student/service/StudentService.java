package com.example.student.service;

import com.example.student.entity.Student;
import com.example.student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Direction.ASC, "usn"));
    }

    public Optional<Student> getStudentByUsn(String usn) {
        return studentRepository.findById(usn);
    }

    public List<Student> searchStudentsByNameOrUsn(String query) {
        return studentRepository.searchByNameOrUsn(query);
    }

    public Student addStudent(Student student) {
        return studentRepository.save(student);
    }

    public Student updateStudent(String usn, Student studentDetails) {
        Optional<Student> studentOptional = studentRepository.findById(usn);
        
        if (studentOptional.isPresent()) {
            Student existingStudent = studentOptional.get();
            existingStudent.setName(studentDetails.getName());
            existingStudent.setEmail(studentDetails.getEmail());
            existingStudent.setCourse(studentDetails.getCourse());
            return studentRepository.save(existingStudent);
        }
        return null; // Could throw custom exception here instead
    }

    public boolean deleteStudent(String usn) {
        if (studentRepository.existsById(usn)) {
            studentRepository.deleteById(usn);
            return true;
        }
        return false;
    }
}
