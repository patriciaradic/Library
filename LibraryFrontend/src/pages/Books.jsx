import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Users, X, Funnel, LibraryBig } from "lucide-react";
import "../styles/pages/Books.css";
import AddBook from "../components/ModalAddBook";
import BorrowBook from "../components/ModalBorrowBook";
import TagFilter from "../components/ModalTagFilter";

const STORAGE_KEY = "booksFilters";

function Books() {
  // deal with url
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const searchFromUrl = searchParams.get("search") || "";
  const tagsFromUrl = searchParams.get("tags")
    ? searchParams.get("tags").split(",").filter(Boolean)
    : [];

  // data for fetching
  const [books, setBooks] = useState([]);

  // pagination
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchFromUrl);
  const [pageSize] = useState(35);

  // add and borrow modal flags
  const [isBorrowBookModalOpen, setIsBorrowBookModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // tags
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(tagsFromUrl);
  
  // header height
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // handle header resize
  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => setHeaderHeight(headerRef.current.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(headerRef.current);
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // Fetch books
  const fetchBooks = useCallback(async () => {
    try {
        const tagsParam = selectedTags.join(",");
        const response = await axios.get("https://localhost:7244/api/books/paged", {
          params: {
            page,
            pageSize,
            search: search || null,
            tags: tagsParam || null,
          },
        });

        setBooks(response.data.books);
        setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  }, [page, pageSize, search, selectedTags]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // get tags for filter
  // only on mount bc they should stay pretty consistent
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get("https://localhost:7244/api/books/tags");
        setAllTags(res.data); 
      } catch (err) {
        console.error("Failed to fetch tags:", err);
      }
    };
    fetchTags();
  }, []);


  const removeTag = (tag) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    setPage(1);
    updateUrl(1, search, newTags);
  };

  // Handle navigation updates
  const updateUrl = (newPage, newSearch, newTags) => {
    const params = new URLSearchParams();
    params.set("page", newPage);
    if (newSearch) params.set("search", newSearch);
    if (newTags.length > 0) params.set("tags", newTags.join(","));

    navigate({ 
      pathname: "/books", 
      search: params.toString() 
    });
  };

  // Page change handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateUrl(newPage, search, selectedTags);
    }
  };

  // Search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    updateUrl(1, value, selectedTags);
  };

  const handleTagChange = (tags) => {
    setSelectedTags(tags);
    setPage(1);
    updateUrl(1, search, tags);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.search]);

  // Borrow modal handlers 
  const handleBorrowClick = (book) => {
    setSelectedBook(book);
    setIsBorrowBookModalOpen(true);
  };

  const handleMemberSelect = async (memberId, copies = 1) => {
    if (!selectedBook) return;

    try {
      await axios.post("https://localhost:7244/api/borrowed/borrow", {
        bookId: selectedBook.bookId,
        memberId,
        copies,
      });

      await fetchBooks(page);

      setIsBorrowBookModalOpen(false);
      setSelectedBook(null);
    } catch (err) {
      console.error("Error borrowing book:", err);
    }
  };

  return (
    <div className="library-home" 
      style={{paddingTop: headerHeight + 10, display: "flex", flexDirection: "column", minHeight: "100vh"}}>
      {/* Header */}
      <header className="header" ref={headerRef}>
        <div className="header-content">
          {/* Search with funnel button */}
          <div className="search-wrapper">
            <input
              className="search-bar"
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={handleSearchChange}
            />
            <button
              className="funnel-btn"
              onClick={() => setIsTagFilterOpen(true)}
              aria-label="Filter"
            >
              <Funnel />
            </button>
          </div>

          <div className="header-actions">
            <Link to="/members" className="btn primary">
              <Users /> Members
            </Link>
            <button
              className="btn primary"
              onClick={() => setIsAddBookModalOpen(true)}
            >
              <Plus /> Add Book
            </button>
          </div>
        </div>

        {selectedTags.length != 0 && <div className="pill-container">
          {selectedTags.map((tag) => (
            <div 
              key={tag} 
              className="pill"
            >
              {tag} <X className="pill-remove" onClick={() => removeTag(tag)}/>

            </div>
          ))}
        </div>}
      </header>

      {/* Book Grid */}
      <div style={{flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
      {books.length === 0 ? 
      (!!search && !!selectedTags ? 
        `No results for ${search} and ${selectedTags.join(", ")}` 
        : (!!search ? 
          `No results for ${search}` 
          : `No results for ${selectedTags.join(", ")}`)
      ) : (
      <div className="book-grid">
        {books.map((book) => (
          <div key={book.bookId} className="book-card">
            <img 
              src={book.imageUrl || "/images/placeholderImage.jpeg"} 
              alt={book.title} 
              className="book-cover" 
            />
            <h3 className="title">{book.title}</h3>
            {book.series && <p className="series">{book.series}</p>}
            <p className="author">{book.authors.length > 50 ? book.authors.slice(0,50) + "..." : book.authors}</p>
            <p className="year">
              {new Date(book.firstPublishDate).getFullYear()}
            </p>
            <p className="copies">{book.availableCopies} available</p>

            <div className="actions">
              <button
                className="btn secondary"
                onClick={() => handleBorrowClick(book)}
                disabled={book.availableCopies <= 0}
              >
                Borrow
              </button>
              <Link 
                to={`/book/${book.bookId}`} 
                className="btn secondary"
                state={{from: { pathname: location.pathname, search: location.search } }}>
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>)}
      </div>

      {/* Pagination Controls */}
      <ReactPaginate
        previousLabel={<ChevronLeft className="icon" />}
        nextLabel={<ChevronRight className="icon" />}
        pageCount={totalPages > 0 ? totalPages : 1}
        forcePage={totalPages > 0 ? page - 1 : 0}
        pageRangeDisplayed={5}
        marginPagesDisplayed={2}
        onPageChange={(selectedItem) => handlePageChange(selectedItem.selected + 1)}
        containerClassName={"pagination"}
        activeClassName={"active"}
      />

      {/* Modals */}
      {selectedBook && (
        <BorrowBook
          isOpen={isBorrowBookModalOpen}
          onClose={() => {
            setIsBorrowBookModalOpen(false);
            setSelectedBook(null);
          }}
          onConfirm={handleMemberSelect}
        />
      )}

      <AddBook
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onBookSaved={fetchBooks}
      />

      <TagFilter 
        isOpen={isTagFilterOpen}
        onClose={()=>setIsTagFilterOpen(false)}
        allTags={allTags}
        selectedTags={selectedTags}
        onSubmit={handleTagChange}
      />
    </div>
  );
}

export default Books;
