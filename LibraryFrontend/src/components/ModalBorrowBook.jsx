import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/modals/ModalBorrowBook.css";
import { X } from "lucide-react";

function BorrowBook({ isOpen, onClose, onConfirm }) {
    
    const [members, setMembers] = useState([]);
    const [copies, setCopies] = useState(1);
    const [search, setSearch] = useState('');
    
    // fech members sorted alphabetically
    useEffect(() => {
      if (!isOpen) return;

      axios.get("https://localhost:7244/api/members/eligible")
        .then(res => setMembers(res.data))
        .catch(err => console.error("Error fetching members:", err));
    }, []);

    const filteredMembers = members.filter( 
    (m) => 
      m.memberName.toLowerCase().includes(search.toLowerCase()) || 
      m.libraryCardId.toString().includes(search) 
    );

    return (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Select Member to Borrow</h3>

              <X className="modal-cancel" onClick={onClose} />

              <div className="modal-copies">
                <label>
                  Copies:{" "}
                    <input
                      type="number"
                      min="1"
                      value={copies}
                      onChange={(e) => setCopies(Number(e.target.value))}
                    />
                </label>
              </div>

              <input 
                className="search-bar" 
                type="text" 
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <ul className="modal-list">
              {filteredMembers.map((m) => (
                <li key={m.memberId}>
                  <button
                    className="modal-btn"
                    onClick={() => onConfirm(m.memberId, copies)}
                  >{m.memberName} ({m.libraryCardId})</button>
                </li>
              ))}
            </ul>
            
          </div>
        </div>
      )}

export default BorrowBook;