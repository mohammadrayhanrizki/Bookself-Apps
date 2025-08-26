document.addEventListener("DOMContentLoaded", function () {
  const books = [];
  const RENDER_EVENT = "render-books";
  const STORAGE_KEY = "BOOKSHELF_APPS";
  const DARK_MODE_KEY = "DARK_MODE_ENABLED";

  // --- Selektor DOM ---
  const inputBookForm = document.getElementById("inputBookForm");
  const searchBookTitle = document.getElementById("searchBookTitle");
  const sortOption = document.getElementById("sortOption"); // <-- BARU
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  const completeBookshelfList = document.getElementById("completeBookshelfList");
  const editBookForm = document.getElementById("editBookForm");
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");
  const darkModeToggle = document.getElementById("floatingDarkModeToggle");
  const body = document.body;

  // ===================================================================
  // FUNGSI-FUNGSI APLIKASI
  // ===================================================================

  function saveData() {
    if (typeof Storage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    }
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
      data.forEach((book) => books.push(book));
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  function findBook(bookId) {
    return books.find((book) => book.id === bookId) || null;
  }

  function findBookIndex(bookId) {
    return books.findIndex((book) => book.id === bookId);
  }

  function openModal(modalId) {
    document.getElementById(modalId).classList.add("show");
  }

  function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("show");
  }

  function animateAndMoveBook(bookId, isCompleteStatus) {
    const bookElement = document.getElementById(`book-${bookId}`);
    if (bookElement) {
      bookElement.classList.add("fade-out");
      setTimeout(() => {
        const book = findBook(bookId);
        if (book) {
          book.isComplete = isCompleteStatus;
          saveData();
          document.dispatchEvent(new Event(RENDER_EVENT));
        }
      }, 400);
    }
  }

  function enableDarkMode() {
    body.classList.add("dark-mode");
    darkModeToggle.innerText = "☀️";
    localStorage.setItem(DARK_MODE_KEY, "true");
  }

  function disableDarkMode() {
    body.classList.remove("dark-mode");
    darkModeToggle.innerText = "🌙";
    localStorage.setItem(DARK_MODE_KEY, "false");
  }

  function makeBookElement(bookObject) {
    const bookItem = document.createElement("article");
    bookItem.classList.add("book-item");
    bookItem.setAttribute("id", `book-${bookObject.id}`);
    bookItem.setAttribute("draggable", true);

    bookItem.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", bookObject.id);
      setTimeout(() => {
        bookItem.classList.add("dragging");
      }, 0);
    });

    bookItem.addEventListener("dragend", () => {
      bookItem.classList.remove("dragging");
    });

    const textContainer = document.createElement("div");
    const bookTitle = document.createElement("h3");
    bookTitle.innerText = bookObject.title;
    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = `Penulis: ${bookObject.author}`;
    const bookYear = document.createElement("p");
    bookYear.innerText = `Tahun: ${bookObject.year}`;
    textContainer.append(bookTitle, bookAuthor, bookYear);

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit";
    editButton.addEventListener("click", () => {
      document.getElementById("editBookId").value = bookObject.id;
      document.getElementById("editBookTitle").value = bookObject.title;
      document.getElementById("editBookAuthor").value = bookObject.author;
      document.getElementById("editBookYear").value = bookObject.year;
      openModal("editBookModal");
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("red");
    deleteButton.innerText = "Hapus";
    deleteButton.addEventListener("click", () => {
      confirmDeleteButton.dataset.bookId = bookObject.id;
      openModal("confirmDeleteModal");
    });

    if (bookObject.isComplete) {
      const undoButton = document.createElement("button");
      undoButton.classList.add("yellow");
      undoButton.innerText = "Baca Ulang";
      undoButton.addEventListener("click", () => {
        animateAndMoveBook(bookObject.id, false);
      });
      actionContainer.append(undoButton, editButton, deleteButton);
    } else {
      const completeButton = document.createElement("button");
      completeButton.classList.add("green");
      completeButton.innerText = "Selesai";
      completeButton.addEventListener("click", () => {
        animateAndMoveBook(bookObject.id, true);
      });
      actionContainer.append(completeButton, editButton, deleteButton);
    }

    bookItem.append(textContainer, actionContainer);
    return bookItem;
  }

  // ===================================================================
  // EVENT LISTENERS
  // ===================================================================

  inputBookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const newBook = {
      id: +new Date(),
      title: document.getElementById("inputBookTitle").value,
      author: document.getElementById("inputBookAuthor").value,
      year: Number(document.getElementById("inputBookYear").value),
      isComplete: document.getElementById("inputBookIsComplete").checked,
    };
    books.push(newBook);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
    inputBookForm.reset();
  });

  searchBookTitle.addEventListener("input", () => {
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  // **EVENT LISTENER BARU UNTUK SORTING**
  sortOption.addEventListener("change", () => {
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  editBookForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const bookId = document.getElementById("editBookId").value;
    const book = findBook(Number(bookId));
    if (book) {
      book.title = document.getElementById("editBookTitle").value;
      book.author = document.getElementById("editBookAuthor").value;
      book.year = Number(document.getElementById("editBookYear").value);
      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
    closeModal("editBookModal");
  });

  confirmDeleteButton.addEventListener("click", () => {
    const bookId = Number(confirmDeleteButton.dataset.bookId);
    const bookElement = document.getElementById(`book-${bookId}`);
    if (bookElement) {
      bookElement.classList.add("fade-out");
      setTimeout(() => {
        const bookIndex = findBookIndex(bookId);
        if (bookIndex !== -1) {
          books.splice(bookIndex, 1);
          saveData();
          document.dispatchEvent(new Event(RENDER_EVENT));
        }
      }, 400);
    }
    closeModal("confirmDeleteModal");
  });

  [incompleteBookshelfList, completeBookshelfList].forEach((shelf) => {
    shelf.addEventListener("dragover", (event) => {
      event.preventDefault();
      shelf.classList.add("drag-over");
    });

    shelf.addEventListener("dragleave", () => {
      shelf.classList.remove("drag-over");
    });

    shelf.addEventListener("drop", (event) => {
      event.preventDefault();
      shelf.classList.remove("drag-over");
      const bookId = Number(event.dataTransfer.getData("text/plain"));
      const book = findBook(bookId);

      if (book) {
        const isDroppedOnCompletedShelf = shelf.id === "completeBookshelfList";
        if (book.isComplete !== isDroppedOnCompletedShelf) {
          book.isComplete = isDroppedOnCompletedShelf;
          saveData();
          document.dispatchEvent(new Event(RENDER_EVENT));
        }
      }
    });
  });

  darkModeToggle.addEventListener("click", () => {
    body.classList.contains("dark-mode") ? disableDarkMode() : enableDarkMode();
  });

  document.querySelectorAll("[data-modal-close]").forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(button.dataset.modalClose);
    });
  });

  // **RENDER EVENT DIPERBARUI DENGAN LOGIKA SORTING**
  document.addEventListener(RENDER_EVENT, () => {
    const currentSortOption = sortOption.value;

    // Langkah 1: Lakukan sorting pada array 'books'
    if (currentSortOption === "title-asc") {
      books.sort((a, b) => a.title.localeCompare(b.title));
    } else if (currentSortOption === "title-desc") {
      books.sort((a, b) => b.title.localeCompare(a.title));
    } else if (currentSortOption === "year-desc") {
      books.sort((a, b) => b.year - a.year);
    } else if (currentSortOption === "year-asc") {
      books.sort((a, b) => a.year - b.year);
    }

    // Langkah 2: Lanjutkan ke filtering dan rendering
    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";
    const query = searchBookTitle.value.toLowerCase();
    const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(query));

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
        bookElement.classList.add("show");
      }, 10);
    }

    document.getElementById("incompleteBookCount").innerText = `(${incompleteCount})`;
    document.getElementById("completeBookCount").innerText = `(${completeCount})`;
  });

  // ===================================================================
  // INISIALISASI
  // ===================================================================

  if (localStorage.getItem(DARK_MODE_KEY) === "true") {
    enableDarkMode();
  }
  loadDataFromStorage();
});
