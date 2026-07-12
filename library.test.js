import { jest } from '@jest/globals';

import {
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
    registerBookISBN,
    findBookByISBNFast,
    setBooks,
    setMembers
} from './library.js';

import {
    saveToLocalStorage,
    loadFromLocalStorage,
    exportLibraryData,
    importLibraryData
} from './storage.js';

describe('Book Class', () => {
    test('should create a book instance with correct properties', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author Name', 2020, 5);
        expect(book.isbn).toBe('978-0-123');
        expect(book.title).toBe('Test Book');
        expect(book.author).toBe('Author Name');
        expect(book.year).toBe(2020);
        expect(book.totalCopies).toBe(5);
        expect(book.availableCopies).toBe(5);
        expect(book.checkedOut).toEqual([]);
    });

    test('isAvailable returns true when copies available, false otherwise', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author Name', 2020, 1);
        expect(book.isAvailable()).toBe(true);
        book.checkOut('M1');
        expect(book.isAvailable()).toBe(false);
    });

    test('checkOut method reduces available copies and returns status', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author Name', 2020, 2);
        const success = book.checkOut('M1');
        expect(success).toBe(true);
        expect(book.availableCopies).toBe(1);
        expect(book.checkedOut).toEqual(['M1']);

        book.checkOut('M2');
        const fail = book.checkOut('M3');
        expect(fail).toBe(false);
        expect(book.availableCopies).toBe(0);
    });

    test('getInfo returns formatted template literal string', () => {
        const book = new Book('978-0-123', 'Test Book', 'Author Name', 2020, 5);
        expect(book.getInfo()).toBe('Title: Test Book, Author: Author Name, Year: 2020, Available: 5/5');
    });
});

describe('DigitalBook Class', () => {
    test('should inherit from Book and instantiate with default 0 copies', () => {
        const dBook = new DigitalBook('978-0-999', 'Digital Guide', 'Tech Author', 2021, 15, 'PDF');
        expect(dBook.isbn).toBe('978-0-999');
        expect(dBook.title).toBe('Digital Guide');
        expect(dBook.totalCopies).toBe(0);
        expect(dBook.fileSize).toBe(15);
        expect(dBook.format).toBe('PDF');
        expect(dBook.downloads).toBe(0);
        expect(dBook instanceof Book).toBe(true);
    });

    test('download method increments downloads count and returns message', () => {
        const dBook = new DigitalBook('978-0-999', 'Digital Guide', 'Tech Author', 2021, 15, 'PDF');
        const msg = dBook.download('M1');
        expect(dBook.downloads).toBe(1);
        expect(msg).toBe('M1 downloaded Digital Guide (PDF, 15MB)');
    });

    test('getInfo override includes digital book information', () => {
        const dBook = new DigitalBook('978-0-999', 'Digital Guide', 'Tech Author', 2021, 15, 'PDF');
        expect(dBook.getInfo()).toBe('Title: Digital Guide, Author: Tech Author, Year: 2021, Available: 0/0, Format: PDF, File Size: 15MB');
    });
});

describe('Member and PremiumMember Classes', () => {
    test('Member canBorrow enforces borrowing limit', () => {
        const member = new Member(1, 'John Doe', 'john@example.com', 'standard');
        expect(member.canBorrow()).toBe(true);

        for (let i = 0; i < MAX_BOOKS_PER_MEMBER; i++) {
            member.borrowedBooks.push(`ISBN-${i}`);
        }
        expect(member.canBorrow()).toBe(false);
    });

    test('PremiumMember extends Member and canBorrow allows up to 10 books', () => {
        const pm = new PremiumMember(2, 'Jane Premium', 'jane@example.com');
        expect(pm.membershipType).toBe('premium');
        expect(pm.premiumBenefits).toContain('digital access');
        expect(pm.canBorrow()).toBe(true);

        for (let i = 0; i < 5; i++) {
            pm.borrowedBooks.push(`ISBN-${i}`);
        }
        expect(pm.canBorrow()).toBe(true);

        for (let i = 5; i < 10; i++) {
            pm.borrowedBooks.push(`ISBN-${i}`);
        }
        expect(pm.canBorrow()).toBe(false);
    });

    test('Member getMembershipDuration and getMemberInfo work correctly', () => {
        const member = new Member(1, 'John Doe', 'john@example.com', 'standard');
        expect(member.getMembershipDuration()).toBe(0);

        const info = member.getMemberInfo();
        expect(info).toContain('Name: John Doe');
        expect(info).toContain('Email: john@example.com');
        expect(info).toContain('Type: standard');
    });
});

