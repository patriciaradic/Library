import React, { useState } from "react";
import axios from "axios";
import "../styles/modals/ModalSelectBook.css";
import { X } from "lucide-react";

function SelectBook({ isOpen, onClose, borrows, isReturn }) {
  const [selectedBooks, setSelectedBooks] = useState([]);

  const toggleSelect = (borrow) => {
    setSelectedBooks((prev) =>
      prev.some((b) => b.borrowedId === borrow.borrowedId)
        ? prev.filter((b) => b.borrowedId !== borrow.borrowedId)
        : [...prev, borrow]
    );
  };

  const handleSubmit = async () => {
    try {
      if (isReturn) {
        await Promise.all(selectedBooks.map((b) => handleReturn(b)));
      } else {
        await Promise.all(selectedBooks.map((b) => handleExtend(b)));
      }
      onClose();
    } catch (err) {
      console.error("Error processing books:", err);
    }
  };

  const handleReturn = async (borrow) => {
    try {
      const res = await axios.put(
        `https://localhost:7244/api/borrowed/return/${borrow.borrowedId}`
      );
      console.log(res.data.message);
    } catch (err) {
      console.error("Error returning book:", err);
      alert(err.response?.data || "Failed to return book");
    }
  };

  const handleExtend = async (borrow) => {
    try {
      const res = await axios.put(
        `https://localhost:7244/api/borrowed/extend/${borrow.borrowedId}`
      );
      console.log(res.data.message);
    } catch (err) {
      console.error("Error extending loan:", err);
      alert(err.response?.data || "Failed to extend loan");
    }
  };

  if (!isOpen) return null;

  // filter logic
  const filteredBorrows = isReturn
    ? borrows
    : borrows.filter((b) => b.extendedCount < 2 && b.isLate === false);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">
            {isReturn ? "Select Books to Return" : "Select Books to Extend Loan"}
          </h3>
          <X className="modal-cancel" onClick={onClose} />
        </div>

        <ul className="modal-list">
          {filteredBorrows.length === 0 && (
            <li className="no-items">No books available</li>
          )}
          {filteredBorrows.map((b) => (
            <li key={b.borrowedId}>
              <button
                type="button"
                className={`modal-btn ${
                  selectedBooks.some((s) => s.borrowedId === b.borrowedId)
                    ? "selected"
                    : ""
                }`}
                onClick={() => toggleSelect(b)}
              >
                {b.title}
              </button>
            </li>
          ))}
        </ul>

        <div className="modal-actions">
          <button
            className="btn primary"
            onClick={handleSubmit}
            disabled={selectedBooks.length === 0}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectBook;
