document.addEventListener('DOMContentLoaded', function () {
    const books = [];
    const RENDER_EVENT = 'render-books';
    const STORAGE_KEY = 'BOOKSHELF_APPS';

    // --- Selektor DOM ---
    const inputBookForm = document.getElementById('inputBookForm');
    const searchBookForm = document.getElementById('searchBookForm');
    const searchBookTitle = document.getElementById('searchBookTitle');
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');
    
    // --- Selektor Modal ---
    const editModal = document.getElementById('editBookModal');
    const editBookForm = document.getElementById('editBookForm');
    const confirmModal = document.getElementById('confirmDeleteModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');

    // --- Fungsi Penyimpanan ---
    function isStorageExist() {
        return typeof(Storage) !== 'undefined';
    }

    function saveData() {
        if (isStorageExist()) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        }
    }

    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);
        if (data !== null) {
            data.forEach(book => books.push(book));
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    // --- Fungsi Bantuan ---
    function findBook(bookId) {
        return books.find(book => book.id === bookId) || null;
    }

    function findBookIndex(bookId) {
        return books.findIndex(book => book.id === bookId);
    }

    // --- Fungsi Modal ---
    function openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    document.querySelectorAll('[data-modal-close]').forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.dataset.modalClose);
        });
    });

    // --- Logika Inti Aplikasi ---
    function animateAndMoveBook(bookId, isCompleteStatus) {
        const bookElement = document.getElementById(`book-${bookId}`);
        if (bookElement) {
            bookElement.classList.add('fade-out');
            setTimeout(() => {
                const book = findBook(bookId);
                if (book) {
                    book.isComplete = isCompleteStatus;
                    document.dispatchEvent(new Event(RENDER_EVENT));
                    saveData();
                }
            }, 400);
        }
    }

    function makeBookElement(bookObject) {
        const bookItem = document.createElement('article');
        bookItem.classList.add('book-item');
        bookItem.setAttribute('id', `book-${bookObject.id}`);

        const textContainer = document.createElement('div');
        const bookTitle = document.createElement('h3');
        bookTitle.innerText = bookObject.title;
        const bookAuthor = document.createElement('p');
        bookAuthor.innerText = `Penulis: ${bookObject.author}`;
        const bookYear = document.createElement('p');
        bookYear.innerText = `Tahun: ${bookObject.year}`;
        textContainer.append(bookTitle, bookAuthor, bookYear);

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action');

        const editButton = document.createElement('button');
        editButton.classList.add('blue');
        editButton.innerText = 'Edit';
        editButton.addEventListener('click', () => {
            document.getElementById('editBookId').value = bookObject.id;
            document.getElementById('editBookTitle').value = bookObject.title;
            document.getElementById('editBookAuthor').value = bookObject.author;
            document.getElementById('editBookYear').value = bookObject.year;
            openModal('editBookModal');
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText = 'Hapus';
        deleteButton.addEventListener('click', () => {
            confirmDeleteButton.dataset.bookId = bookObject.id;
            openModal('confirmDeleteModal');
        });

        if (bookObject.isComplete) {
            const undoButton = document.createElement('button');
            undoButton.classList.add('yellow');
            undoButton.innerText = 'Baca Ulang';
            undoButton.addEventListener('click', () => {
                animateAndMoveBook(bookObject.id, false);
            });
            actionContainer.append(undoButton, editButton, deleteButton);
        } else {
            const completeButton = document.createElement('button');
            completeButton.classList.add('green');
            completeButton.innerText = 'Selesai';
            completeButton.addEventListener('click', () => {
                animateAndMoveBook(bookObject.id, true);
            });
            actionContainer.append(completeButton, editButton, deleteButton);
        }

        bookItem.append(textContainer, actionContainer);
        return bookItem;
    }

    // --- Event Listeners Utama ---
    inputBookForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newBook = {
            id: +new Date(),
            title: document.getElementById('inputBookTitle').value,
            author: document.getElementById('inputBookAuthor').value,
            year: Number(document.getElementById('inputBookYear').value),
            isComplete: document.getElementById('inputBookIsComplete').checked
        };
        books.push(newBook);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        inputBookForm.reset();
    });

    searchBookForm.addEventListener('submit', (event) => event.preventDefault());
    searchBookTitle.addEventListener('input', () => {
        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    editBookForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const bookId = document.getElementById('editBookId').value;
        const book = findBook(Number(bookId));
        if (book) {
            book.title = document.getElementById('editBookTitle').value;
            book.author = document.getElementById('editBookAuthor').value;
            book.year = Number(document.getElementById('editBookYear').value);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
        closeModal('editBookModal');
    });

    confirmDeleteButton.addEventListener('click', () => {
        const bookId = Number(confirmDeleteButton.dataset.bookId);
        const bookElement = document.getElementById(`book-${bookId}`);

        if (bookElement) {
            bookElement.classList.add('fade-out');
            setTimeout(() => {
                const bookIndex = findBookIndex(bookId);
                if (bookIndex !== -1) {
                    books.splice(bookIndex, 1);
                    document.dispatchEvent(new Event(RENDER_EVENT));
                    saveData();
                }
            }, 400);
        }
        closeModal('confirmDeleteModal');
    });

    // --- Render Event ---
    document.addEventListener(RENDER_EVENT, () => {
        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';
        const query = searchBookTitle.value.toLowerCase();
        const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));

        let incompleteCount = 0;
        let completeCount = 0;

        for (const bookItem of filteredBooks) {
            const bookElement = makeBookElement(bookItem);
            if (!bookItem.isComplete) {
                incompleteBookshelfList.append(bookElement);
                incompleteCount++;
            } else {
                completeBookshelfList.append(bookElement);
                completeCount++;
            }
            
            setTimeout(() => {
                bookElement.classList.add('show');
            }, 10);
        }
        
        document.getElementById('incompleteBookCount').innerText = `(${incompleteCount})`;
        document.getElementById('completeBookCount').innerText = `(${completeCount})`;
    });

// script.js

    // --- Logika Dark Mode ---
    const darkModeToggles = document.querySelectorAll('.dark-mode-toggle'); // Pilih SEMUA tombol
    const body = document.body;
    const DARK_MODE_KEY = 'DARK_MODE_ENABLED';

    function setDarkModeIcon(isDarkMode) {
        darkModeToggles.forEach(toggle => {
            toggle.innerText = isDarkMode ? '☀️' : '🌙';
        });
    }

    function enableDarkMode() {
        body.classList.add('dark-mode');
        setDarkModeIcon(true);
        localStorage.setItem(DARK_MODE_KEY, 'true');
    }

    function disableDarkMode() {
        body.classList.remove('dark-mode');
        setDarkModeIcon(false);
        localStorage.setItem(DARK_MODE_KEY, 'false');
    }

    if (localStorage.getItem(DARK_MODE_KEY) === 'true') {
        enableDarkMode();
    }

    // Tambahkan event listener ke setiap tombol
    darkModeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    });

    // --- Inisialisasi ---
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});