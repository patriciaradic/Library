using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibraryApi.Data;
using LibraryApi.Models;
using System.Net;

namespace LibraryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BorrowedController : ControllerBase
    {
        private readonly LibraryContext _context;

        public BorrowedController(LibraryContext context)
        {
            _context = context;
        }

        // DTO for returning borrowed info to frontend
        public class BorrowedDto
        {
            public int BorrowedId { get; set; }
            public int BookId { get; set; }
            public int MemberId { get; set; }
            public int? Copies { get; set; }
            public DateTime? BorrowedDate { get; set; }
            public DateTime? Due { get; set; }
            public DateTime? ReturnedDate { get; set; }
            public int? ExtendedCount { get; set; }

            // Extra fields for frontend convenience
            public string? Title { get; set; }
            public string? Series { get; set; }
            public string? ImageUrl { get; set; }
            public string? Authors { get; set; }
            public List<string>? Tags { get; set; }
            public string? MemberName { get; set; }
        }

        // GET: api/Borrowed
        [HttpGet]
        public async Task<IActionResult> GetBorrowed()
        {
            var borrowed = await _context.Borrowed
                .Include(b => b.Book)   // make sure Book is loaded
                .Include(b => b.Member) // make sure Member is loaded
                .Select(b => new BorrowedDto
                {
                    BorrowedId = b.BorrowedId,
                    BookId = b.BookId,
                    MemberId = b.MemberId,
                    Copies = b.Copies,
                    BorrowedDate = b.BorrowedDate,
                    Due = b.Due,
                    ReturnedDate = b.ReturnedDate,
                    ExtendedCount = b.ExtendedCount,
                    Title = b.Book != null ? b.Book.Title : string.Empty,
                    Series = b.Book != null ? b.Book.Series : string.Empty,
                    Authors = b.Book != null ? b.Book.Authors : string.Empty,
                    ImageUrl = b.Book != null ? b.Book.ImageUrl : string.Empty,
                    Tags = b.Book != null ? b.Book.Tags : new(),
                    MemberName = b.Member != null ? b.Member.MemberName : string.Empty
                })
                .ToListAsync();

            return Ok(borrowed);
        }

        // GET: api/Borrowed/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Borrowed>> GetBorrowed(int id)
        {
            var borrowed = await _context.Borrowed.FindAsync(id);

            if (borrowed == null)
            {
                return NotFound();
            }

            return borrowed;
        }

        // GET: api/borrowed/book/5
        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<IEnumerable<Borrowed>>> GetBorrowedByBook(int bookId)
        {
            var records = await _context.Borrowed
                .Where(b => b.BookId == bookId)
                .Include(b => b.Member)
                .Include(b => b.Book)
                .Select(b => new BorrowedDto
                {
                    BorrowedId = b.BorrowedId,
                    BookId = b.BookId,
                    MemberId = b.MemberId,
                    Copies = b.Copies,
                    BorrowedDate = b.BorrowedDate,
                    Due = b.Due,
                    ReturnedDate = b.ReturnedDate,
                    ExtendedCount = b.ExtendedCount,
                    MemberName = b.Member != null ? b.Member.MemberName : string.Empty
                })
                .ToListAsync();

            if (!records.Any()) return NotFound();

            return Ok(records);
        }

        // GET: api/borrowed/member/7
        [HttpGet("member/{memberId}")]
        public async Task<ActionResult<IEnumerable<Borrowed>>> GetBorrowedByMember(int memberId)
        {
            var records = await _context.Borrowed
                .Where(b => b.MemberId == memberId)
                .Include(b => b.Book)
                .Include(b => b.Member)
                .Select(b => new BorrowedDto
                {
                    BorrowedId = b.BorrowedId,
                    BookId = b.BookId,
                    MemberId = b.MemberId,
                    Copies = b.Copies,
                    BorrowedDate = b.BorrowedDate,
                    Due = b.Due,
                    ReturnedDate = b.ReturnedDate,
                    ExtendedCount = b.ExtendedCount,
                    Title = b.Book != null ? b.Book.Title : string.Empty,
                    Series = b.Book != null ? b.Book.Series : string.Empty,
                    Authors = b.Book != null ? b.Book.Authors : string.Empty,
                    ImageUrl = b.Book != null ? b.Book.ImageUrl : string.Empty,
                    Tags = b.Book != null ? b.Book.Tags : new()
                })
                .ToListAsync();

            if (!records.Any()) return NotFound();

            return Ok(records);
        }


        // PUT: api/Borrowed/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{borrowedId}")]
        public async Task<IActionResult> UpdateBorrowed(int borrowedId, Borrowed borrowed)
        {
            if (borrowedId != borrowed.BorrowedId)
                return BadRequest("Mismatched BorrowedId");

            var existing = await _context.Borrowed
                .Include(b => b.Book)
                .FirstOrDefaultAsync(b => b.BorrowedId == borrowedId);

            if (existing == null) return NotFound("Borrow record not found");

            if (existing.Book == null) return NotFound("Book not found");

            int diff = (borrowed.Copies ?? 0) - (existing.Copies ?? 0);
            if (diff > 0)
            {
                if (existing.Book.AvailableCopies < diff)
                    return BadRequest("Not enough available copies");
                existing.Book.AvailableCopies -= diff;
            }
            else if (diff < 0)
            {
                existing.Book.AvailableCopies += Math.Abs(diff);
            }

            existing.Copies = borrowed.Copies;
            existing.Due = borrowed.Due;

            await _context.SaveChangesAsync();
            return NoContent();
        }


        // PUT: api/Borrowed/extend/{borrowedId}
        [HttpPut("extend/{borrowedId}")]
        public async Task<IActionResult> ExtendLoan(int borrowedId)
        {
            var borrowed = await _context.Borrowed.FindAsync(borrowedId);
            if (borrowed == null) return NotFound("Borrow record not found");

            if (borrowed.ExtendedCount >= 2)
                return BadRequest("Maximum extensions reached");

            borrowed.ExtendedCount++;
            borrowed.Due = DateTime.Now.AddDays(14);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Loan extended", borrowed.ExtendedCount, borrowed.Due });
        }

        // PUT: api/Borrowed/return/{borrowedId}
        [HttpPut("return/{borrowedId}")]
        public async Task<IActionResult> ReturnBook(int borrowedId)
        {
            var borrowed = await _context.Borrowed
                .Include(b => b.Book)
                .FirstOrDefaultAsync(b => b.BorrowedId == borrowedId);

            if (borrowed == null) return NotFound("Borrow record not found");
            if (borrowed.Book == null) return NotFound("Book not found");

            if (borrowed.Copies.HasValue)
                borrowed.Book.AvailableCopies += borrowed.Copies.Value;

            borrowed.ReturnedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Book returned", borrowed.ReturnedDate });
        }


        // POST: api/Borrowed
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        public class BorrowRequest
        {
            public int BookId { get; set; }
            public int MemberId { get; set; }
            public int Copies { get; set; }
        }


        [HttpPost("borrow")]
        public async Task<IActionResult> BorrowBook(BorrowRequest request)
        {
            var book = await _context.Books.FindAsync(request.BookId);
            if (book == null || book.AvailableCopies < request.Copies)
                return BadRequest("Not enough copies available.");

            // Check if this member already borrowed the book
            var borrowed = await _context.Borrowed
                .FirstOrDefaultAsync(b => b.BookId == request.BookId && b.MemberId == request.MemberId);

            
            borrowed = new Borrowed
            {
                BookId = request.BookId,
                MemberId = request.MemberId,
                Copies = request.Copies,
                Due = DateTime.Now.AddDays(14),
                BorrowedDate = DateTime.Now,
                ReturnedDate = null,
                ExtendedCount = 0
            };

            await _context.Borrowed.AddAsync(borrowed);

            // Decrement available copies
            book.AvailableCopies -= request.Copies;
            _context.Books.Update(book);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Book borrowed successfully" });
        }




        // DELETE: api/Borrowed/5
        [HttpDelete("{bookId}/{memberId}")]
        public async Task<IActionResult> DeleteBorrowed(int bookId, int memberId)
        {
            var record = await _context.Borrowed.FindAsync(bookId, memberId);
            if (record == null) return NotFound("Borrow record not found");

            var book = await _context.Books.FindAsync(bookId);
            if (book != null)
            {
                book.AvailableCopies += record.Copies;
            }

            _context.Borrowed.Remove(record);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool BorrowedExists(int id)
        {
            return _context.Borrowed.Any(e => e.BookId == id);
        }
    }
}
