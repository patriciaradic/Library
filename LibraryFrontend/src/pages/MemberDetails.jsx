import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Book, BookOpenCheck, CalendarClock, Dot, TriangleAlert, Undo2, UserCheck, UserPen } from "lucide-react";
import MemberTable from "../components/TableMemberHistory";
import AddMember from "../components/ModalAddMember";
import "../styles/pages/MemberDetails.css"
import ProfileImage from "../components/ProfileImage";
import SelectBook from "../components/ModalSelectBook";

function MemberDetails() {
  const { id } = useParams();
  const location = useLocation();
  const from = location.state?.from;
  const backLink = from ? `${from.pathname}${from.search}` : "/members";

  const [member, setMember] = useState(null);
  const [borrowedRecords, setBorrowedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSelectBookModalOpen, setIsSelectBookModalOpen] = useState(false);
  const [isReturn, setIsReturn] = useState(true);
  

  // Fetch member details using id
  const fetchMember = async (id) => {
    try {
      const res = await axios.get(`https://localhost:7244/api/members/${id}`);
      setMember(res.data);
    } catch (err) {
      console.error("Error fetching member:", err);
      setError("Failed to load member details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch borrowed records for this member
  const fetchBorrowedByMember = async (memberId) => {
    try {
      const res = await axios.get(
        `https://localhost:7244/api/borrowed/member/${memberId}`
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

  useEffect(() => {
    fetchMember(id);
    fetchBorrowedByMember(id);
  }, [id, isAddMemberModalOpen, isSelectBookModalOpen])

  if (loading) return <p>Loading member details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!member) return <p>No member found.</p>;

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

  const favoriteTags = (() => {
    const tagCounts = {};
    borrowedRecords.forEach(r => {
      r.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(g => g[0]);
    return topTags;
  })()

  const extendMembership = async () => {
    const today = new Date();
    const payload = {
      ...form,
      memberId: member.memberId,
      memberName: member.memberName || "",
      email: member.email || "",
      libraryCardId: member.libraryCardId || 0,
      firstMembershipDate: member.firstMembershipDate || null,
      lastMembershipDate: today,
      membershipValidTo: today.setFullYear(today.getFullYear() + 1),
    }

    try {
      await axios.put(`https://localhost:7244/api/members/${member.memberId}`,payload);
      alert("Membership extended!")
    } catch (err) {
      console.error("Error extending membership:", err);
      alert("Failed to extend membership");
    }
  }

  // Return a borrowed book
  const handleReturn = async (borrow) => {
    try {
      const res = await axios.put(
        `https://localhost:7244/api/borrowed/return/${borrow.borrowedId}`
      );

      console.log(res.data.message); // e.g., "Book returned"
      // Refresh data
      await fetchBorrowedByMember(borrow.memberId);
      await fetchMember(borrow.memberId); // refresh available copies
    } catch (err) {
      console.error("Error returning book:", err);
      alert(err.response?.data || "Failed to return book");
    }
  };

  // Extend a borrowed book loan
  const handleExtend = async (borrow) => {
    try {
      const res = await axios.put(
        `https://localhost:7244/api/borrowed/extend/${borrow.borrowedId}`
      );

      console.log(res.data.message); // e.g., "Loan extended"
      // Refresh data
      await fetchBorrowedByMember(borrow.bookId);
    } catch (err) {
      console.error("Error extending loan:", err);
      alert(err.response?.data || "Failed to extend loan");
    }
  };

  

  return (
    <div className="member-detail">
      <Link to={backLink} >
        <Undo2 className="btn-back"/>
      </Link>

      <div className="member-detail-header">
        <div className="member-profile-wrapper">
          <ProfileImage 
            className="user-profile-image"
            name={member.memberName} 
            size={200}
          />
        </div>
        
        <div className="member-info-wrapper" >
          <h2 className="member-name">{member.memberName}</h2>

          <div className="member-detail-actions">
            <button 
              className="btn primary" 
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              <UserPen />Edit Member
            </button>
            <button 
              title="Extend Membership" 
              className="btn ternary" 
              onClick={extendMembership}
            >
              <UserCheck />
            </button> 
            <button 
              title="Return Books" 
              className="btn ternary" 
              onClick={() => {
                setIsSelectBookModalOpen(true); 
                setIsReturn(true);
              }}
            >
              <BookOpenCheck />
            </button>
            <button 
              title="Extend Borrowed Books" 
              className="btn ternary" 
              onClick={() => {
                setIsSelectBookModalOpen(true); 
                setIsReturn(false);
              }}
            >
              <CalendarClock />
            </button>
          </div>
        </div>
        
          
      </div>

      <div className="member-detail-card">
        
        <div className="member-detail-left">
          <div className="detail-group">
            <p className="detail-label"><strong>Library Card</strong></p>
            <p className="detail-value">{member.libraryCardId}</p>
          </div>
          
          <div className="detail-group">
            <p className="detail-label"><strong>Email</strong></p>
            <p className="detail-value">{member.email}</p>
          </div>
          
        </div>

        <div className="member-detail-middle">
          <div className="detail-group">
            <p className="detail-label"><strong>Joined Date</strong></p>
            <p className="detail-value">
              {member.firstMembershipDate
                ? new Date(member.firstMembershipDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          
          <div className="detail-group">
            <p className="detail-label"><strong>Membership Valid Until</strong></p>
            <p className="detail-value">{new Date(member.membershipValidTo).toLocaleDateString()}</p>
          </div>
          
          <div className="detail-group">
            <p className="detail-label"><strong>Membership Status</strong></p>
            <p className="detail-value">
              {new Date(member.membershipValidTo) > new Date() ? "Active" : "Expired"}
            </p>
          </div>
        </div>

        <div className="member-detail-right">
          <div className="detail-group">
            <p className="detail-label"><strong>Late Returns</strong></p>
            <p className="detail-value">
              {currentWithLate.filter(r => r.isLate).length + historyWithLate.filter(r => r.isLate).length}
            </p>
          </div>
          
          <p> <strong>Top Genres</strong>{" "}</p>
          <div className="pill-container">
            {favoriteTags.map((tag) => (
              <Link 
                to={`/books?page=1&tags=${encodeURIComponent(tag)}`} 
                style={{ color: "inherit", textDecoration: "none" }}
                key={`tag-${tag}`} 
                className="pill"
              > {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="borrow-sections">
        <h3>Current Borrows</h3>
        {currentWithLate.length === 0 ? (
          <p>No active borrows.</p>
        ) : (
          <div className="current-borrow-grid">
          
            {currentWithLate.map((borrow) => (
              <div key={borrow.borrowId} className="current-borrow-card">
                <img src={borrow.imageUrl} alt={borrow.title} className="current-borrow-cover" />
                <h3 className="md-title">{borrow.title}</h3>
                <p className="md-series">{borrow.series}</p>
                <p className="md-author">{borrow.authors}</p>
                <div className="due-late">
                  <p className="md-due">{new Date(borrow.due).toLocaleDateString()}</p>
                  {borrow.isLate && <div className="detail-late-pill">Late</div>}
                </div>
                <div className="copies-extended">
                  <p>{borrow.copies} copies</p>
                  <Dot className="dot-icon"/>
                  <p>{borrow.extendedCount} extensions</p>
                </div>
                    
                <div className="actions">
                  <button 
                    className="btn secondary" 
                    onClick={() => handleReturn(borrow)} 
                    >
                      Return
                  </button>
                  <button 
                    className="btn secondary" 
                    onClick={() => handleExtend(borrow)} 
                    disabled={borrow.isLate || borrow.extendedCount === 2}
                    >
                      Extend
                  </button>
                  <button 
                    className="btn secondary">
                      <Link 
                        to={`/book/${borrow.bookId}`}
                        style={{ color: "inherit", textDecoration: "none" }}>
                          Details
                      </Link>
                  </button>
                </div>
    
              </div>
            ))}
    
          </div>
        )}

        <h3>Borrow History</h3>
        {historyWithLate.length === 0 ? (
          <p>No borrow history.</p>
        ) : (
          <MemberTable data={historyWithLate} />
        )}
      </div>

      {isAddMemberModalOpen && 
        <AddMember 
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onMemberSaved={() => {}}
          memberToEdit={member}
        />}

      {isSelectBookModalOpen &&
        <SelectBook 
        isOpen={isSelectBookModalOpen}
        onClose={() => setIsSelectBookModalOpen(false)}
        borrows={currentWithLate}
        isReturn={isReturn}
        />}
    </div>
  );

}

export default MemberDetails;