describe('Library Collections and Functions', () => {
    beforeEach(() => {
        setBooks([
            new Book('978-1', 'JavaScript Book', 'Kyle Simpson', 2015, 3),
            new Book('978-2', 'Clean Code', 'Robert Martin', 2008, 2),
            new Book('978-3', 'Refactoring', 'Martin Fowler', 1999, 1)
        ]);

        setMembers([
            new Member('M1', 'Alice', 'alice@test.com', 'standard'),
            new PremiumMember('M2', 'Bob', 'bob@test.com')
        ]);
    });

    test('findBookByISBN returns book if found, undefined otherwise', () => {
        const book = findBookByISBN('978-2');
        expect(book).toBeDefined();
        expect(book.title).toBe('Clean Code');

        const notFound = findBookByISBN('000-0');
        expect(notFound).toBeUndefined();
    });

    test('findMemberById returns member if found, undefined otherwise', () => {
        const member = findMemberById('M2');
        expect(member).toBeDefined();
        expect(member.name).toBe('Bob');

        const notFound = findMemberById('M99');
        expect(notFound).toBeUndefined();
    });

    test('borrowBook checks out book and updates member borrowedBooks', () => {
        const success = borrowBook('M1', '978-1');
        expect(success).toBe(true);

        const book = findBookByISBN('978-1');
        expect(book.availableCopies).toBe(2);
        expect(book.checkedOut).toContain('M1');

        const member = findMemberById('M1');
        expect(member.borrowedBooks).toContain('978-1');
    });

    test('borrowBook returns false for invalid inputs or unavailable books', () => {
        expect(borrowBook(null, '978-1')).toBe(false);
        expect(borrowBook('M1', null)).toBe(false);
        expect(borrowBook('INVALID_MEMBER', '978-1')).toBe(false);
        expect(borrowBook('M1', 'INVALID_ISBN')).toBe(false);

        borrowBook('M1', '978-3');
        expect(borrowBook('M2', '978-3')).toBe(false);
    });

    test('getBooksByAuthor returns filtered books using array filter', () => {
        const kyleBooks = getBooksByAuthor('Kyle Simpson');
        expect(kyleBooks.length).toBe(1);
        expect(kyleBooks[0].title).toBe('JavaScript Book');

        expect(getBooksByAuthor('Unknown Author').length).toBe(0);
    });

    test('calculateTotalLateFees returns correct total using reduce', () => {
        const record = {
            overdueBooks: [
                { isbn: '978-1', daysLate: 4 },
                { isbn: '978-2', daysLate: 10 }
            ]
        };
        expect(calculateTotalLateFees(record)).toBe(7);
        expect(calculateTotalLateFees(null)).toBe(0);
        expect(calculateTotalLateFees({})).toBe(0);
    });

    test('combineBookCollections merges three arrays using spread operator', () => {
        const coll1 = [{ isbn: '1' }];
        const coll2 = [{ isbn: '2' }];
        const coll3 = [{ isbn: '3' }];
        const combined = combineBookCollections(coll1, coll2, coll3);
        expect(combined).toEqual([...coll1, ...coll2, ...coll3]);
        expect(combineBookCollections(null, [], [])).toEqual([]);
    });

    test('addMultipleBooks adds books using rest parameters', () => {
        const initialCount = books.length;
        const b1 = new Book('978-A', 'Added A', 'Auth', 2020, 2);
        const b2 = new Book('978-B', 'Added B', 'Auth', 2021, 1);

        addMultipleBooks(b1, b2);
        expect(books.length).toBe(initialCount + 2);
        expect(findBookByISBN('978-A')).toBeDefined();
    });

    test('searchBooksByCategory recursively filters by category and handles edge cases', () => {
        const testBooks = [
            { title: 'A', category: 'fiction' },
            { title: 'B', category: 'reference' },
            { title: 'C', category: 'fiction' }
        ];

        const fiction = searchBooksByCategory(testBooks, 'fiction');
        expect(fiction.length).toBe(2);
        expect(fiction[0].title).toBe('A');
        expect(fiction[1].title).toBe('C');

        expect(searchBooksByCategory(null, 'fiction')).toEqual([]);
        expect(searchBooksByCategory([], 123)).toEqual([]);
    });

    test('findOverdueBooks returns records past the specified days threshold', () => {
        const book1 = findBookByISBN('978-1');
        const now = new Date();
        const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        book1.checkedOut.push({
            memberId: 'M1',
            checkoutDate: tenDaysAgo.toISOString(),
            title: book1.title
        });

        expect(findOverdueBooks(5).length).toBe(1);
        expect(findOverdueBooks(5)[0].memberId).toBe('M1');
        expect(findOverdueBooks(15).length).toBe(0);
    });

    test('processReturnQueue logs each item in the queue', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        processReturnQueue(['978-1', '978-2']);
        expect(consoleSpy).toHaveBeenCalledWith('Processing return: 978-1');
        expect(consoleSpy).toHaveBeenCalledWith('Processing return: 978-2');
        consoleSpy.mockRestore();
    });

    test('updateMemberInfo applies partial updates using destructuring', () => {
        const member = new Member('M1', 'Alice', 'alice@test.com', 'standard');
        const updated = updateMemberInfo(member, { name: 'Alice Smith', membershipType: 'premium' });
        expect(updated.name).toBe('Alice Smith');
        expect(updated.membershipType).toBe('premium');
        expect(updated.email).toBe('alice@test.com');

        expect(updateMemberInfo(null, {})).toBeNull();
        expect(updateMemberInfo(member, null)).toBe(member);
    });

    test('registerBookISBN and findBookByISBNFast use Map for O(1) lookup', () => {
        const newBook = new Book('978-FAST', 'Fast Book', 'Speedy', 2026, 1);
        registerBookISBN(newBook);
        expect(findBookByISBNFast('978-FAST')).toBe(newBook);
        expect(findBookByISBNFast('')).toBeNull();
    });
});

