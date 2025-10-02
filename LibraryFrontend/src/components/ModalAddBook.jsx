import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/modals/ModalAddBook.css";
import { X } from "lucide-react";


function AddBook({ isOpen, onClose, onBookSaved, bookToEdit = null }) {
  const placeholderImage = "/images/placeholderImage.jpeg";

  const buildInitialForm = (book) => ({
    title: book?.title || "",
    authors: book?.authors || "",
    booksCount: book?.booksCount?.toString() || "",
    firstPublishDate: book?.firstPublishDate
      ? new Date(book.firstPublishDate).toISOString().split("T")[0]
      : "",
    averageRating: book?.averageRating?.toString() || "",
    ratingsCount: book?.ratingsCount?.toString() || "",
    imageUrl: book?.imageUrl || "",
    availableCopies: book?.availableCopies?.toString() || "",
    series: book?.series || "",
    isbn: book?.isbn?.toString() || "",
    tags: Array.isArray(book?.tags) ? book.tags.join(", ") : (book?.tags || ""),
    description: book?.description || "",
    publisher: book?.publisher || "",
    edition: book?.edition || "",
    language: book?.language || "",
    pages: book?.pages?.toString() || "",
    awards: Array.isArray(book?.awards) ? book.awards.join(", ") : (book?.awards || ""),
  });

  const [form, setForm] = useState(buildInitialForm(bookToEdit));
  const [touched, setTouched] = useState({});


  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialForm(bookToEdit));
    } else {
      setForm(buildInitialForm(null)); // reset to empty when closed
      setTouched({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = { ...form, [name]: value };

    // Autofill AvailableCopies = BooksCount
    if (name === "booksCount") {
      updatedForm.availableCopies = value;
    }

    setForm(updatedForm);
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const basePayload = {
    ...form,
    pages: form.pages ? parseInt(form.pages) : 0,
    booksCount: form.booksCount ? parseInt(form.booksCount) : 0,
    availableCopies: form.availableCopies ? parseInt(form.availableCopies) : 0,
    averageRating: form.averageRating ? parseFloat(form.averageRating) : 0,
    ratingsCount: form.ratingsCount ? parseInt(form.ratingsCount) : 0,
    isbn: form.isbn ? parseInt(form.isbn) : 0,
    firstPublishDate: form.firstPublishDate
      ? new Date(form.firstPublishDate)
      : null,
    tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
    awards: form.awards ? form.awards.split(",").map(a => a.trim()) : [],
    imageUrl: form.imageUrl || placeholderImage,
  };

  // Only include bookId when editing
  const payload = bookToEdit 
    ? { ...basePayload, bookId: bookToEdit.bookId }
    : basePayload;

    try {
      if (bookToEdit) {
        // PUT replaces the entire entity
        await axios.put(`https://localhost:7244/api/books/${bookToEdit.bookId}`, payload);
      } else {
        await axios.post("https://localhost:7244/api/books", payload);
      }

      onBookSaved();
      onClose();
    } catch (err) {
      console.error("Error saving book:", err.response || err);
      alert("Failed to save book");
    }
  };

  const errors = {
    title: !form.title.trim() && !bookToEdit ? "Title is required" : "",
    authors: !form.authors.trim() && !bookToEdit ? "Authors are required" : "",
    booksCount: !form.booksCount && !bookToEdit ? "Books count is required" : "",
    firstPublishDate: !form.firstPublishDate && !bookToEdit
      ? "Year is required"
      : "",
  };

  const isFormValid = !Object.values(errors).some((e) => e);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{bookToEdit ? "Edit Book" : "Add New Book"}</h2>
          <X className="modal-cancel" onClick={onClose} />
        </div>
        
        <form id="book-form" onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            />
            {!bookToEdit && touched.title && errors.title && (
              <p className="error-text">{errors.title}</p>
            )}
          </div>

          {/* Series - optional */}
          <div className="form-group">
            <label htmlFor="series">Series</label>
            <input
              id="series"
              type="text"
              name="series"
              placeholder="Series"
              value={form.series}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            />
          </div>

          {/* Authors */}
          <div className="form-group">
            <label htmlFor="authors">Authors</label>
            <input
              id="authors"
              type="text"
              name="authors"
              placeholder="Authors"
              value={form.authors}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            />
            {!bookToEdit && touched.authors && errors.authors && (
              <p className="error-text">{errors.authors}</p>
            )}
          </div>

          {/* Books count */}
          <div className="form-group">
            <label htmlFor="booksCount">Books Count</label>
            <input
              id="booksCount"
              type="number"
              name="booksCount"
              placeholder="Books Count"
              value={form.booksCount}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            />
            {!bookToEdit && touched.booksCount && errors.booksCount && (
              <p className="error-text">{errors.booksCount}</p>
            )}
          </div>

          {/* Publish Date */}
          <div className="form-group">
            <label htmlFor="firstPublishDate">Publish Date</label>
            <input
              id="firstPublishDate"
              type="date"
              name="firstPublishDate"
              placeholder="Publish Date"
              value={form.firstPublishDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            />
            {!bookToEdit && 
              touched.firstPublishDate &&
              errors.firstPublishDate && (
                <p className="error-text">{errors.firstPublishDate}</p>
              )}
          </div>

          {/* Optional */}

          {/* ISBN */}
          <div className="form-group">
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
            type="number"
            name="isbn"
            placeholder="ISBN"
            value={form.isbn}
            onChange={handleChange}
            className="form-input"
          />
          </div>
          
          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="imageUrl">Book Cover URL</label>
            <input
              id="imageUrl"
            type="text"
            name="imageUrl"
            placeholder="Book Cover URL"
            value={form.imageUrl}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
            type="text"
            name="tags"
            placeholder="Tags"
            value={form.tags}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="publisher">Description</label>
          <textarea
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Publisher */}
          <div className="form-group">
            <label htmlFor="publisher">Publisher</label>
            <input
              id="publisher"
            type="text"
            name="publisher"
            placeholder="Publisher"
            value={form.publisher}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Edition */}
          <div className="form-group">
            <label htmlFor="edition">Edition</label>
            <input
              id="edition"
            type="text"
            name="edition"
            placeholder="Edition"
            value={form.edition}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Language */}
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <input
              id="language"
            type="text"
            name="language"
            placeholder="Language"
            value={form.language}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Pages */}
          <div className="form-group">
            <label htmlFor="pages">Pages</label>
            <input
              id="pages"
            type="number"
            name="pages"
            placeholder="Pages"
            value={form.pages}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Average rating */}
          <div className="form-group">
            <label htmlFor="averageRating">Average Rating</label>
            <input
              id="averageRating"
            type="number"
            step="0.01"
            name="averageRating"
            placeholder="Average Rating"
            value={form.averageRating}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Ratings count */}
          <div className="form-group">
            <label htmlFor="ratingsCount">Ratings Count</label>
            <input
              id="ratingsCount"
            type="number"
            name="ratingsCount"
            placeholder="Ratings Count"
            value={form.ratingsCount}
            onChange={handleChange}
            className="form-input"
          />
          </div>

          {/* Awards */}
          <div className="form-group">
            <label htmlFor="awards">Awards</label>
            <textarea
            id="awards"
            type="text"
            name="awards"
            placeholder="Awards"
            value={form.awards}
            onChange={handleChange}
            className="form-input"
          />
          </div>
        </form>
        {/* Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            form="book-form"
            disabled={!isFormValid && !bookToEdit}
            className={`btn ${isFormValid || bookToEdit ? "btn-submit" : "btn-disabled"}`}
          >{bookToEdit ? "Save Changes" : "Add"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default AddBook;
