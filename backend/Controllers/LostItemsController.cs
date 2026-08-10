using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LostItemsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LostItemsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/lostitems
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LostItem>>> GetLostItems(
            [FromQuery] string? category,
            [FromQuery] string? status,
            [FromQuery] int? institutionId,
            [FromQuery] string? searchTerm)
        {
            var query = _context.LostItems.Include(li => li.Institution).AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(li => li.Category.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(li => li.Status.ToLower() == status.ToLower());
            }

            if (institutionId.HasValue)
            {
                query = query.Where(li => li.InstitutionId == institutionId.Value);
            }

            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearch = searchTerm.ToLower();
                query = query.Where(li => 
                    (li.Title != null && li.Title.ToLower().Contains(lowerSearch)) || 
                    (li.Description != null && li.Description.ToLower().Contains(lowerSearch)) ||
                    (li.LocationFound != null && li.LocationFound.ToLower().Contains(lowerSearch))
                );
            }

            return await query.OrderByDescending(li => li.CreatedAt).ToListAsync();
        }

        // GET: api/lostitems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LostItem>> GetLostItem(int id)
        {
            var lostItem = await _context.LostItems
                .Include(li => li.Institution)
                .FirstOrDefaultAsync(li => li.Id == id);

            if (lostItem == null)
            {
                return NotFound(new { Message = "Kayıp eşya bulunamadı." });
            }

            return lostItem;
        }

        // POST: api/lostitems
        [HttpPost]
        [Authorize(Roles = "institution,admin")]
        public async Task<ActionResult<LostItem>> PostLostItem(LostItem lostItem)
        {
            // Set local created_at to UtcNow
            lostItem.CreatedAt = DateTime.UtcNow;

            // If DateFound is Local, convert to Utc
            if (lostItem.DateFound.Kind != DateTimeKind.Utc)
            {
                lostItem.DateFound = DateTime.SpecifyKind(lostItem.DateFound, DateTimeKind.Utc);
            }

            _context.LostItems.Add(lostItem);
            await _context.SaveChangesAsync();

            // Load institution if present for response
            if (lostItem.InstitutionId.HasValue)
            {
                await _context.Entry(lostItem).Reference(li => li.Institution).LoadAsync();
            }

            return CreatedAtAction(nameof(GetLostItem), new { id = lostItem.Id }, lostItem);
        }

        // PUT: api/lostitems/5
        [HttpPut("{id}")]
        [Authorize(Roles = "institution,admin")]
        public async Task<IActionResult> PutLostItem(int id, LostItem lostItem)
        {
            if (id != lostItem.Id)
            {
                return BadRequest(new { Message = "ID uyuşmazlığı." });
            }

            // Ensure dates are Utc
            if (lostItem.DateFound.Kind != DateTimeKind.Utc)
            {
                lostItem.DateFound = DateTime.SpecifyKind(lostItem.DateFound, DateTimeKind.Utc);
            }
            if (lostItem.CreatedAt.Kind != DateTimeKind.Utc)
            {
                lostItem.CreatedAt = DateTime.SpecifyKind(lostItem.CreatedAt, DateTimeKind.Utc);
            }

            _context.Entry(lostItem).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LostItemExists(id))
                {
                    return NotFound(new { Message = "Kayıp eşya bulunamadı." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PATCH/PUT: api/lostitems/5/status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "institution,admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateRequest request)
        {
            var lostItem = await _context.LostItems.FindAsync(id);
            if (lostItem == null)
            {
                return NotFound(new { Message = "Kayıp eşya bulunamadı." });
            }

            // Validate new status
            var validStatuses = new[] { "waiting_owner", "delivered_owner", "ready_for_auction", "in_auction", "sold", "donated" };
            if (!validStatuses.Contains(request.Status.ToLower()))
            {
                return BadRequest(new { Message = "Geçersiz eşya durumu." });
            }

            lostItem.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Eşya durumu başarıyla güncellendi.", CurrentStatus = lostItem.Status });
        }

        // DELETE: api/lostitems/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "institution,admin")]
        public async Task<IActionResult> DeleteLostItem(int id)
        {
            var lostItem = await _context.LostItems.FindAsync(id);
            if (lostItem == null)
            {
                return NotFound(new { Message = "Kayıp eşya bulunamadı." });
            }

            _context.LostItems.Remove(lostItem);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Kayıp eşya başarıyla silindi." });
        }

        private bool LostItemExists(int id)
        {
            return _context.LostItems.Any(e => e.Id == id);
        }
    }

    public class StatusUpdateRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
