// Library Management System - Starter Code with Complex Errors

// Global state management (scoping issues)
let books = [];
let members = [];
const LATE_FEE_PER_DAY = 0.50;
const MAX_BOOKS_PER_MEMBER = 5;

// Book class with multiple issues
class Book {
    constructor(isbn, title, author, year, copies) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.year = year;
        this.totalCopies = copies;
        this.availableCopies = copies;
        this.checkedOut = [];
    }
    
     isAvailable() {
        return this.availableCopies > 0;
    }
    getInfo() {
        return `Title: ${this.title}, Author: ${this.author}, Year: ${this.year}, Available: ${this.availableCopies}/${this.totalCopies}`;
    }

        checkOut(memberId) {
        if (this.availableCopies <= 0) {
            return false;
        }
        this.checkedOut.push(memberId);
        this.availableCopies--;
        return true;
    }
}

// Digital book class with inheritance problems
class DigitalBook extends Book {
    constructor(isbn, title, author, year, fileSize, format) {
        super(isbn, title, author, year, 0);
        this.fileSize = fileSize;
        this.format = format;
        this.downloads = 0;
    }
    
    download(memberId) {
        this.downloads++;
        return `${memberId} downloaded ${this.title} (${this.format}, ${this.fileSize}MB)`;
    }

    getInfo() {
        return `${super.getInfo()}, Format: ${this.format}, File Size: ${this.fileSize}MB`;
    }
}

// Member class with errors
class Member {
    constructor(id, name, email, membershipType) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.membershipType = membershipType;
        this.borrowedBooks = [];
        this.joinDate = new Date();
    }
    
    getMembershipDuration() {
        const now = new Date();
        const diffTime = Math.abs(now - this.joinDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

     getMemberInfo() {
        const { name, email, membershipType, joinDate } = this;
        return `Name: ${name}, Email: ${email}, Type: ${membershipType}, Joined: ${joinDate.toDateString()}`;
    }
    
    canBorrow() {
        if (this.borrowedBooks.length === MAX_BOOKS_PER_MEMBER) {
            return false;
        }
        return true;
    }
}

// Premium member with inheritance issues
class PremiumMember extends Member {
    constructor(id, name, email) {
        super(id, name, email, "premium");
        this.premiumBenefits = ["priority reservations", "extended loans", "digital access"];
        this.maxBooks = 10;
    }

  canBorrow() {
        if (this.borrowedBooks.length === this.maxBooks) {
            return false;
        }
        return true;
    }

    getBenefits() {
        return `Premium benefits: ${this.premiumBenefits.join(", ")}`;
    }
}

// Complex function with nested loops and errors
function findOverdueBooks(daysOverdue) {
    // Validate input
    if (typeof daysOverdue !== "number" || daysOverdue < 0) {
        return [];
    }

    const overdue = [];
    const now = new Date();

    for (const book of books) {
        for (const record of book.checkedOut) {
            if (typeof record === "object" && record !== null) {
                const checkoutDate = new Date(record.checkoutDate);
                const diffTime = Math.abs(now - checkoutDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > daysOverdue) {
                    overdue.push(record);
                }
            }
        }
    }

    return overdue;
}

// Function with while loop error
function processReturnQueue(queue) {
    if (!Array.isArray(queue) || queue.length === 0) {
        return;
    }

    for (const item of queue) {
        console.log(`Processing return: ${item}`);
    }
}

// Recursive function with multiple errors
function searchBooksByCategory(bookList, category, index = 0) {
    // Null/undefined checks
    if (!Array.isArray(bookList) || typeof category !== "string") {
        return [];
    }

    // Base case - stops recursion
    if (index >= bookList.length) {
        return [];
    }

    const currentBook = bookList[index];

    if (currentBook.category === category) {
        return [currentBook].concat(searchBooksByCategory(bookList, category, index + 1));
    }

    return searchBooksByCategory(bookList, category, index + 1);
}
// Function missing array methods
function getBooksByAuthor(authorName) {
    if (typeof authorName !== "string" || authorName.trim() === "") {
        return [];
    }

    return books.filter(function(book) {
        return book.author === authorName;
    });
}

// Function that should use reduce
function calculateTotalLateFees(memberRecord) {
    if (typeof memberRecord !== "object" || memberRecord === null) {
        return 0;
    }

    if (!Array.isArray(memberRecord.overdueBooks) || memberRecord.overdueBooks.length === 0) {
        return 0;
    }

    return memberRecord.overdueBooks.reduce(function(total, book) {
        return total + book.daysLate * LATE_FEE_PER_DAY;
    }, 0);
}

// Function missing spread operator
function combineBookCollections(fiction, nonFiction, reference) {
    if (!Array.isArray(fiction) || !Array.isArray(nonFiction) || !Array.isArray(reference)) {
        return [];
    }

    return [...fiction, ...nonFiction, ...reference];
}

// Function missing rest parameters
function addMultipleBooks(book1, book2, book3) {
    // Should use rest parameters to accept unlimited books
    books.push(book1);
    books.push(book2);
    books.push(book3);
}

// Function missing destructuring
function updateMemberInfo(member, updates) {
    // Should destructure updates object
    member.name = updates.name;
    member.email = updates.email;
    member.membershipType = updates.membershipType;
    
    return member;
}

// Function with no error handling
function borrowBook(memberId, isbn) {
    // Missing: try-catch block
    // Missing: validation for undefined/null
    // Missing: typeof checks
    
    var member = findMemberById(memberId);
    var book = findBookByISBN(isbn);
    
    // No check if member or book exists
    if (member.canBorrow()) {
        book.checkOut(memberId);
        member.borrowedBooks.push(isbn);
        return true;
    }
    
    return false;
}

// Helper functions with errors
function findMemberById(id) {
    // Should use find method
    for (var i = 0; i < members.length; i++) {
        if (members[i].id = id) {  // Wrong operator
            return members[i];
        }
    }
    // Returns undefined implicitly - should handle explicitly
}

function findBookByISBN(isbn) {
    var i = 0;
    
    // Wrong loop choice
    while (i < books.length) {
        if (books[i].isbn === isbn) {
            return books[i];
        }
        i = i + 1;
    }
    
    return null;
}

// Statistics object with missing methods
var LibraryStats = {
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,
    
    // Missing: method using Math object for calculations
    // Missing: method using for-of loop
    // Missing: method returning object with destructuring
    
    updateStats: function() {
        this.totalBooks = books.length;
        this.totalMembers = members.length;
    },
    
    getMostPopularBook: function() {
        // Inefficient implementation - should use reduce
        var maxCheckouts = 0;
        var popularBook = null;
        
        for (var i = 0; i < books.length; i++) {
            if (books[i].checkedOut.length > maxCheckouts) {
                maxCheckouts = books[i].checkedOut.length;
                popularBook = books[i];
            }
        }
        
        return popularBook;
    }
};

// Function with string manipulation errors
function formatBookInfo(book) {
    // Should use template literals
    var info = "Title: " + book.title + "\n";
    info = info + "Author: " + book.author + "\n";
    info = info + "Year: " + book.year;
    
    // Missing: proper string methods (trim, toUpperCase, etc.)
    
    return info;
}

// Function with number/type issues
function calculateFineAmount(daysLate) {
    // Missing: typeof check
    // Missing: NaN handling
    // Missing: null/undefined check
    
    var fine = daysLate * LATE_FEE_PER_DAY;
    
    // Should use toFixed for currency
    return fine;
}

// Missing: module exports
// Missing: proper data structure for ISBN lookups (Map/Set)
