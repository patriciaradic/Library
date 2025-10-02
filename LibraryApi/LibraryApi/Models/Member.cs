using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryApi.Models
{
    [Table("members")]
    public class Member
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("memberId")]
        public int MemberId { get; set; }

        [Column("name")]
        public string? MemberName { get; set; } = string.Empty;

        [Column("firstMembershipDate")]
        public DateTime? FirstMembershipDate { get; set; }

        [Column("lastMembershipDate")]
        public DateTime? LastMembershipDate { get; set; }

        [Column("membershipValidTo")]
        public DateTime? MembershipValidTo { get; set; }

        [Column("libraryCardId")]
        public int? LibraryCardId { get; set; }

        [Column("email")]
        public string? Email { get; set; } = string.Empty;


        public ICollection<Borrowed> Borrowed { get; set; } = new List<Borrowed>();
    }
}