describe('LibraryStats Object', () => {
    beforeEach(() => {
        setBooks([
            new Book('978-1', 'JS Guide', 'Kyle', 2015, 3),
            new Book('978-2', 'CSS Style', 'Stylist', 2018, 2)
        ]);
        setMembers([
            new Member('M1', 'Alice', 'alice@test.com', 'standard')
        ]);
        LibraryStats.updateStats();
    });

    test('updateStats reflects current books and members count', () => {
        expect(LibraryStats.totalBooks).toBe(2);
        expect(LibraryStats.totalMembers).toBe(1);
    });

    test('getAverageCheckouts returns Math.round of average checkouts per book', () => {
        books[0].checkedOut.push('M1', 'M2');
        books[1].checkedOut.push('M1');
        expect(LibraryStats.getAverageCheckouts()).toBe(2);
    });

    test('getBorrowingSummary returns formatted list of books with checkouts', () => {
        books[0].checkedOut.push('M1');
        const summary = LibraryStats.getBorrowingSummary();
        expect(summary.length).toBe(1);
        expect(summary[0]).toBe('JS Guide: 1 checkouts');
    });

    test('getStats returns snapshot object using destructuring', () => {
        LibraryStats.totalBorrowings = 5;
        const stats = LibraryStats.getStats();
        expect(stats).toEqual({
            totalBooks: 2,
            totalMembers: 1,
            totalBorrowings: 5
        });
    });

    test('getMostPopularBook uses reduce to find book with most checkouts', () => {
        books[0].checkedOut.push('M1');
        books[1].checkedOut.push('M1', 'M2');
        expect(LibraryStats.getMostPopularBook().isbn).toBe('978-2');

        setBooks([]);
        expect(LibraryStats.getMostPopularBook()).toBeNull();
    });
});

describe('String and Math Operations', () => {
    test('formatBookInfo trims and uppercases author, returns empty string for null', () => {
        const book = new Book('978-1', ' JS Title  ', ' author name ', 2020, 2);
        const info = formatBookInfo(book);
        expect(info).toContain('Title: JS Title');
        expect(info).toContain('Author: AUTHOR NAME');
        expect(info).toContain('Available: 2/2');
        expect(formatBookInfo(null)).toBe('');
    });

    test('calculateFineAmount returns correctly rounded fee, 0 for invalid inputs', () => {
        expect(calculateFineAmount(3)).toBe(1.50);
        expect(calculateFineAmount(0)).toBe(0);
        expect(calculateFineAmount(-5)).toBe(0);
        expect(calculateFineAmount(NaN)).toBe(0);
        expect(calculateFineAmount(undefined)).toBe(0);
    });
});

