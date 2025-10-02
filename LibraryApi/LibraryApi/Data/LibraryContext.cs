using Microsoft.EntityFrameworkCore;
using LibraryApi.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;
using System.Collections.Generic;

namespace LibraryApi.Data
{
    public class LibraryContext : DbContext
    {
        public LibraryContext(DbContextOptions<LibraryContext> options) : base(options) { }

        public DbSet<Book> Books { get; set; }
        public DbSet<Member> Members { get; set; }
        public DbSet<Borrowed> Borrowed { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Composite PK for Borrowed
            modelBuilder.Entity<Borrowed>()
                .HasKey(b => b.BorrowedId);

            // Relationships
            modelBuilder.Entity<Borrowed>()
                .HasOne(b => b.Book)
                .WithMany(bk => bk.Borrowed)
                .HasForeignKey(b => b.BookId);

            modelBuilder.Entity<Borrowed>()
                .HasOne(b => b.Member)
                .WithMany(m => m.Borrowed)
                .HasForeignKey(b => b.MemberId);

            // Match table names & column casing with MySQL
            modelBuilder.Entity<Book>().ToTable("books");
            modelBuilder.Entity<Member>().ToTable("members");
            modelBuilder.Entity<Borrowed>().ToTable("borrowed");

            var listToStringConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v ?? new List<string>(), (JsonSerializerOptions)null!),
            v => string.IsNullOrEmpty(v)
                ? new List<string>()
                : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!)!
        );

                modelBuilder.Entity<Book>()
                    .Property(b => b.Tags)
                    .HasConversion(listToStringConverter);

                modelBuilder.Entity<Book>()
                    .Property(b => b.Awards)
                    .HasConversion(listToStringConverter);
        }
    }
}
