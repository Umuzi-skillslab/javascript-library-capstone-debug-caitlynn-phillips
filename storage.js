import {
    books,
    members,
    setBooks,
    setMembers,
    Book,
    DigitalBook,
    Member,
    PremiumMember
} from './library.js';

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

        if (!data || !Array.isArray(data.books) || !Array.isArray(data.members)) {
            return false;
        }

        // Reconstruct Book / DigitalBook / Member / PremiumMember instances
        const reconstructedBooks = data.books.map(b => {
            if (b.fileSize !== undefined || b.format !== undefined) {
                const db = new DigitalBook(b.isbn, b.title, b.author, b.year, b.fileSize, b.format);
                db.totalCopies = b.totalCopies;
                db.availableCopies = b.availableCopies;
                db.checkedOut = b.checkedOut || [];
                db.downloads = b.downloads || 0;
                if (b.category) db.category = b.category;
                return db;
            } else {
                const book = new Book(b.isbn, b.title, b.author, b.year, b.totalCopies);
                book.availableCopies = b.availableCopies;
                book.checkedOut = b.checkedOut || [];
                if (b.category) book.category = b.category;
                return book;
            }
        });

        const reconstructedMembers = data.members.map(m => {
            if (m.membershipType === "premium") {
                const pm = new PremiumMember(m.id, m.name, m.email);
                pm.borrowedBooks = m.borrowedBooks || [];
                pm.joinDate = new Date(m.joinDate);
                return pm;
            } else {
                const member = new Member(m.id, m.name, m.email, m.membershipType);
                member.borrowedBooks = m.borrowedBooks || [];
                member.joinDate = new Date(m.joinDate);
                return member;
            }
        });

        setBooks(reconstructedBooks);
        setMembers(reconstructedMembers);
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

        if (booksData) {
            const parsedBooks = JSON.parse(booksData);
            const reconstructedBooks = parsedBooks.map(b => {
                if (b.fileSize !== undefined || b.format !== undefined) {
                    const db = new DigitalBook(b.isbn, b.title, b.author, b.year, b.fileSize, b.format);
                    db.totalCopies = b.totalCopies;
                    db.availableCopies = b.availableCopies;
                    db.checkedOut = b.checkedOut || [];
                    db.downloads = b.downloads || 0;
                    if (b.category) db.category = b.category;
                    return db;
                } else {
                    const book = new Book(b.isbn, b.title, b.author, b.year, b.totalCopies);
                    book.availableCopies = b.availableCopies;
                    book.checkedOut = b.checkedOut || [];
                    if (b.category) book.category = b.category;
                    return book;
                }
            });
            setBooks(reconstructedBooks);
        } else {
            setBooks([]);
        }

        if (membersData) {
            const parsedMembers = JSON.parse(membersData);
            const reconstructedMembers = parsedMembers.map(m => {
                if (m.membershipType === "premium") {
                    const pm = new PremiumMember(m.id, m.name, m.email);
                    pm.borrowedBooks = m.borrowedBooks || [];
                    pm.joinDate = new Date(m.joinDate);
                    return pm;
                } else {
                    const member = new Member(m.id, m.name, m.email, m.membershipType);
                    member.borrowedBooks = m.borrowedBooks || [];
                    member.joinDate = new Date(m.joinDate);
                    return member;
                }
            });
            setMembers(reconstructedMembers);
        } else {
            setMembers([]);
        }
    } catch (error) {
        console.error(`loadFromLocalStorage error: ${error.message}`);
        setBooks([]);
        setMembers([]);
    }
}

export {
    exportLibraryData,
    importLibraryData,
    saveToLocalStorage,
    loadFromLocalStorage
};