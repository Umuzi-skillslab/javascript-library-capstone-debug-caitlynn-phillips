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

// Function missing JSON operations
function exportLibraryData() {
    // Should convert to JSON
    // Missing: error handling
    
    var data = {
        books: books,
        members: members
    };
    
    // Missing: JSON.stringify
    return data;
}

// Function missing JSON parsing
function importLibraryData(jsonString) {
    // Missing: try-catch for JSON.parse
    // Missing: validation of parsed data
    
    var data = JSON.parse(jsonString);
    
    books = data.books;
    members = data.members;
}

// LocalStorage functions with errors
function saveToLocalStorage() {
    // Missing: error handling for localStorage
    // Missing: JSON.stringify
    
    localStorage.setItem("libraryBooks", books);
    localStorage.setItem("libraryMembers", members);
}

function loadFromLocalStorage() {
    // Missing: null check
    // Missing: JSON.parse
    // Missing: error handling
    
    var booksData = localStorage.getItem("libraryBooks");
    var membersData = localStorage.getItem("libraryMembers");
    
    books = booksData;
    members = membersData;
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
