const STORAGE_KEY = "sims_students_group8";
const USER_KEY = "sims_logged_in_user";
const DEFAULT_STUDENTS = [
    {
        id: "STU-001",
        name: "Sok Dara",
        gender: "Male",
    major: "Information Technology",
    status: "Active",
    email: "sok.dara@example.edu",
    phone: "+855 12 345 678",
    address: "Phnom Penh, Cambodia"
    },
{
    id: "STU-002",
    name: "Chan Bopha",
    gender: "Female",
    major: "Computer Science",
    status: "Active",
    email: "chan.bopha@example.edu",
    phone: "+855 17 222 333",
    address: "Siem Reap, Cambodia"
},
{
    id: "STU-003",
    name: "Meas Virak",
    gender: "Male",
    major: "Data Analytics",
    status: "Pending",
    email: "meas.virak@example.edu",
    phone: "+855 96 444 555",
    address: "Battambang, Cambodia"
}
];
function getStudents() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
        return [...DEFAULT_STUDENTS];
    }
    try {
        return JSON.parse(raw);
    } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
        return [...DEFAULT_STUDENTS];
    }
}
function saveStudents(students) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}
function initLoginPage() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;
    const usernameInput = document.getElementById("username");
    const rememberCheck = document.getElementById("rememberMe");
    const forgotLink = document.getElementById("forgotPasswordLink");
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser && usernameInput) {
        usernameInput.value = savedUser;
        if (rememberCheck) rememberCheck.checked = true;
    }
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = usernameInput ? usernameInput.value.trim() : "";
        if (!username) return;
        localStorage.setItem(USER_KEY, username);
        window.location.href = "dashboard.html";
    });
    if (forgotLink) {
        forgotLink.addEventListener("click", function (e) {
            e.preventDefault();
            alert("Demo mode: Enter any username / email and password to sign in.");
        });
    }
}
function updateStats(students) {
    const totalEl = document.getElementById("totalStudentsCount");
    const deptEl = document.getElementById("activeDepartmentsCount");
    const activeEl = document.getElementById("activeStudentsCount");
    if (totalEl) totalEl.textContent = String(students.length);
    const uniqueMajors = new Set(students.map((s) => s.major).filter(Boolean));
    if (deptEl) deptEl.textContent = String(uniqueMajors.size);
    const activeCount = students.filter((s) => s.status === "Active").length;
    if (activeEl) activeEl.textContent = String(activeCount);
}
function renderDashboardTable() {
    const tbody = document.getElementById("studentTableBody");
    if (!tbody) return;
    const students = getStudents();
    updateStats(students);
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const statusVal = statusFilter ? statusFilter.value : "All";
    const filtered = students.filter((student) => {
        const matchesStatus = statusVal === "All" || student.status === statusVal;
        const matchesQuery =
            !query ||
            student.id.toLowerCase().includes(query) ||
            student.name.toLowerCase().includes(query) ||
            student.major.toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
    });
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No matching student records found.</td></tr >';
        return;
    }
    tbody.innerHTML = filtered
        .map((student) => {
            const badgeClass =
                student.status === "Active"
? "bg - success - subtle text - success"
: "bg - warning - subtle text - warning";
            return (
"<tr>" +
                "<td>" + escapeHtml(student.id) + "</td>" +
                "<td>" + escapeHtml(student.name) + "</td>" +
                "<td>" + escapeHtml(student.gender) + "</td>" +
                "<td>" + escapeHtml(student.major) + "</td>" +
                '<td><span class="badge ' + badgeClass + '">' + escapeHtml(student.status) + "</span></td>" +
'<td class=" text-end">' +
                '<a href="details.html?id=' + encodeURIComponent(student.id) + '" class="btn btn-sm btn-outline-primary me-1">View</a>' +
'<a href=" form.html?edit=' + encodeURIComponent(student.id) + '" class="btn btn - sm btn - outline - secondary me - 1"> Edit</a >' +
'<button type=" button" class="" btn btn-sm btn-outline-danger delete-btn" data-id="' + escapeHtml(student.id) + '"> Delete</button >' +
"</td >" +
"</tr >"
);
})
.join("");
tbody.querySelectorAll(".delete -btn").forEach((btn) => {
    btn.addEventListener("click", function () {
        const targetId = btn.getAttribute("data - id");
        if (!targetId) return;
        const confirmed = confirm("Delete student " + targetId + "?");
        if (!confirmed) return;
        const updated = getStudents().filter((s) => s.id !== targetId);
        saveStudents(updated);
        renderDashboardTable();
    });
});
}
function initDashboardPage() {
    const tbody = document.getElementById("studentTableBody");
    if (!tbody) return;
    const badge = document.getElementById("currentUserBadgel");
    const currentUser = localStorage.getItem(USER_KEY);
    if (badge && currentUser) {
        badge.textContent = "Signed in: " + currentUser;
    }
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const resetBtn = document.getElementById("resetDataBtn");
    if (searchInput) {
        searchInput.addEventListener("input", renderDashboardTable);
    }
    if (statusFilter) {
        statusFilter.addEventListener("change", renderDashboardTable);
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            saveStudents([...DEFAULT_STUDENTS]);
            if (searchInput) searchInput.value = "";
            if (statusFilter) statusFilter.value = "All" ;
            renderDashboardTable();
        });
    }
    renderDashboardTable();
}
function initDetailsPage() {
    const detailIdEl = document.getElementById("detailId");
    if (!detailIdEl) return;
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id") || "STU-001";
    const students = getStudents();
    const student = students.find((s) => s.id === requestedId) || students[0];
    if (!student) return;
    const badgeClass =
        student.status === "Active"
? "bg - success - subtle text - success"
: "bg - warning - subtle text - warning";
    detailIdEl.textContent = student.id;
    document.getElementById("detailName").textContent = student.name;
    document.getElementById("detailGender").textContent = student.gender;
    document.getElementById("detailMajor").textContent = student.major;
    document.getElementById("detailEmail").textContent = student.email || "-";
    document.getElementById("detailPhone").textContent = student.phone || "-";
    document.getElementById("detailStatus").innerHTML =
'<span class=" badge ' + badgeClass + '">' + escapeHtml(student.status) + "</span >";
    document.getElementById("detailAddress").textContent = student.address || "-";
    const editBtn = document.getElementById("editStudentBtn");
    if (editBtn) {
        editBtn.href = "form.html ? edit =" + encodeURIComponent(student.id);
    }
}
function initFormPage() {
    const form = document.getElementById("studentForm");
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    const students = getStudents();
    const titleEl = document.getElementById("formTitle");
    const originalIdInput = document.getElementById("editingOriginalId");
    const idInput = document.getElementById("studentId");
    const nameInput = document.getElementById("fullName");
    const genderInput = document.getElementById("gender");
    const majorInput = document.getElementById("major");
    const statusInput = document.getElementById("status");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");
    if (editId) {
        const existing = students.find((s) => s.id === editId);
        if (existing) {
            if (titleEl) titleEl.textContent = "Edit Student Form";
            if (originalIdInput) originalIdInput.value = existing.id;
            idInput.value = existing.id;
            nameInput.value = existing.name;
            genderInput.value = existing.gender;
            majorInput.value = existing.major;
            if (statusInput) statusInput.value = existing.status || "Active";
            emailInput.
                value = existing.email || "";
            phoneInput.value = existing.phone || "";
            addressInput.value = existing.address || "";
        }
    }
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const newRecord = {
            id: idInput.value.trim(),
            name: nameInput.value.trim(),
            gender: genderInput.value,
            major: majorInput.value,
            status: statusInput ? statusInput.value : "Active",
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            address: addressInput.value.trim()
        };
        const currentList = getStudents();
        const prevId = originalIdInput ? originalIdInput.value : "";
        if (prevId) {
            const idx = currentList.findIndex((s) => s.id === prevId);
            if (idx !== -1) {
                currentList[idx] = newRecord;
            } else {
                currentList.push(newRecord);
            }
        } else {
            const duplicate = currentList.some((s) => s.id.toLowerCase() === newRecord.id.toLowerCase());
            if (duplicate) {
                alert("Student ID already exists.Please use a unique ID.");
                return;
            }
            currentList.push(newRecord);
        }
        saveStudents(currentList);
        window.location.href = "dashboard.html";
    });
}
document.addEventListener("DOMContentLoaded", function () {
    initLoginPage();
    initDashboardPage();
    initDetailsPage();
    initFormPage();
});