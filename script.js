document.addEventListener('DOMContentLoaded', function () {
    const books = []; // Array untuk menyimpan semua objek buku
    const RENDER_EVENT = 'render-books'; // Nama custom event

    const inputBookForm = document.getElementById('inputBookForm');
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');

    const STORAGE_KEY = 'BOOKSHELF_APPS';

    // --- FUNGSI-FUNGSI INTI ---

    // Fungsi untuk mengecek apakah browser mendukung Web Storage
    function isStorageExist() {
        if (typeof (Storage) === 'undefined') {
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }

    // Fungsi untuk menyimpan data ke localStorage
    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            console.log('Data berhasil disimpan ke localStorage.');
        }
    }

    // Fungsi untuk memuat data dari localStorage
    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if (data !== null) {
            for (const book of data) {
                books.push(book);
            }
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
    
    // Fungsi untuk mencari buku berdasarkan ID
    function findBook(bookId) {
        for (const bookItem of books) {
            if (bookItem.id === bookId) {
                return bookItem;
            }
        }
        return null;
    }

    // Fungsi untuk membuat elemen HTML buku
    function makeBookElement(bookObject) {
        const bookItem = document.createElement('article');
        bookItem.classList.add('book-item');
        bookItem.setAttribute('id', `book-${bookObject.id}`);

        const textContainer = document.createElement('div');
        textContainer.classList.add('book-info');

        const bookTitle = document.createElement('h3');
        bookTitle.innerText = bookObject.title;

        const bookAuthor = document.createElement('p');
        bookAuthor.innerText = `Penulis: ${bookObject.author}`;

        const bookYear = document.createElement('p');
        bookYear.innerText = `Tahun: ${bookObject.year}`;

        textContainer.append(bookTitle, bookAuthor, bookYear);

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action');

        if (bookObject.isComplete) {
            const undoButton = document.createElement('button');
            undoButton.classList.add('yellow');
            undoButton.innerText = 'Baca Ulang';
            undoButton.addEventListener('click', function () {
                undoBookFromCompleted(bookObject.id);
            });

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('red');
            deleteButton.innerText = 'Hapus Buku';
            deleteButton.addEventListener('click', function () {
                removeBook(bookObject.id);
            });

            actionContainer.append(undoButton, deleteButton);
        } else {
            const completeButton = document.createElement('button');
            completeButton.classList.add('green');
            completeButton.innerText = 'Selesai Dibaca';
            completeButton.addEventListener('click', function () {
                addBookToCompleted(bookObject.id);
            });

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('red');
            deleteButton.innerText = 'Hapus Buku';
            deleteButton.addEventListener('click', function () {
                removeBook(bookObject.id);
            });

            actionContainer.append(completeButton, deleteButton);
        }

        bookItem.append(textContainer, actionContainer);
        return bookItem;
    }

    // --- FUNGSI AKSI PADA BUKU ---

    function addBookToCompleted(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) return;
        
        bookTarget.isComplete = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function undoBookFromCompleted(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) return;
        
        bookTarget.isComplete = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
    
    function removeBook(bookId) {
        const bookTargetIndex = books.findIndex(book => book.id === bookId);
        if (bookTargetIndex === -1) return;
    
        if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
            books.splice(bookTargetIndex, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
        }
    }


    // --- EVENT LISTENER ---

    // Event listener untuk form submit (Menambah buku baru)
    inputBookForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const title = document.getElementById('inputBookTitle').value;
        const author = document.getElementById('inputBookAuthor').value;
        const year = document.getElementById('inputBookYear').value;
        const isComplete = document.getElementById('inputBookIsComplete').checked;

        const generatedID = +new Date();
        const bookObject = {
            id: generatedID,
            title,
            author,
            year: Number(year),
            isComplete
        };

        books.push(bookObject);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        inputBookForm.reset();
    });

    // Custom event listener untuk me-render ulang tampilan
    document.addEventListener(RENDER_EVENT, function () {
        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        for (const bookItem of books) {
            const bookElement = makeBookElement(bookItem);
            if (!bookItem.isComplete) {
                incompleteBookshelfList.append(bookElement);
            } else {
                completeBookshelfList.append(bookElement);
            }
        }
    });
  

    // Memuat data saat halaman pertama kali dibuka
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});