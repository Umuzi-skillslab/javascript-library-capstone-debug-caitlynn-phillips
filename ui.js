let catalogueContainer;
let searchInput;
let filterDropdown;

function initializeUI() {
    catalogueContainer = document.querySelector("#catalogue-list");
    searchInput = document.getElementById("search");
    filterDropdown = document.querySelector("#filter-category");

    if (!catalogueContainer || !searchInput || !filterDropdown) {
        console.error("Required DOM elements not found");
        return;
    }

    setupEventListeners();
    loadCatalogue();
}

document.addEventListener("DOMContentLoaded", initializeUI);

function setupEventListeners() {
    searchInput.addEventListener("input", handleSearch);
    filterDropdown.addEventListener("change", handleFilterChange);

    const borrowForm = document.getElementById("borrow-form");
    if (borrowForm) {
        borrowForm.addEventListener("submit", handleBorrowSubmit);
    }

    // Event delegation handles clicks on dynamically rendered book cards
    if (catalogueContainer) {
        catalogueContainer.addEventListener("click", function(event) {
            const bookCard = event.target.closest(".book-card");
            if (bookCard) {
                const isbn = bookCard.dataset.isbn;
                displayBookDetails(isbn);
            }
        });
    }
}

function renderBookCatalogue(bookList) {
    if (!Array.isArray(bookList)) {
        return;
    }

    // Clear container before re-rendering to avoid duplicates
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

function handleBookClick(event) {
    const bookCard = event.target.closest(".book-card");
    
    if (!bookCard) {
        return;
    }

    const isbn = bookCard.dataset.isbn;

    if (!isbn) {
        console.error("No ISBN found on book card");
        return;
    }

    displayBookDetails(isbn);
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();

    const results = books.filter(function(book) {
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

    const filtered = books.filter(function(book) {
        return book.category === selectedCategory;
    });

    renderBookCatalogue(filtered);
}

function exportLibraryData() {
    try {
        const data = { books, members };
        return JSON.stringify(data, null, 2);
    } catch (error) {
        console.error(`exportLibraryData error: ${error.message}`);
        return null;
    }
}

function importLibraryData(jsonString) {
    try {
        if (typeof jsonString !== "string" || jsonString.trim() === "") {
            return false;
        }

        const data = JSON.parse(jsonString);

        if (!Array.isArray(data.books) || !Array.isArray(data.members)) {
            return false;
        }

        books = data.books;
        members = data.members;
        return true;
    } catch (error) {
        console.error(`importLibraryData error: ${error.message}`);
        return false;
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem("libraryBooks", JSON.stringify(books));
        localStorage.setItem("libraryMembers", JSON.stringify(members));
    } catch (error) {
        console.error(`saveToLocalStorage error: ${error.message}`);
    }
}

function loadFromLocalStorage() {
    try {
        const booksData = localStorage.getItem("libraryBooks");
        const membersData = localStorage.getItem("libraryMembers");

        books = booksData ? JSON.parse(booksData) : [];
        members = membersData ? JSON.parse(membersData) : [];
    } catch (error) {
        console.error(`loadFromLocalStorage error: ${error.message}`);
        books = [];
        members = [];
    }
}

// Display function with template issues
function displayBookDetails(isbn) {
    var book = findBookByISBN(isbn);
    
    // Missing: null check
    
    var detailsContainer = document.getElementById("book-details");
    
    // Should use template literals
    var html = "<div class='book-details'>";
    html = html + "<h2>" + book.title + "</h2>";
    html = html + "<p><strong>Author:</strong> " + book.author + "</p>";
    html = html + "<p><strong>ISBN:</strong> " + book.isbn + "</p>";
    html = html + "<p><strong>Year:</strong> " + book.year + "</p>";
    html = html + "</div>";
    
    detailsContainer.innerHTML = html;
}

// Statistics display with errors
function updateStatisticsDisplay() {
    // Wrong selector methods
    var totalBooksEl = document.querySelector(".total-books");
    var totalMembersEl = document.querySelector(".total-members");
    
    // Missing: null checks
    // Should use textContent instead of innerHTML for text
    
    totalBooksEl.innerHTML = books.length;
    totalMembersEl.innerHTML = members.length;
    
    // Missing: update other statistics
}

// Dynamic form generation with errors
function createMemberForm() {
    var formContainer = document.getElementById("member-form");
    
    // Inefficient DOM manipulation
    var form = document.createElement("form");
    
    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "name";
    // Missing: label, placeholder, required attribute
    
    var emailInput = document.createElement("input");
    emailInput.type = "text";  // Should be "email"
    emailInput.id = "email";
    
    // Missing: other form fields
    
    form.appendChild(nameInput);
    form.appendChild(emailInput);
    
    formContainer.appendChild(form);
}

// Initialize on wrong event
initializeUI();  // Wrong: should wait for DOMContentLoaded
