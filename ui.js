import {
    Book,
    Member,
    borrowBook,
    findBookByISBN,
    LibraryStats,
    books,
    members,
    addBook,
    loadSampleData
} from './library.js';

import {
    saveToLocalStorage,
    loadFromLocalStorage
} from './storage.js';

let catalogueContainer;
let searchInput;
let filterDropdown;

function loadCatalogue() {
    loadFromLocalStorage();
    loadSampleData();
    renderBookCatalogue(books);
    renderMemberList();
    updateStatisticsDisplay();
}

function initializeUI() {
    catalogueContainer = document.querySelector("#catalogue-list");
    searchInput = document.getElementById("search");
    filterDropdown = document.querySelector("#filter-category");

    if (!catalogueContainer || !searchInput || !filterDropdown) {
        console.error("Required DOM elements not found");
        return;
    }

    setupTabNavigation();
    setupEventListeners();
    loadCatalogue();
    createBookForm();
    createMemberForm();
}

document.addEventListener("DOMContentLoaded", initializeUI);

function setupTabNavigation() {
    const catalogueTab = document.getElementById("catalogue-tab");
    const membersTab = document.getElementById("members-tab");
    const statisticsTab = document.getElementById("statistics-tab");

    const catalogueSection = document.getElementById("catalogue-section");
    const borrowSection = document.getElementById("borrow-section");
    const addBookSection = document.getElementById("add-book-section");
    const memberSection = document.getElementById("member-section");
    const statisticsSection = document.getElementById("statistics-section");

    function clearTabs() {
        [catalogueTab, membersTab, statisticsTab].forEach(tab => {
            if (tab) tab.classList.remove("active");
        });
        [catalogueSection, borrowSection, addBookSection, memberSection, statisticsSection].forEach(sec => {
            if (sec) sec.style.display = "none";
        });
    }

    if (catalogueTab) {
        catalogueTab.addEventListener("click", () => {
            clearTabs();
            catalogueTab.classList.add("active");
            if (catalogueSection) catalogueSection.style.display = "block";
            if (borrowSection) borrowSection.style.display = "block";
            if (addBookSection) addBookSection.style.display = "block";
        });
        catalogueTab.classList.add("active");
    }

    if (membersTab) {
        membersTab.addEventListener("click", () => {
            clearTabs();
            membersTab.classList.add("active");
            if (memberSection) memberSection.style.display = "block";
        });
    }

    if (statisticsTab) {
        statisticsTab.addEventListener("click", () => {
            clearTabs();
            statisticsTab.classList.add("active");
            if (statisticsSection) {
                statisticsSection.style.display = "block";
                LibraryStats.updateStats();
                updateStatisticsDisplay();
            }
        });
    }

    if (catalogueSection) catalogueSection.style.display = "block";
    if (borrowSection) borrowSection.style.display = "block";
    if (addBookSection) addBookSection.style.display = "block";
    if (memberSection) memberSection.style.display = "none";
    if (statisticsSection) statisticsSection.style.display = "none";
}

function setupEventListeners() {
    searchInput.addEventListener("input", handleSearch);
    filterDropdown.addEventListener("change", handleFilterChange);

    const borrowForm = document.getElementById("borrow-form");
    if (borrowForm) {
        borrowForm.addEventListener("submit", handleBorrowSubmit);
    }

    // Event delegation for dynamically rendered book cards
    if (catalogueContainer) {
        catalogueContainer.addEventListener("click", function (event) {
            const bookCard = event.target.closest(".book-card");
            if (bookCard) {
                const isbn = bookCard.dataset.isbn;
                displayBookDetails(isbn);
            }
        });
    }

    // Event delegation for dynamically rendered member cards
    const memberList = document.getElementById("member-list");
    if (memberList) {
        memberList.addEventListener("click", function (event) {
            const memberCard = event.target.closest(".member-card");
            if (memberCard) {
                const memberId = memberCard.dataset.memberId;
                displayMemberDetails(memberId);
            }
        });
    }
}

