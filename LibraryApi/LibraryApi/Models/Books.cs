using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Components.Forms;

namespace LibraryApi.Models
{
    [Table("books")]
    public class Book
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("bookId")]
        public int BookId { get; set; }

        [Column("goodreadsBookId")]
        public string? GoodreadsBookId { get; set; }

        [Column("isbn")]
        public double? ISBN { get; set; }

        [Column("totalCopies")]
        public int? BooksCount { get; set; }

        [Column("author")]
        public string? Authors { get; set; } = string.Empty;

        [Column("firstPublishDate")]
        public DateTime? FirstPublishDate { get; set; }

        [Column("publisher")]
        public string? Publisher { get; set; }

        [Column("edition")]
        public string? Edition { get; set; }

        [Column("pages")]
        public int? Pages { get; set; }

        [Column("awards")]
        public List<string> Awards { get; set; } = new();

        [Column("title")]
        public string? Title { get; set; } = string.Empty;

        [Column("series")]
        public string? Series { get; set; } = string.Empty;

        [Column("rating")]
        public double? AverageRating { get; set; }

        [Column("numRatings")]
        public int? RatingsCount { get; set; }

        [Column("ratingsByStars")]
        public string? RatingsByStars { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("genres")]
        public List<string> Tags { get; set; } = new();

        [Column("language")]
        public string? Language { get; set; }

        [Column("coverImg")]
        public string? ImageUrl { get; set; } = string.Empty;

        [Column("availableCopies")]
        public int? AvailableCopies { get; set; }

        public ICollection<Borrowed> Borrowed { get; set; } = new List<Borrowed>();


    }
}