package com.example.student.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    private String usn;

    private String name;
    private String email;
    private String course;

    // Default Constructor
    public Student() {
    }

    // Parameterized Constructor
    public Student(String usn, String name, String email, String course) {
        this.usn = usn;
        this.name = name;
        this.email = email;
        this.course = course;
    }

    // Getters and Setters
    public String getUsn() {
        return usn;
    }

    public void setUsn(String usn) {
        this.usn = usn;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }
}
