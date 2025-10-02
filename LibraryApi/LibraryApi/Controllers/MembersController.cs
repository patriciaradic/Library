using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LibraryApi.Data;
using LibraryApi.Models;

namespace LibraryApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MembersController : ControllerBase
    {
        private readonly LibraryContext _context;

        public MembersController(LibraryContext context)
        {
            _context = context;
        }

        // GET: api/Members
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Member>>> GetMembers()
        {
            return await _context.Members.ToListAsync();
        }

        // GET: api/Members/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Member>> GetMember(int id)
        {
            var member = await _context.Members.FindAsync(id);

            if (member == null)
            {
                return NotFound();
            }

            return member;
        }

        // GET: api/members/paged?page=1&pageSize=10
        [HttpGet("paged")]
        public async Task<IActionResult> GetPagedMembers(
            int page = 1,
            int pageSize = 10,
            string? search = null)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;

            IQueryable<Member> query = _context.Members;

            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(m =>
                    m.MemberName != null && m.MemberName.ToLower().Contains(search) ||
                    m.LibraryCardId != null && m.LibraryCardId.ToString().Contains(search)
                );
            }

            var totalMembers = await query.CountAsync();

            var members = await query
                .OrderBy(m => m.MemberId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                totalMembers,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(totalMembers / (double)pageSize),
                members
            });
        }

        // GET: api/members/eligible
        [HttpGet("eligible")]
        public async Task<IActionResult> GetEligibleMembers()
        {
            var today = DateTime.UtcNow;

            var eligibleMembers = await _context.Members
                .Where(m => m.MembershipValidTo != null && m.MembershipValidTo >= today)
                .Select(m => new
                {
                    m.MemberId,
                    m.MemberName,
                    m.LibraryCardId,
                    m.Email,
                    m.MembershipValidTo,
                    ActiveBorrowCount = m.Borrowed
                        .Where(b => b.ReturnedDate == null)
                        .Select(b => b.BookId)
                        .Distinct()
                        .Count()
                })
                .Where(m => m.ActiveBorrowCount < 5)
                .OrderBy(m => m.MemberName)
                .ToListAsync();

            return Ok(eligibleMembers);
        }



        // PUT: api/Members/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMember(int id, Member member)
        {
            if (id != member.MemberId)
            {
                return BadRequest();
            }

            _context.Entry(member).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MemberExists(id))
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

        // POST: api/Members
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Member>> PostMember(Member member)
        {
            var now = DateTime.Now;

            member.FirstMembershipDate = now;
            member.LastMembershipDate = now;
            member.MembershipValidTo = now.AddYears(1);

            var yearPrefix = now.Year.ToString();
            var membersThisYear = await _context.Members
                .Where(m => m.FirstMembershipDate.HasValue && 
                    m.FirstMembershipDate.Value.Year == now.Year)
                .CountAsync();

            var seqNumber = membersThisYear + 1;
            member.LibraryCardId = int.Parse(yearPrefix + seqNumber.ToString().PadLeft(4, '0'));

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMember", new { id = member.MemberId }, member);
        }

        // DELETE: api/Members/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var member = await _context.Members.FindAsync(id);
            if (member == null)
            {
                return NotFound();
            }

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MemberExists(int id)
        {
            return _context.Members.Any(e => e.MemberId == id);
        }
    }
}
