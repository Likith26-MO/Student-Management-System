const API_URL = '/api/students';

// DOM Elements
const studentForm = document.getElementById('studentForm');
const usnInput = document.getElementById('usn');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const courseInput = document.getElementById('course');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const departmentTabs = document.getElementById('departmentTabs');

// State
let studentsData = [];
let selectedDepartment = '';
let isEditing = false;

function sortStudentsByUsn(list) {
    list.sort((a, b) => {
        const normalize = (usn) => {
            const parts = usn.match(/(\D*)(\d*)$/);
            return parts ? [parts[1], Number(parts[2] || 0)] : [usn, 0];
        };

        const [prefixA, numA] = normalize(a.usn);
        const [prefixB, numB] = normalize(b.usn);

        if (prefixA === prefixB) {
            return numA - numB;
        }
        return prefixA.localeCompare(prefixB, undefined, { sensitivity: 'base' });
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => fetchStudents());

// Fetch all students (or search)
async function fetchStudents(searchQuery = '') {
    try {
        const timestamp = new Date().getTime();
        const url = searchQuery 
            ? `${API_URL}?search=${encodeURIComponent(searchQuery)}&_t=${timestamp}` 
            : `${API_URL}?_t=${timestamp}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch data');
        
        studentsData = await response.json();
        sortStudentsByUsn(studentsData);
        renderTable();
    } catch (error) {
        console.error('Error fetching students:', error);
        alert('Could not load students. Ensure backend is running.');
    }
}

// Render table data
function renderTable() {
    studentTableBody.innerHTML = '';
    sortStudentsByUsn(studentsData);

    let filteredStudents = studentsData;
    const department = selectedDepartment;

    if (department) {
        filteredStudents = filteredStudents.filter(student => student.course === department);
    }

    if (filteredStudents.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>No students found. Add a new student to get started!</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="color: var(--primary)">${student.usn}</strong></td>
            <td style="font-weight: 500;">${student.name}</td>
            <td>${student.email}</td>
            <td><span class="course-tag">${student.course}</span></td>
            <td>
                <button class="btn-icon edit-btn" onclick="editStudent('${student.usn}')" title="Edit">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-icon delete-btn" onclick="deleteStudent('${student.usn}')" title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
}

// Handle Form Submission
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentData = {
        usn: usnInput.value.trim(),
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        course: courseInput.value.trim()
    };

    try {
        if (isEditing) {
            // Update Student
            const response = await fetch(`${API_URL}/${studentData.usn}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            if (!response.ok) throw new Error('Update failed');
        } else {
            // Create Student
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            if (response.status === 409) {
                alert('A student with this USN already exists!');
                return;
            }
            if (!response.ok) throw new Error('Creation failed');
        }

        // Reset and refresh
        resetForm();
        fetchStudents(searchInput.value);
    } catch (error) {
        console.error('Error saving student:', error);
        alert('An error occurred while saving.');
    }
});

// Edit Student - Populate form
function editStudent(usn) {
    const student = studentsData.find(s => s.usn === usn);
    if (!student) return;

    isEditing = true;
    usnInput.value = student.usn;
    usnInput.readOnly = true;     // Prevent changing primary key during edit
    usnInput.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; // Visual cue that it's disabled
    
    nameInput.value = student.name;
    emailInput.value = student.email;
    courseInput.value = student.course;

    formTitle.textContent = 'Edit Student';
    saveBtn.textContent = 'Update Student';
    cancelBtn.style.display = 'inline-flex';
}

// Delete Student
async function deleteStudent(usn) {
    if (!confirm(`Are you sure you want to delete student with USN: ${usn}?`)) return;

    try {
        const response = await fetch(`${API_URL}/${usn}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Deletion failed');
        
        fetchStudents(searchInput.value); // refresh current view
    } catch (error) {
        console.error('Error deleting student:', error);
        alert('Could not delete student.');
    }
}

// Reset Form to initial state
function resetForm() {
    studentForm.reset();
    isEditing = false;
    usnInput.readOnly = false;
    usnInput.style.backgroundColor = '';
    
    formTitle.textContent = 'Add New Student';
    saveBtn.textContent = 'Save Student';
    cancelBtn.style.display = 'none';
}

// Cancel edit button
cancelBtn.addEventListener('click', resetForm);

// Search functionality with debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchStudents(e.target.value.trim());
    }, 300);
});

departmentTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.department-tab');
    if (!tab) return;

    departmentTabs.querySelectorAll('.department-tab').forEach(btn => btn.classList.remove('active'));
    tab.classList.add('active');
    selectedDepartment = tab.dataset.department || '';
    renderTable();
});
