// Library Management System - Core Logic
let books = [];
let members = [];

const LATE_FEE_PER_DAY = 0.50;
const MAX_BOOKS_PER_MEMBER = 5;

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

class DigitalBook extends Book {
    constructor(isbn, title, author, year, fileSize, format) {
        // Digital books have no physical copies
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

class PremiumMember extends Member {
    constructor(id, name, email) {
        super(id, name, email, "premium");
        this.premiumBenefits = ["priority reservations", "extended loans", "digital access"];
        this.maxBooks = 10;
    }

    // Premium members can borrow up to 10 books
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

function findOverdueBooks(daysOverdue) {
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

function processReturnQueue(queue) {
    if (!Array.isArray(queue) || queue.length === 0) {
        return;
    }
    for (const item of queue) {
        console.log(`Processing return: ${item}`);
    }
}

// Recursive function with base case to prevent stack overflow
function searchBooksByCategory(bookList, category, index = 0) {
    if (!Array.isArray(bookList) || typeof category !== "string") {
        return [];
    }

    if (index >= bookList.length) {
        return [];
    }

    const currentBook = bookList[index];

    if (currentBook.category === category) {
        return [currentBook].concat(searchBooksByCategory(bookList, category, index + 1));
    }

    return searchBooksByCategory(bookList, category, index + 1);
}

// Uses Array.filter to find all books by a specific author
function getBooksByAuthor(authorName) {
    if (typeof authorName !== "string" || authorName.trim() === "") {
        return [];
    }
    return books.filter(function (book) {
        return book.author === authorName;
    });
}

// Uses Array.reduce to sum late fees across all overdue books
function calculateTotalLateFees(memberRecord) {
    if (typeof memberRecord !== "object" || memberRecord === null) {
        return 0;
    }
    if (!Array.isArray(memberRecord.overdueBooks) || memberRecord.overdueBooks.length === 0) {
        return 0;
    }
    return memberRecord.overdueBooks.reduce(function (total, book) {
        return total + book.daysLate * LATE_FEE_PER_DAY;
    }, 0);
}

// Uses spread operator to merge three collections into one array
function combineBookCollections(fiction, nonFiction, reference) {
    if (!Array.isArray(fiction) || !Array.isArray(nonFiction) || !Array.isArray(reference)) {
        return [];
    }
    return [...fiction, ...nonFiction, ...reference];
}

// Uses rest parameters to accept any number of Book instances
function addMultipleBooks(...newBooks) {
    if (newBooks.length === 0) {
        return;
    }
    for (const book of newBooks) {
        if (book instanceof Book) {
            books.push(book);
        }
    }
}

// Uses object destructuring to apply partial updates to a member
function updateMemberInfo(member, updates) {
    if (typeof member !== "object" || member === null) {
        return null;
    }
    if (typeof updates !== "object" || updates === null) {
        return member;
    }
    const { name, email, membershipType } = updates;
    if (name !== undefined) member.name = name;
    if (email !== undefined) member.email = email;
    if (membershipType !== undefined) member.membershipType = membershipType;
    return member;
}

function borrowBook(memberId, isbn) {
    if (typeof memberId === "undefined" || memberId === null) {
        return false;
    }
    if (typeof isbn === "undefined" || isbn === null) {
        return false;
    }

    try {
        const member = findMemberById(memberId);
        const book = findBookByISBN(isbn);

        if (member === null || member === undefined) {
            throw new Error(`Member with ID ${memberId} not found`);
        }
        if (book === null || book === undefined) {
            throw new Error(`Book with ISBN ${isbn} not found`);
        }
        if (member.canBorrow() && book.isAvailable()) {
            book.checkOut(memberId);
            member.borrowedBooks.push(isbn);
            LibraryStats.totalBorrowings++;
            return true;
        }
        return false;
    } catch (error) {
        console.error(`borrowBook error: ${error.message}`);
        return false;
    }
}

function findMemberById(id) {
    if (typeof id === "undefined" || id === null) {
        return null;
    }
    return members.find(function (member) {
        return String(member.id) === String(id);
    });
}

function findBookByISBN(isbn) {
    if (typeof isbn === "undefined" || isbn === null) {
        return null;
    }
    return books.find(function (book) {
        return book.isbn === isbn;
    });
}

const LibraryStats = {
    totalBooks: 0,
    totalMembers: 0,
    totalBorrowings: 0,

    updateStats: function () {
        this.totalBooks = books.length;
        this.totalMembers = members.length;
    },

    getAverageCheckouts: function () {
        if (books.length === 0) {
            return 0;
        }
        const total = books.reduce(function (sum, book) {
            return sum + book.checkedOut.length;
        }, 0);
        return Math.round(total / books.length);
    },

    getBorrowingSummary: function () {
        return books
            .filter(book => book.checkedOut.length > 0)
            .map(book => `${book.title}: ${book.checkedOut.length} checkouts`);
    },

    getStats: function () {
        const { totalBooks, totalMembers, totalBorrowings } = this;
        return { totalBooks, totalMembers, totalBorrowings };
    },

    getMostPopularBook: function () {
        if (books.length === 0) {
            return null;
        }
        return books.reduce(function (mostPopular, book) {
            return book.checkedOut.length > mostPopular.checkedOut.length ? book : mostPopular;
        }, books[0]);
    },

    hasAvailableBooks: function () {
        return books.some(book => book.isAvailable());
    }
};

function formatBookInfo(book) {
    if (typeof book !== "object" || book === null) {
        return "";
    }
    return `Title: ${book.title.trim()}\nAuthor: ${book.author.trim().toUpperCase()}\nYear: ${book.year}\nAvailable: ${book.availableCopies}/${book.totalCopies}`;
}

function calculateFineAmount(daysLate) {
    if (typeof daysLate !== "number" || isNaN(daysLate) || daysLate < 0) {
        return 0;
    }
    const fine = daysLate * LATE_FEE_PER_DAY;
    return parseFloat(fine.toFixed(2));
}

// Map provides O(1) average-case lookup by ISBN
const isbnLookup = new Map();

function registerBookISBN(book) {
    if (book instanceof Book) {
        isbnLookup.set(book.isbn, book);
    }
}

function findBookByISBNFast(isbn) {
    if (typeof isbn !== "string" || isbn === "") {
        return null;
    }
    return isbnLookup.get(isbn) || null;
}

function getBookTitles() {
    return books.map(book => book.title);
}

function addBook(isbn, title, author, year, totalCopies, category) {
    if (typeof isbn !== "string" || isbn.trim() === "") {
        throw new Error("Invalid ISBN");
    }
    if (typeof title !== "string" || title.trim() === "") {
        throw new Error("Invalid title");
    }
    if (typeof author !== "string" || author.trim() === "") {
        throw new Error("Invalid author");
    }
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
        throw new Error("Invalid year");
    }
    const copies = parseInt(totalCopies, 10);
    if (isNaN(copies) || copies < 1) {
        throw new Error("Invalid number of copies");
    }
    if (findBookByISBN(isbn.trim())) {
        throw new Error(`A book with ISBN ${isbn.trim()} already exists`);
    }
    const newBook = new Book(isbn.trim(), title.trim(), author.trim(), parseInt(year, 10), copies);
    if (category && typeof category === "string" && category.trim() !== "") {
        newBook.category = category.trim();
    }
    books.push(newBook);
    registerBookISBN(newBook);
    LibraryStats.updateStats();
    return newBook;
}

function setBooks(newBooks) {
    books.length = 0;
    books.push(...newBooks);
    isbnLookup.clear();
    for (const book of books) {
        registerBookISBN(book);
    }
}

function setMembers(newMembers) {
    members.length = 0;
    members.push(...newMembers);
}

// Loads 12 sample books on first visit when localStorage is empty
function loadSampleData() {
    if (books.length === 0) {
        const sampleBooks = [
            new Book('978-0-061-96436-9', 'To Kill a Mockingbird', 'Harper Lee', 1960, 3),
            new Book('978-0-743-27356-5', 'The Great Gatsby', 'F. Scott Fitzgerald', 1925, 2),
            new Book('978-0-385-33348-1', 'Clean Code', 'Robert Martin', 2008, 4),
            new Book('978-1-491-95038-9', "You Don't Know JS", 'Kyle Simpson', 2015, 3),
            new Book('978-0-201-63361-0', 'The Pragmatic Programmer', 'David Thomas', 1999, 2),
            new Book('978-0-547-92822-7', 'The Hobbit', 'J.R.R. Tolkien', 1937, 4),
            new Book('978-0-06-112008-4', 'To Kill a Mockingbird', 'Harper Lee', 1960, 2),
            new Book('978-0-7432-7356-5', 'The Da Vinci Code', 'Dan Brown', 2003, 3),
            new Book('978-0-14-028329-7', 'The Name of the Rose', 'Umberto Eco', 1980, 2),
            new Book('978-0-7432-1733-8', 'Sapiens', 'Yuval Noah Harari', 2011, 4),
            new Book('978-0-14-303943-3', 'A Brief History of Time', 'Stephen Hawking', 1988, 3),
            new Book('978-0-618-57494-1', 'The Lord of the Rings', 'J.R.R. Tolkien', 1954, 5)
        ];

        sampleBooks[0].category = 'fiction';
        sampleBooks[1].category = 'fiction';
        sampleBooks[2].category = 'reference';
        sampleBooks[3].category = 'non-fiction';
        sampleBooks[4].category = 'reference';
        sampleBooks[5].category = 'fantasy';
        sampleBooks[6].category = 'fiction';
        sampleBooks[7].category = 'mystery';
        sampleBooks[8].category = 'mystery';
        sampleBooks[9].category = 'history';
        sampleBooks[10].category = 'history';
        sampleBooks[11].category = 'fantasy';

        sampleBooks.forEach(book => books.push(book));
    }
}

export {
    Book,
    DigitalBook,
    Member,
    PremiumMember,
    books,
    members,
    LATE_FEE_PER_DAY,
    MAX_BOOKS_PER_MEMBER,
    findOverdueBooks,
    processReturnQueue,
    searchBooksByCategory,
    getBooksByAuthor,
    calculateTotalLateFees,
    combineBookCollections,
    addMultipleBooks,
    updateMemberInfo,
    borrowBook,
    findMemberById,
    findBookByISBN,
    LibraryStats,
    formatBookInfo,
    calculateFineAmount,
    isbnLookup,
    registerBookISBN,
    findBookByISBNFast,
    getBookTitles,
    setBooks,
    setMembers,
    addBook,
    loadSampleData
};