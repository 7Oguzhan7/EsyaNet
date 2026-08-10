using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuctionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/auctions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Auction>>> GetAuctions([FromQuery] string? status)
        {
            var query = _context.Auctions
                .Include(a => a.LostItem)
                .Include(a => a.Winner)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status.ToLower() == status.ToLower());
            }

            var list = await query.OrderByDescending(a => a.StartDate).ToListAsync();
            return Ok(list);
        }

        // GET: api/auctions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Auction>> GetAuction(int id)
        {
            var auction = await _context.Auctions
                .Include(a => a.LostItem)
                .Include(a => a.Winner)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (auction == null)
            {
                return NotFound(new { Message = "İhale bulunamadı." });
            }

            var bids = await _context.Bids
                .Include(b => b.User)
                .Where(b => b.AuctionId == id)
                .OrderByDescending(b => b.Amount)
                .ToListAsync();

            return Ok(new
            {
                Auction = auction,
                Bids = bids
            });
        }

        // POST: api/auctions/create
        [HttpPost("create")]
        public async Task<ActionResult<Auction>> CreateAuction([FromBody] CreateAuctionDto dto)
        {
            var lostItem = await _context.LostItems.FindAsync(dto.LostItemId);
            if (lostItem == null)
            {
                return BadRequest(new { Message = "İhaleye çıkarılacak kayıp eşya bulunamadı." });
            }

            var existingAuction = await _context.Auctions.FirstOrDefaultAsync(a => a.LostItemId == dto.LostItemId && a.Status == "active");
            if (existingAuction != null)
            {
                return BadRequest(new { Message = "Bu eşya için zaten aktif bir ihale mevcut." });
            }

            var auction = new Auction
            {
                LostItemId = dto.LostItemId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(dto.DurationDays > 0 ? dto.DurationDays : 7),
                StartPrice = dto.StartPrice > 0 ? dto.StartPrice : 100,
                CurrentPrice = dto.StartPrice > 0 ? dto.StartPrice : 100,
                Status = "active"
            };

            _context.Auctions.Add(auction);

            // Update lost item status to ready_for_auction
            lostItem.Status = "ready_for_auction";
            
            await _context.SaveChangesAsync();

            return Ok(auction);
        }

        // POST: api/auctions/5/bids
        [HttpPost("{id}/bids")]
        public async Task<ActionResult<Bid>> PlaceBid(int id, [FromBody] PlaceBidDto dto)
        {
            var auction = await _context.Auctions.FindAsync(id);
            if (auction == null)
            {
                return NotFound(new { Message = "İhale bulunamadı." });
            }

            if (auction.Status != "active" || auction.EndDate < DateTime.UtcNow)
            {
                return BadRequest(new { Message = "Bu ihale aktif değil veya süresi dolmuş." });
            }

            if (dto.Amount <= auction.CurrentPrice)
            {
                return BadRequest(new { Message = $"Teklif miktarı mevcut fiyattan ({auction.CurrentPrice:N2} ₺) daha yüksek olmalıdır." });
            }

            var bid = new Bid
            {
                AuctionId = id,
                UserId = dto.UserId,
                Amount = dto.Amount,
                BidTime = DateTime.UtcNow
            };

            _context.Bids.Add(bid);

            // Update current price & potential winner
            auction.CurrentPrice = dto.Amount;
            auction.WinnerId = dto.UserId;

            await _context.SaveChangesAsync();

            return Ok(bid);
        }
    }

    public class CreateAuctionDto
    {
        public int LostItemId { get; set; }
        public decimal StartPrice { get; set; } = 100;
        public int DurationDays { get; set; } = 7;
    }

    public class PlaceBidDto
    {
        public int UserId { get; set; }
        public decimal Amount { get; set; }
    }
}