describe('Storage Operations', () => {
    beforeEach(() => {
        localStorage.clear();
        setBooks([
            new Book('978-1', 'JS Book', 'Kyle', 2015, 3),
            new DigitalBook('978-2', 'Digital Guide', 'Tech', 2021, 15, 'PDF')
        ]);
        setMembers([
            new Member('M1', 'Alice', 'alice@test.com', 'standard'),
            new PremiumMember('M2', 'Bob', 'bob@test.com')
        ]);
    });

    test('saveToLocalStorage and loadFromLocalStorage reconstruct class instances', () => {
        saveToLocalStorage();
        setBooks([]);
        setMembers([]);

        loadFromLocalStorage();
        expect(books.length).toBe(2);
        expect(members.length).toBe(2);
        expect(books[0] instanceof Book).toBe(true);
        expect(books[1] instanceof DigitalBook).toBe(true);
        expect(books[1].isAvailable()).toBe(false);
        expect(books[1].download('M1')).toContain('M1 downloaded Digital Guide');
        expect(members[0] instanceof Member).toBe(true);
        expect(members[1] instanceof PremiumMember).toBe(true);
        expect(members[1].canBorrow()).toBe(true);
    });

    test('exportLibraryData and importLibraryData handle serialization correctly', () => {
        const json = exportLibraryData();
        expect(typeof json).toBe('string');
        expect(json).toContain('JS Book');

        setBooks([]);
        setMembers([]);

        const importSuccess = importLibraryData(json);
        expect(importSuccess).toBe(true);
        expect(books.length).toBe(2);
        expect(books[1] instanceof DigitalBook).toBe(true);
        expect(books[1].fileSize).toBe(15);
        expect(importLibraryData('')).toBe(false);
        expect(importLibraryData('invalid json')).toBe(false);
    });
});

