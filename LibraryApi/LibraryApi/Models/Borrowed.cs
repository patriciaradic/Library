using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryApi.Models
{
    [Table("borrowed")]
    public class Borrowed
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("borrowedId")]
        public int BorrowedId { get; set; }

        [Column("bookId")]
        public int BookId { get; set; }

        [Column("memberId")]
        public int MemberId { get; set; }

        [Column("copies")]
        public int? Copies { get; set; }

        [Column("dueDate")]
        public DateTime? Due { get; set; }

        [Column("borrowedDate")]
        public DateTime? BorrowedDate { get; set; }

        [Column("returnedDate")]
        public DateTime? ReturnedDate { get; set; }

        [Column("extendedCount")]
        public int? ExtendedCount { get; set; }

        [ForeignKey("BookId")]
        public Book? Book { get; set; }
        [ForeignKey("MemberId")] 
        public Member? Member { get; set; }

        // Extra fields from Book entity
        [NotMapped] 
        public string? Title { get; set; }
        [NotMapped] 
        public string? Authors { get; set; }
    }
}
