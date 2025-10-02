import React, { useState, useEffect } from "react";
import "../styles/modals/ModalTagFilter.css";
import { X } from "lucide-react";

function TagFilter({ isOpen, onClose, allTags, selectedTags, onSubmit }) {
    const [tempSelected, setTempSelected] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isOpen) setTempSelected(selectedTags || []);
    }, [isOpen, selectedTags]);
    
    const toggleTag = (tag) => {
        setTempSelected(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = () => {
        onSubmit(tempSelected);
        setSearch("");
        onClose();
    };

    const filteredTags = allTags.filter( 
    (tag) => 
      tag.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Select Tags</h3>
          <X className="modal-cancel" onClick={onClose} />
          <input 
            className="search-bar" 
            type="text" 
            placeholder="Search Tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
                
        </div>
        <div className="tags-grid">
          {filteredTags.map(tag => (
            <div
              key={tag}
              className={`tag-item ${tempSelected.includes(tag) ? "selected" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn primary" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
}

export default TagFilter;