describe('DOM Rendering and Event Handlers', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="catalogue-list"></div>
            <input type="text" id="search">
            <select id="filter-category">
                <option value="all">All</option>
                <option value="fiction">Fiction</option>
            </select>
            <div id="book-details"></div>
            <div id="member-form"></div>
            <div id="borrow-section">
                <form id="borrow-form">
                    <input type="text" id="member-id">
                    <input type="text" id="isbn">
                    <button type="submit">Borrow</button>
                </form>
            </div>
            <p class="total-books">0</p>
            <p class="total-members">0</p>
            <p class="total-borrowings">0</p>
        `;

        setBooks([
            new Book('978-DOM-1', 'UI Design', 'Designer', 2022, 4),
            new Book('978-DOM-2', 'JS DOM', 'Coder', 2023, 2)
        ]);
        books[0].category = 'fiction';
        books[1].category = 'reference';
        setMembers([]);
        saveToLocalStorage();
    });

    test('renderBookCatalogue outputs book cards for each book', async () => {
        const ui = await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const catalogue = document.getElementById('catalogue-list');
        expect(catalogue.children.length).toBe(2);
        expect(catalogue.innerHTML).toContain('UI Design');
        expect(catalogue.innerHTML).toContain('JS DOM');
    });

    test('search input filters book cards by title or author', async () => {
        await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const search = document.getElementById('search');
        search.value = 'Design';
        search.dispatchEvent(new Event('input', { bubbles: true }));

        const catalogue = document.getElementById('catalogue-list');
        expect(catalogue.children.length).toBe(1);
        expect(catalogue.innerHTML).toContain('UI Design');
        expect(catalogue.innerHTML).not.toContain('JS DOM');
    });

    test('filter dropdown filters catalogue by selected category', async () => {
        await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const filter = document.getElementById('filter-category');
        filter.value = 'fiction';
        filter.dispatchEvent(new Event('change', { bubbles: true }));

        const catalogue = document.getElementById('catalogue-list');
        expect(catalogue.children.length).toBe(1);
        expect(catalogue.innerHTML).toContain('UI Design');
        expect(catalogue.innerHTML).not.toContain('JS DOM');
    });

    test('clicking a book card displays its details', async () => {
        await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const catalogue = document.getElementById('catalogue-list');
        const card = catalogue.querySelector('.book-card[data-isbn="978-DOM-1"]');
        card.dispatchEvent(new Event('click', { bubbles: true }));

        const details = document.getElementById('book-details');
        expect(details.innerHTML).toContain('UI Design');
        expect(details.innerHTML).toContain('Designer');
    });

    test('submitting borrow form calls borrowBook and shows success alert', async () => {
        await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        const alice = new Member('M-DOM-1', 'Alice DOM', 'alice@dom.com', 'standard');
        setMembers([alice]);
        saveToLocalStorage();

        document.getElementById('member-id').value = 'M-DOM-1';
        document.getElementById('isbn').value = '978-DOM-1';
        document.getElementById('borrow-form').dispatchEvent(new Event('submit', { bubbles: true }));

        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully borrowed'));
        alertSpy.mockRestore();
    });

    test('createMemberForm renders form and adds new member on submit', async () => {
        const ui = await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        ui.createMemberForm();

        const form = document.getElementById('member-form').querySelector('#new-member-form');
        expect(form).not.toBeNull();

        document.getElementById('member-name').value = 'Charlie DOM';
        document.getElementById('member-email').value = 'charlie@dom.com';
        document.getElementById('membership-type').value = 'premium';

        const initialLength = members.length;
        form.dispatchEvent(new Event('submit', { bubbles: true }));

        expect(members.length).toBe(initialLength + 1);
        expect(members[members.length - 1].name).toBe('Charlie DOM');
        expect(members[members.length - 1].membershipType).toBe('premium');
    });

    test('createBookForm renders form with all required fields', async () => {
        document.body.innerHTML += `<div id="add-book-section"></div>`;
        const ui = await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        ui.createBookForm();

        const form = document.getElementById('add-book-form');
        expect(form).not.toBeNull();
        expect(document.getElementById('new-isbn')).not.toBeNull();
        expect(document.getElementById('new-title')).not.toBeNull();
        expect(document.getElementById('new-author')).not.toBeNull();
    });

    test('tab navigation shows and hides correct sections on click', async () => {
        document.body.innerHTML += `
            <button id="catalogue-tab">Catalogue</button>
            <button id="members-tab">Members</button>
            <button id="statistics-tab">Statistics</button>
            <div id="catalogue-section"></div>
            <div id="borrow-section"></div>
            <div id="add-book-section"></div>
            <div id="member-section"></div>
            <div id="statistics-section"></div>
        `;
        await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        document.getElementById('members-tab').click();
        expect(document.getElementById('member-section').style.display).toBe('block');

        document.getElementById('catalogue-tab').click();
        expect(document.getElementById('catalogue-section').style.display).toBe('block');
    });

    test('handleAddBookSubmit adds a book via the add book form', async () => {
        document.body.innerHTML += `<div id="add-book-section"></div>`;
        const ui = await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        ui.createBookForm();

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

        document.getElementById('new-isbn').value = '978-NEW-1';
        document.getElementById('new-title').value = 'New Book';
        document.getElementById('new-author').value = 'New Author';
        document.getElementById('new-year').value = '2023';
        document.getElementById('new-copies').value = '3';

        document.getElementById('add-book-form').dispatchEvent(new Event('submit', { bubbles: true }));

        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('New Book'));
        expect(findBookByISBN('978-NEW-1')).toBeDefined();
        alertSpy.mockRestore();
    });

    test('updateStatisticsDisplay updates DOM elements with current counts', async () => {
        setBooks([
            new Book('978-1', 'Test Book', 'Author', 2020, 3),
            new Book('978-2', 'Test Book 2', 'Author', 2021, 2)
        ]);
        setMembers([
            new Member('M1', 'Alice', 'alice@test.com', 'standard')
        ]);
        saveToLocalStorage();

        await import('./ui.js');
        document.dispatchEvent(new Event('DOMContentLoaded'));

        const totalBooksEl = document.querySelector('.total-books');
        const totalMembersEl = document.querySelector('.total-members');

        expect(totalBooksEl.textContent).toBe('2');
        expect(totalMembersEl.textContent).toBe('1');
    });
});