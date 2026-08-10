using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DonationsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/donations/available
        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<LostItem>>> GetAvailableDonationItems()
        {
            var items = await _context.LostItems
                .Include(i => i.Institution)
                .Where(i => i.Status.ToLower() == "donated" || i.Status.ToLower() == "no_bid_ended")
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/donations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Donation>>> GetAllDonations()
        {
            var donations = await _context.Donations
                .Include(d => d.LostItem)
                    .ThenInclude(i => i!.Institution)
                .Include(d => d.Recipient)
                .OrderByDescending(d => d.RequestDate)
                .ToListAsync();

            return Ok(donations);
        }

        // GET: api/donations/my-requests/5
        [HttpGet("my-requests/{userId}")]
        public async Task<ActionResult<IEnumerable<Donation>>> GetUserDonations(int userId)
        {
            var donations = await _context.Donations
                .Include(d => d.LostItem)
                    .ThenInclude(i => i!.Institution)
                .Where(d => d.RecipientId == userId)
                .OrderByDescending(d => d.RequestDate)
                .ToListAsync();

            return Ok(donations);
        }

        // POST: api/donations/request
        [HttpPost("request")]
        public async Task<IActionResult> RequestDonation([FromBody] CreateDonationRequestDto dto)
        {
            if (dto.LostItemId <= 0 || dto.RecipientId <= 0)
            {
                return BadRequest(new { Message = "Geçersiz eşya veya kullanıcı ID'si." });
            }

            var lostItem = await _context.LostItems.FindAsync(dto.LostItemId);
            if (lostItem == null)
            {
                return NotFound(new { Message = "Bağış eşyası bulunamadı." });
            }

            if (lostItem.Status.ToLower() != "donated" && lostItem.Status.ToLower() != "no_bid_ended")
            {
                return BadRequest(new { Message = "Bu eşya şu anda ücretsiz bağış havuzunda değil." });
            }

            var existingPending = await _context.Donations
                .FirstOrDefaultAsync(d => d.LostItemId == dto.LostItemId && d.RecipientId == dto.RecipientId && d.Status.ToLower() == "pending");

            if (existingPending != null)
            {
                return BadRequest(new { Message = "Bu eşya için zaten bekleyen bir bağış talebiniz var." });
            }

            var donation = new Donation
            {
                LostItemId = dto.LostItemId,
                RecipientId = dto.RecipientId,
                RequestDate = DateTime.UtcNow,
                Status = "pending"
            };

            _context.Donations.Add(donation);
            lostItem.Status = "donated";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Ücretsiz bağış talebiniz alındı. Kurum onayından sonra bilgilendirileceksiniz.",
                Donation = donation
            });
        }

        // PUT: api/donations/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateDonationStatus(int id, [FromBody] UpdateDonationStatusDto dto)
        {
            var donation = await _context.Donations
                .Include(d => d.LostItem)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (donation == null)
            {
                return NotFound(new { Message = "Bağış talebi bulunamadı." });
            }

            var validStatuses = new[] { "pending", "approved", "rejected", "delivered" };
            if (!validStatuses.Contains(dto.Status.ToLower()))
            {
                return BadRequest(new { Message = "Geçersiz bağış statüsü. Geçerli statüler: pending, approved, rejected, delivered." });
            }

            donation.Status = dto.Status.ToLower();

            if (donation.LostItem != null)
            {
                if (dto.Status.ToLower() == "delivered")
                {
                    donation.LostItem.Status = "donated_delivered";
                }
                else if (dto.Status.ToLower() == "rejected")
                {
                    // Check if other requests exist, if not keep as donated
                    donation.LostItem.Status = "donated";
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Bağış talebi statüsü güncellendi.",
                Donation = donation
            });
        }

        // POST: api/donations/move-to-donation/5
        [HttpPost("move-to-donation/{lostItemId}")]
        public async Task<IActionResult> MoveToDonation(int lostItemId)
        {
            var lostItem = await _context.LostItems.FindAsync(lostItemId);
            if (lostItem == null)
            {
                return NotFound(new { Message = "Eşya bulunamadı." });
            }

            lostItem.Status = "donated";

            var auction = await _context.Auctions.FirstOrDefaultAsync(a => a.LostItemId == lostItemId && a.Status == "active");
            if (auction != null)
            {
                auction.Status = "no_bid_ended";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Eşya başarıyla İhtiyaç Sahibi Bağış Havuzuna aktarıldı.",
                LostItem = lostItem
            });
        }
    }

    public class CreateDonationRequestDto
    {
        public int LostItemId { get; set; }
        public int RecipientId { get; set; }
    }

    public class UpdateDonationStatusDto
    {
        public string Status { get; set; } = "pending";
    }
}
