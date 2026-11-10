package com.example.student.repository;

import com.example.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    // Custom query to search by name or USN containing a string
    @Query("SELECT s FROM Student s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.usn) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY s.usn ASC")
    List<Student> searchByNameOrUsn(@Param("query") String query);
}
