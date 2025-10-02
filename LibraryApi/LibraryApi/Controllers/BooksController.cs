using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibraryApi.Data;
using LibraryApi.Models;

namespace LibraryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly LibraryContext _context;

        public BooksController(LibraryContext context)
        {
            _context = context;
        }

        // GET: api/Books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            // returns all books
            return await _context.Books.ToListAsync();
        }

        // GET: api/books/paged?page=1&pageSize=10&search=abc&tags=tag1,tag2
        [HttpGet("paged")]
        public async Task<IActionResult> GetPagedBooks(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            string? tags = null)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;

            IQueryable<Book> query = _context.Books;

            query = query.Where(b =>
                (b.BooksCount != null && b.BooksCount != 0)
                );

            // Search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(b =>
                    (b.Title != null && b.Title.ToLower().Contains(search)) ||
                    (b.Authors != null && b.Authors.ToLower().Contains(search)) ||
                    (b.Series != null && b.Series.ToLower().Contains(search)) ||
                    (b.FirstPublishDate != null &&
                     b.FirstPublishDate.Value.ToString().Contains(search))
                );
            }

            var preFilteredBooks = await query
                .OrderBy(b => b.BookId)
                .ToListAsync();

            // Tag filter
            if (!string.IsNullOrWhiteSpace(tags))
            {
                var tagList = tags.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                  .Select(t => t.Trim().ToLower())
                                  .ToList();

                if (tagList.Any())
                {
                    preFilteredBooks = preFilteredBooks
                        .Where(b =>
                            b.Tags != null &&
                            tagList.All(tag =>
                                b.Tags.Any(bt =>
                                    string.Equals(bt, tag, StringComparison.OrdinalIgnoreCase)
                                )
                            )
                        )
                        .ToList();
                }
            }

            var totalBooks = preFilteredBooks.Count;
            var books = preFilteredBooks
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                totalBooks,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalBooks / (double)pageSize),
                books
            });
        }


        // GET: api/Books/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> GetBook(int id)
        {
            var book = await _context.Books.FindAsync(id);

            if (book == null)
            {
                return NotFound();
            }

            return book;
        }


        // GET: api/books/tags
        [HttpGet("tags")]
        public async Task<IActionResult> GetAllTags()
        {
            var books = await _context.Books
                .Where(b => b.BooksCount != null && b.BooksCount > 0 && b.Tags != null)
                .ToListAsync();

            var tags = books
                .SelectMany(b => b.Tags)
                .GroupBy(t => t)
                .OrderByDescending(g => g.Count()) // order by frequency
                .ThenBy(g => g.Key)    
                .Select(g => g.Key) // return only the tag
                .ToList();

            return Ok(tags);
        }


        // PUT: api/Books/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBook(int id, Book book)
        {
            if (id != book.BookId)
            {
                return BadRequest();
            }

            _context.Entry(book).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Books
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult> AddBook([FromBody] Book newBook)
        {
            if (newBook == null)
                return BadRequest();

            _context.Books.Add(newBook);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { id = newBook.BookId }, newBook);
        }

        // DELETE: api/Books/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null)
            {
                return NotFound();
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BookExists(int id)
        {
            return _context.Books.Any(e => e.BookId == id);
        }
    }
}