function renderBookCatalogue(bookList) {
    if (!Array.isArray(bookList)) {
        return;
    }

    catalogueContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();

    for (const book of bookList) {
        const bookCard = document.createElement("div");
        bookCard.className = "book-card";
        bookCard.dataset.isbn = book.isbn;

        bookCard.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Year: ${book.year}</p>
            <p>Available: ${book.availableCopies}/${book.totalCopies}</p>
        `;

        fragment.appendChild(bookCard);
    }

    catalogueContainer.appendChild(fragment);
}

function handleBorrowSubmit(event) {
    event.preventDefault();

    const memberIdInput = document.getElementById("member-id");
    const isbnInput = document.getElementById("isbn");

    if (!memberIdInput || !isbnInput) {
        console.error("Form inputs not found");
        return;
    }

    const memberId = memberIdInput.value.trim();
    const isbn = isbnInput.value.trim();

    if (memberId === "" || isbn === "") {
        alert("Please fill in all fields");
        return;
    }

    try {
        const success = borrowBook(memberId, isbn);
        if (success) {
            alert(`Successfully borrowed book with ISBN: ${isbn}`);
            memberIdInput.value = "";
            isbnInput.value = "";
            renderBookCatalogue(books);
        } else {
            alert("Unable to borrow book. Please check availability and borrowing limit.");
        }
    } catch (error) {
        console.error(`handleBorrowSubmit error: ${error.message}`);
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();

    const results = books.filter(function (book) {
        return book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm);
    });

    renderBookCatalogue(results);
}

function handleFilterChange() {
    const selectedCategory = filterDropdown.value;

    if (selectedCategory === "all" || selectedCategory === "") {
        renderBookCatalogue(books);
        return;
    }

    const filtered = books.filter(function (book) {
        return book.category === selectedCategory;
    });

    renderBookCatalogue(filtered);
}

function displayBookDetails(isbn) {
    if (typeof isbn !== "string" || isbn.trim() === "") {
        return;
    }

    const book = findBookByISBN(isbn);

    if (book === null || book === undefined) {
        console.error(`Book with ISBN ${isbn} not found`);
        return;
    }

    const detailsContainer = document.getElementById("book-details");

    if (!detailsContainer) {
        console.error("Book details container not found");
        return;
    }

    detailsContainer.innerHTML = `
        <div class="book-details">
            <h2>${book.title}</h2>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Year:</strong> ${book.year}</p>
            <p><strong>Available:</strong> ${book.availableCopies}/${book.totalCopies}</p>
        </div>
    `;
}

function displayMemberDetails(memberId) {
    if (typeof memberId === "undefined" || memberId === null) {
        return;
    }
    const member = members.find(m => String(m.id) === String(memberId));
    if (!member) return;
    console.log(`Member: ${member.getMemberInfo()}`);
}

function updateStatisticsDisplay() {
    const totalBooksEl = document.querySelector(".total-books");
    const totalMembersEl = document.querySelector(".total-members");
    const totalBorrowingsEl = document.querySelector(".total-borrowings");

    if (totalBooksEl) totalBooksEl.textContent = books.length;
    if (totalMembersEl) totalMembersEl.textContent = members.length;
    if (totalBorrowingsEl) totalBorrowingsEl.textContent = LibraryStats.totalBorrowings;
}

function renderMemberList() {
    const memberList = document.getElementById("member-list");
    if (!memberList) return;

    memberList.innerHTML = "";
    for (const member of members) {
        const card = document.createElement("div");
        card.className = "member-card";
        card.dataset.memberId = member.id;
        card.innerHTML = `
            <h4>${member.name}</h4>
            <p>ID: ${member.id}</p>
            <p>Email: ${member.email}</p>
            <p>Borrowed: ${member.borrowedBooks.length} books</p>
            <span class="badge ${member.membershipType}">${member.membershipType}</span>
        `;
        memberList.appendChild(card);
    }
}

function createMemberForm() {
    const formContainer = document.getElementById("member-form");

    if (!formContainer) {
        console.error("Member form container not found");
        return;
    }

    if (formContainer.querySelector("#new-member-form")) return;

    const form = document.createElement("form");
    form.id = "new-member-form";

    form.innerHTML = `
        <div class="form-group">
            <label for="member-name">Name</label>
            <input type="text" id="member-name" placeholder="Enter full name" required>
        </div>
        <div class="form-group">
            <label for="member-email">Email</label>
            <input type="email" id="member-email" placeholder="Enter email address" required>
        </div>
        <div class="form-group">
            <label for="membership-type">Membership Type</label>
            <select id="membership-type">
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
            </select>
        </div>
        <button type="submit">Add Member</button>
    `;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("member-name").value.trim();
        const email = document.getElementById("member-email").value.trim();
        const membershipType = document.getElementById("membership-type").value;

        if (name && email) {
            const newMember = new Member(members.length + 1, name, email, membershipType);
            members.push(newMember);
            saveToLocalStorage();
            updateStatisticsDisplay();
            renderMemberList();
            alert(`Member added! Your Member ID is: ${newMember.id}`);
            form.reset();
        }
    });

    formContainer.appendChild(form);
}

function handleAddBookSubmit(event) {
    event.preventDefault();

    const isbn = document.getElementById("new-isbn")?.value.trim();
    const title = document.getElementById("new-title")?.value.trim();
    const author = document.getElementById("new-author")?.value.trim();
    const year = document.getElementById("new-year")?.value.trim();
    const copies = document.getElementById("new-copies")?.value.trim();
    const category = document.getElementById("new-category")?.value;

    if (!isbn || !title || !author || !year || !copies) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const book = addBook(isbn, title, author, Number(year), Number(copies), category);
        saveToLocalStorage();
        renderBookCatalogue(books);
        updateStatisticsDisplay();
        event.target.reset();
        alert(`"${book.title}" has been added to the catalogue.`);
    } catch (error) {
        alert(`Could not add book: ${error.message}`);
    }
}

function createBookForm() {
    const container = document.getElementById("add-book-section");
    if (!container) return;

    if (container.querySelector("#add-book-form")) return;

    const form = document.createElement("form");
    form.id = "add-book-form";

    form.innerHTML = `
        <div class="form-group">
            <label for="new-isbn">ISBN *</label>
            <input type="text" id="new-isbn" placeholder="e.g. 978-0-061-96436-9" required>
        </div>
        <div class="form-group">
            <label for="new-title">Title *</label>
            <input type="text" id="new-title" placeholder="Book title" required>
        </div>
        <div class="form-group">
            <label for="new-author">Author *</label>
            <input type="text" id="new-author" placeholder="Author name" required>
        </div>
        <div class="form-group">
            <label for="new-year">Year *</label>
            <input type="number" id="new-year" placeholder="e.g. 2023" min="1000" max="${new Date().getFullYear()}" required>
        </div>
        <div class="form-group">
            <label for="new-copies">Copies *</label>
            <input type="number" id="new-copies" placeholder="Number of copies" min="1" required>
        </div>
        <div class="form-group">
            <label for="new-category">Category</label>
            <select id="new-category">
                <option value="">-- Select Category --</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="reference">Reference</option>
            </select>
        </div>
        <button type="submit">Add Book</button>
    `;

    form.addEventListener("submit", handleAddBookSubmit);
    container.appendChild(form);
}

export {
    createMemberForm,
    createBookForm
};