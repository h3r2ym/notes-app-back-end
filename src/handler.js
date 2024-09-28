const { nanoid } = require('nanoid');
const books = require('./books');

const messageResponse = (
  h,
  { status = 'success', message, code = 200, data }
) => {
  const response = h.response({
    status,
    message,
    data,
  });

  response.code(code);

  return response;
};

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    publisher,
    pageCount,
    readPage,
    reading,
    summary,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage ? true : false;

  if (name === undefined) {
    return messageResponse(h, {
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
      code: 400,
    });
  }

  if (readPage > pageCount) {
    return messageResponse(h, {
      status: 'fail',
      message:
        'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      code: 400,
    });
  }

  const book = {
    id,
    name,
    year,
    author,
    publisher,
    pageCount,
    readPage,
    reading,
    summary,
    finished,
    insertedAt,
    updatedAt,
  };

  books.push(book);

  const isSuccess = books.filter((note) => note.id === id).length > 0;

  if (isSuccess) {
    return messageResponse(h, {
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
      code: 201,
    });
  }

  return messageResponse(h, {
    status: 'fail',
    message: 'Gagal menambahkan buku',
    code: 500,
  });
};

const getAllBooksHandler = (request, h) => {
  const { reading, finished, name } = request.query;

  const filterBooks = books
    .filter(
      (r) =>
        (reading !== undefined && r.reading == reading) ||
        (finished !== undefined && r.finished == finished) ||
        (name !== undefined &&
          r.name.toLowerCase().includes(name.toLowerCase()))
    )
    .map((r) => ({
      id: r.id,
      name: r.name,
      publisher: r.publisher,
    }));

  return messageResponse(h, {
    data: {
      books: filterBooks.length
        ? filterBooks
        : books.map(({ id, name, publisher }) => ({ id, name, publisher })),
    },
  });
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  return messageResponse(h, {
    status: 'fail',
    message: 'Buku tidak ditemukan',
    code: 404,
  });
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name,
    year,
    author,
    publisher,
    pageCount,
    readPage,
    reading,
    summary,
  } = request.payload;
  const updatedAt = new Date().toISOString();
  const finished = pageCount === readPage ? true : false;

  if (name === undefined || name === '') {
    return messageResponse(h, {
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
      code: 400,
    });
  }

  if (readPage > pageCount) {
    return messageResponse(h, {
      status: 'fail',
      message:
        'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      code: 400,
    });
  }

  const index = books.findIndex((r) => r.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      publisher,
      pageCount,
      readPage,
      reading,
      summary,
      finished,
      updatedAt,
    };

    return {
      status: 'success',
      message: 'Buku berhasil diperbarui',
    };
  }

  return messageResponse(h, {
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
    code: 404,
  });
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((r) => r.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    return messageResponse(h, {
      message: 'Buku berhasil dihapus',
    });
  }

  return messageResponse(h, {
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
    code: 404,
  });
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
