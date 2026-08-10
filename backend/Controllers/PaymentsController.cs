using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PaymentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/payments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Auction)
                    .ThenInclude(a => a!.LostItem)
                .Include(p => p.User)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return Ok(payments);
        }

        // GET: api/payments/my-payments/5
        [HttpGet("my-payments/{userId}")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetUserPayments(int userId)
        {
            var payments = await _context.Payments
                .Include(p => p.Auction)
                    .ThenInclude(a => a!.LostItem)
                .Include(p => p.User)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();

            return Ok(payments);
        }

        // POST: api/payments
        [HttpPost]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDto dto)
        {
            if (dto.AuctionId <= 0 || dto.UserId <= 0)
            {
                return BadRequest(new { Message = "Geçersiz ihale veya kullanıcı ID'si." });
            }

            var auction = await _context.Auctions
                .Include(a => a.LostItem)
                .FirstOrDefaultAsync(a => a.Id == dto.AuctionId);

            if (auction == null)
            {
                return NotFound(new { Message = "İhale bulunamadı." });
            }

            var existingPayment = await _context.Payments
                .FirstOrDefaultAsync(p => p.AuctionId == dto.AuctionId && p.PaymentStatus == "paid");

            if (existingPayment != null)
            {
                return BadRequest(new { Message = "Bu ihale için zaten ödeme yapılmıştır." });
            }

            var payment = new Payment
            {
                AuctionId = dto.AuctionId,
                UserId = dto.UserId,
                Amount = dto.Amount > 0 ? dto.Amount : auction.CurrentPrice,
                PaymentStatus = "paid",
                DeliveryStatus = "pending",
                PaymentDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);

            if (auction.LostItem != null)
            {
                auction.LostItem.Status = "sold";
            }
            auction.Status = "completed";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Ödeme başarıyla tamamlandı. Teslimat süreci başlatıldı.",
                Payment = payment
            });
        }

        // PUT: api/payments/5/delivery-status
        [HttpPut("{id}/delivery-status")]
        public async Task<IActionResult> UpdateDeliveryStatus(int id, [FromBody] UpdateDeliveryStatusDto dto)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return NotFound(new { Message = "Ödeme kaydı bulunamadı." });
            }

            var validStatuses = new[] { "pending", "shipped", "delivered" };
            if (!validStatuses.Contains(dto.DeliveryStatus.ToLower()))
            {
                return BadRequest(new { Message = "Geçersiz teslimat statüsü. Geçerli statüler: pending, shipped, delivered." });
            }

            payment.DeliveryStatus = dto.DeliveryStatus.ToLower();
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Teslimat durumu güncellendi.",
                Payment = payment
            });
        }
    }

    public class ProcessPaymentDto
    {
        public int AuctionId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string? CardHolderName { get; set; }
        public string? CardNumber { get; set; }
        public string? ExpirationDate { get; set; }
        public string? Cvc { get; set; }
    }

    public class UpdateDeliveryStatusDto
    {
        public string DeliveryStatus { get; set; } = "pending";
    }
}
