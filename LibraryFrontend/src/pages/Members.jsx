import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { ChevronRight, ChevronLeft, BookMarked, Dot, UserPlus, LibraryBig, Library } from "lucide-react";
import "../styles/pages/Members.css";
import AddMember from "../components/ModalAddMember";
import ProfileImage from "../components/ProfileImage";


function Members() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const searchFromUrl = searchParams.get("search") || "";

  const [members, setMembers] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [search, setSearch] = useState(searchFromUrl);
  
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 25;

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  
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
  

  // fetch members  
  const fetchPagedMembers = useCallback(async () => {
    try {
    const res = await axios.get("https://localhost:7244/api/members/paged", {
      params: { page, pageSize, search: search || null }
    });

    setMembers(res.data.members || []);
    setTotalPages(res.data.totalPages || 1);
  } catch (err) {
    console.error("Error fetching members:", err);
    setMembers([]);
    setTotalPages(1);
  }
}, [page, pageSize, search]);

  // fetch borrowed
  useEffect(() => {
    axios.get("https://localhost:7244/api/borrowed")
      .then(response => setBorrowed(response.data || []))
      .catch(error => console.error("Error fetching borrowed:", error));
  }, []);

  // join borrowed data into members
  const membersWithBorrowed = members.map(m => ({
    ...m,
    borrowed: borrowed.filter(b => b.memberId === m.memberId)
  }));

  // fetch whenever page/search changes 
  useEffect(() => {
    fetchPagedMembers();
  }, [page, search, fetchPagedMembers]);

  // Handle navigation updates
  const updateUrl = (newPage, newSearch) => {
    navigate({
      pathname: "/members",
      search: `?page=${newPage}&search=${newSearch}`,
    });
  };

  // Page change handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateUrl(newPage, search);
    }
  };

  // Search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    updateUrl(1, value);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page, members]);
  

  // call backend to return a book 
  const handleReturn = async (memberId, bookId) => {
    try {
      await axios.delete(`https://localhost:7244/api/borrowed/${bookId}/${memberId}`);

      // refresh borrowed list after return
      const res = await axios.get("https://localhost:7244/api/borrowed");
      setBorrowed(res.data || []);
    } catch (err) {
      console.error("Error returning book:", err);
    }
  };


  return (
    <div className="library-members" style={{paddingTop: headerHeight+10}}>

      <div className="header" ref={headerRef}>
        <div className="header-content">
          <h1>Members</h1>
          <input className="search-bar" 
            type="text" 
            placeholder="Search members..."
            value={search}
            onChange={handleSearchChange}/>
          <div className="header-actions">
            <Link 
              to="/books" 
              className="btn primary" 
              style={{textDecoration: "none" }} >
                <Library/> Books
            </Link>
            <button className="btn primary" onClick={() => setIsAddMemberModalOpen(true)} >
              <UserPlus/> Add Member
            </button>
          </div>
        </div>
      </div>

      <div className="members-grid" >
        {membersWithBorrowed.map((member) => (
          <div key={member.memberId} className="member-card">
            <div className="member-content">
              <ProfileImage name={member.memberName} size={80}/>
              <div className="member-header">
                <div className="member-info">
                  <p className="name">{member.memberName}</p>
                  <div className="member-info-row">
                    <p className="lib-card">ID: {member.libraryCardId}</p>
                    {member.borrowed.some(mb => mb.returnedDate === null && new Date(mb.due) < new Date()) && <div className="late-pill">Late</div>}
                  </div>
                </div>
                <div className="borrowed">
                  <p>{new Date(member.membershipValidTo) > new Date() ? "Active" : "Inactive"}</p>
                  <Dot />
                  <p className="borrowed-amount">{member.borrowed.filter(mb => mb.returnedDate === null).length} books</p>
                </div>
                <button className="btn primary">
                  <Link 
                    to={`/member/${member.memberId}`} 
                    state={{from: { pathname: location.pathname, search: location.search } }}
                    style={{ color: "inherit", textDecoration: "none" }}>
                      Details
                  </Link>
                </button>
              </div>
              
            </div>
          </div>
        ))}
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

      <AddMember 
        isOpen={isAddMemberModalOpen} 
        onClose={() => setIsAddMemberModalOpen(false)} 
        onMemberSaved={fetchPagedMembers} 
      />

    </div>
  );
}

export default Members;
