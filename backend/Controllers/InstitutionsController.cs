using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstitutionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InstitutionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/institutions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Institution>>> GetInstitutions()
        {
            return await _context.Institutions.ToListAsync();
        }

        // GET: api/institutions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Institution>> GetInstitution(int id)
        {
            var institution = await _context.Institutions.FindAsync(id);

            if (institution == null)
            {
                return NotFound(new { Message = "Kurum bulunamadı." });
            }

            return institution;
        }

        // POST: api/institutions
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<Institution>> PostInstitution(Institution institution)
        {
            _context.Institutions.Add(institution);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInstitution), new { id = institution.Id }, institution);
        }

        // PUT: api/institutions/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutInstitution(int id, Institution institution)
        {
            if (id != institution.Id)
            {
                return BadRequest(new { Message = "ID uyuşmazlığı." });
            }

            _context.Entry(institution).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InstitutionExists(id))
                {
                    return NotFound(new { Message = "Kurum bulunamadı." });
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/institutions/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteInstitution(int id)
        {
            var institution = await _context.Institutions.FindAsync(id);
            if (institution == null)
            {
                return NotFound(new { Message = "Kurum bulunamadı." });
            }

            _context.Institutions.Remove(institution);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Kurum başarıyla silindi." });
        }

        private bool InstitutionExists(int id)
        {
            return _context.Institutions.Any(e => e.Id == id);
        }
    }
}
