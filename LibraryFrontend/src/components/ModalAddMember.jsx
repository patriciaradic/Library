import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/modals/ModalAddMember.css";
import { X } from "lucide-react";

function AddMember ({ isOpen, onClose, onMemberSaved, memberToEdit = null }) {
  
  const buildInitialForm = (member) => ({
    memberName: member?.memberName || "",
    email: member?.email || "",
    libraryCardId: member?.libraryCardId?.toString() || "",
    firstMembershipDate: member?.firstMembershipDate
      ? new Date(member.firstMembershipDate).toISOString().split("T")[0]
      : "",
    lastMembershipDate: member?.lastMembershipDate
      ? new Date(member.lastMembershipDate).toISOString().split("T")[0]
      : "",
    membershipValidTo: member?.membershipValidTo
      ? new Date(member.membershipValidTo).toISOString().split("T")[0]
      : "",
  });

  const [touched, setTouched] = useState({});
  const [form, setForm] = useState(buildInitialForm(memberToEdit));

  useEffect(() => {
      if (isOpen) {
        setForm(buildInitialForm(memberToEdit));
      } else {
        setForm(buildInitialForm(null)); // reset to empty when closed
        setTouched({});
      }
    }, [isOpen]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
        ...form,
        [name]: value,
    });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const basePayload = {
      ...form,
      memberName: form.memberName || "",
      email: form.email || "",
      libraryCardId: form.libraryCardId ? parseInt(form.libraryCardId) : 0,
      firstMembershipDate: form.firstMembershipDate
        ? new Date(form.firstMembershipDate)
        : null,
      lastMembershipDate: form.lastMembershipDate
        ? new Date(form.lastMembershipDate)
        : null,
      membershipValidTo: form.membershipValidTo
        ? new Date(form.membershipValidTo)
        : null,
    }

    const payload = memberToEdit ? 
      {...basePayload, memberId: memberToEdit.memberId }
      : basePayload;

    try {
      if (memberToEdit) {
        await axios.put(`https://localhost:7244/api/members/${memberToEdit.memberId}`,payload)
      } else {
        await axios.post("https://localhost:7244/api/members", payload);
      }
      
      onMemberSaved();
      onClose();
    } catch (err) {
      console.error("Error adding member:", err);
      alert("Failed to add member");
    }
  };

  const errors = {
    memberName: !form.memberName.trim() && !memberToEdit ? "Name is required" : "",
    email: !form.email.trim() && !memberToEdit ? "Email is required" : ""
  };

  const isFormValid = !Object.values(errors).some((e) => e);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{memberToEdit ? "Edit Member" : "Add New Member"}</h2>
          <X className="modal-cancel" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Name */}
          <div className="form-group">
            <input
              type="text"
              name="memberName"
              placeholder="Member full name"
              value={form.memberName}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            />
            {!memberToEdit && touched.memberName  && errors.memberName  && (
              <p className="error-text">{errors.memberName }</p>
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            />
            {!memberToEdit && touched.email  && errors.email  && (
              <p className="error-text">{errors.email }</p>
            )}

            {!!memberToEdit && (
              <>
                <input
                  type="text"
                  name="libraryCardId"
                  placeholder="Library Card ID"
                  value={form.libraryCardId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                />

                <input
                  type="date"
                  name="firstMembershipDate"
                  placeholder="First Membership Date"
                  value={form.firstMembershipDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                />

                <input
                  type="date"
                  name="lastMembershipDate"
                  placeholder="Last Membership Date"
                  value={form.lastMembershipDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                />

                <input
                  type="date"
                  name="membershipValidTo"
                  placeholder="Membership Valid To"
                  value={form.membershipValidTo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="form-input"
                />
              </>
            )}

          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={!isFormValid && !memberToEdit}
              className={`btn ${isFormValid || memberToEdit ? "btn-submit" : "btn-disabled"}`}
            >{memberToEdit ? "Save Changes" : "Add"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
