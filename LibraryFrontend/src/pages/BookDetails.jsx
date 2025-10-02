import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import BookTable from "../components/TableBooksHistory";
import BorrowBook from "../components/ModalBorrowBook";
import AddBook from "../components/ModalAddBook";
import StarRating from "../components/StarRating";
import "../styles/pages/BookDetails.css"
import { BookMarked, ChevronRight, SquarePen, Trash2, Undo2 } from "lucide-react";


function BookDetails() {
  const { id } = useParams();
  const location = useLocation();
  const from = location.state?.from;
  const backLink = from ? `${from.pathname}${from.search}` : "/books";

  const [book, setBook] = useState(null);
  const [borrowedRecords, setBorrowedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isBorrowBookModalOpen, setIsBorrowBookModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  const [authorBooks, setAuthorBooks] = useState([]);
  const [seriesBooks, setSeriesBooks] = useState([]);


  // Fetch book details using id
  const fetchBook = async (id) => {
    try {
      const res = await axios.get(`https://localhost:7244/api/books/${id}`);
      setBook(res.data);
    } catch (err) {
      console.error("Error fetching book:", err);
      setError("Failed to load book details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch borrowed records for this book
  const fetchBorrowedByBook = async (bookId) => {
    try {
      const res = await axios.get(
        `https://localhost:7244/api/borrowed/book/${bookId}`
      );
      setBorrowedRecords(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setBorrowedRecords([]); // no borrowed records
      } else {
        console.error("Error fetching borrowed records:", err);
      }
    }
  };


  const fetchAuthorBooks = useCallback(async (author, currentBookId) => {
  if (!author) return;
  try {
    const firstAuthor = author.split(",")[0];
    const response = await axios.get("https://localhost:7244/api/books/paged", {
      params: {
        page: 1,
        pageSize: 20,
        search: firstAuthor,
        tags: null,
      },
    });

    let books = response.data.books
      .filter((b) => b.bookId !== currentBookId)
      .filter((b) => b.authors && b.authors.includes(firstAuthor));

    // shuffle array
    for (let i = books.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [books[i], books[j]] = [books[j], books[i]];
    }

    setAuthorBooks(books.slice(0, 5));
  } catch (err) {
    console.error("Error fetching author books:", err);
  }
}, []);

const fetchSeriesBooks = useCallback(async (series, currentBookId) => {
  if (!series) return;
  try {
    const seriesName = series.split("#")[0].trim();
    const response = await axios.get("https://localhost:7244/api/books/paged", {
      params: {
        page: 1,
        pageSize: 6,
        search: seriesName,
        tags: null,
      },
    });

    setSeriesBooks(
      response.data.books
        .filter((b) => b.bookId !== currentBookId)
        .filter((b) => b.series && b.series.includes(seriesName))
        .slice(0,5)
    );
  } catch (err) {
    console.error("Error fetching series books:", err);
  }
}, []);

  useEffect(() => {
    if (!id) return;

    fetchBook(id);
    fetchBorrowedByBook(id);
  }, [id, isBorrowBookModalOpen, isAddBookModalOpen])


useEffect(() => {
  if (!book) return;

  fetchAuthorBooks(book.authors, book.bookId);

  if (book.series) {
    fetchSeriesBooks(book.series, book.bookId);
  }
}, [book, fetchAuthorBooks, fetchSeriesBooks]);

  const currentBorrows = borrowedRecords.filter(r => r.returnedDate === null);
  const borrowHistory = borrowedRecords.filter(r => r.returnedDate !== null);

  const addLateStatus = (records, isHistory) =>
    records.map(r => {
      const today = new Date();
      const due = r.due ? new Date(r.due) : null;
      const returned = r.returnedDate ? new Date(r.returnedDate) : null;

      let isLate = false;
      if (isHistory) {
        if (due && returned && returned > due) isLate = true;
      } else {
        if (due && today > due) isLate = true;
      }

      return { ...r, isLate };
  });

  const currentWithLate = addLateStatus(currentBorrows, false);
  const historyWithLate = addLateStatus(borrowHistory, true);

  const handleMemberSelect = async (memberId, copies = 1) => {
    if (!book) return;

    try {
      await axios.post("https://localhost:7244/api/borrowed/borrow", {
        bookId: book.bookId,
        memberId,
        copies,
      });

      setIsBorrowBookModalOpen(false);
    } catch (err) {
      console.error("Error borrowing book:", err);
    }
  };

  


  
  const handleDelete = async (bookId) => {
    try {
      const updatedBook = {
      ...book,
      booksCount: 0,
      availableCopies: 0,
    };

    // PUT to backend
    await axios.put(
      `https://localhost:7244/api/books/${book.bookId}`,
      updatedBook
    );
      setBook(updatedBook);
      alert(`Book ${book.title} deleted`);
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  }

  if (loading) return <p>Loading book details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!book) return <p>No book found.</p>;

  return (
    <div className="book-detail">
      <Link to={backLink} >
        <Undo2 className="btn-back"/>
      </Link>

      <div className="book-detail-header">
        <div className="book-cover-wrapper">
          <img src={book.imageUrl} alt={book.title} className="book-detail-cover" />
        </div>

        <div className="book-info-wrapper">
          <div>
            <h2 className="book-title">{book.title} {book.series && `(${book.series})`}</h2>
            <p className="book-byline">by {book.authors}</p>
            <div className="rating-row">
              <StarRating rating={book.averageRating} />
              <span className="rating-text">{book.averageRating.toFixed(2)} ({book.ratingsCount} votes)</span>
            </div>
          </div>
          <div className="book-actions">
            <button className="btn secondary" onClick={() => setIsAddBookModalOpen(true)}><SquarePen />Edit Book</button>
            <div className="btn-sec-div">
            <button title="Borrow Book" className="btn ternary" onClick={() => setIsBorrowBookModalOpen(true)}><BookMarked /></button>
            <button title="Delete Book" className="btn ternary" onClick={handleDelete}><Trash2 /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="book-detail-card">
        <div className="book-detail-left">
          <p><strong>Description</strong> </p> 
            <p>{book.description}</p>
          {book.tags && (
            <>
              <p><strong>Tags</strong> </p> 
              <div className="pill-container">
                {book.tags.map((tag) => (
                  <Link 
                    to={`/books?page=1&tags=${encodeURIComponent(tag)}`} 
                    style={{ color: "inherit", textDecoration: "none" }}
                    key={tag} 
                    className="pill"
                  > {tag}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="book-detail-right">
          <div className="detail-group">
            <p className="detail-label"><strong>Publication Date</strong></p>
            <p className="detail-value">{new Date(book.firstPublishDate).toLocaleDateString()}</p>
          </div>
          
          <div className="detail-group">
            <p className="detail-label"><strong>Pages</strong></p>
            <p className="detail-value">{book.pages}</p>
          </div>
          
          <div className="detail-group">
            <p className="detail-label"><strong>ISBN</strong></p>
            <p className="detail-value">{book.isbn}</p>
          </div>
          
          <div className="detail-group">
            <p className="detail-label"><strong>Available Copies</strong></p>
            <p className="detail-value">{book.availableCopies}</p>
          </div>
        </div>

      </div>


      <div className="related-sections">
        {/* Other works by this author */}
        <div className="related-section">
          <div className="related-header">
            <h3>Other works by this author</h3>
            <Link 
              to={`/books?page=1&search=${encodeURIComponent(book.authors.split(",")[0])}`} 
              className="chevron-link">
                <ChevronRight style={{margin: 0}}/>
            </Link>
          </div>
          {authorBooks.length === 0 ? (
            <p style={{marginTop: 0}}>No other books by this author.</p>
          ) : (
            <div className="related-books">
              {authorBooks.map((b) => (
                <Link key={b.bookId} to={`/book/${b.bookId}`} className="related-book">
                  <img
                    src={b.imageUrl || "/images/placeholderImage.jpeg"}
                    alt={b.title}
                    className="related-book-cover"
                  />
                  <p className="related-book-title">
                    {b.title.length > 25 ? b.title.slice(0, 25) + "…" : b.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Other works in this series */}
        {book.series && (
          <div className="related-section">
            <div className="related-header">
              <h3>Other works in this series</h3>
              <Link 
                to={`/books?page=1&search=${encodeURIComponent(book.series.split("#")[0])}`} 
                className="chevron-link">
                  <ChevronRight style={{margin: 0}}/>
              </Link>
            </div>
            {seriesBooks.length === 0 ? (
              <p>No other books found in this series.</p>
            ) : (
              <div className="related-books">
                {seriesBooks.map((b) => (
                  <Link key={b.bookId} to={`/book/${b.bookId}`} className="related-book">
                    <img
                      src={b.imageUrl || "/images/placeholderImage.jpeg"}
                      alt={b.title}
                      className="related-book-cover"
                    />
                    <p className="related-book-title">
                      {b.title.length > 25 ? b.title.slice(0, 25) + "…" : b.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        
      </div>


      <div className="borrow-sections">
        {book.booksCount !== 0 && <>
          <h3>Current Borrows</h3>
            {currentWithLate.length === 0 ? (
              <p>No active borrows.</p>
            ) : (
              <BookTable data={currentWithLate} />
            )}
        </>}

        <h3>Borrow History</h3>
        {historyWithLate.length === 0 ? (
          <p>No borrow history.</p>
        ) : (
          <BookTable data={historyWithLate} />
        )}
      </div>

      {isBorrowBookModalOpen && 
        <BorrowBook
          isOpen={isBorrowBookModalOpen}
          onClose={() => {
            setIsBorrowBookModalOpen(false);
          }}
          onConfirm={handleMemberSelect}
        />}

      {isAddBookModalOpen && 
        <AddBook
          isOpen={isAddBookModalOpen}
          onClose={() => setIsAddBookModalOpen(false)}
          onBookSaved={() => {}}
          bookToEdit={book}
        />}
    </div>
  );

}

export default BookDetails;

