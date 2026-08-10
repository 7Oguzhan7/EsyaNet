using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SystemController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SystemController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                // Verify database connection by checking if we can query institutions
                var canConnect = await _context.Database.CanConnectAsync();
                var institutionCount = await _context.Institutions.CountAsync();

                return Ok(new
                {
                    Status = "Healthy",
                    DatabaseConnection = canConnect ? "Connected" : "Disconnected",
                    InstitutionCount = institutionCount,
                    Message = "ASP.NET Core Web API ve PostgreSQL veritabanı bağlantısı başarıyla kuruldu!"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Status = "Unhealthy",
                    DatabaseConnection = "Error",
                    Error = ex.Message,
                    Message = "Veritabanı bağlantısı doğrulanırken bir hata oluştu."
                });
            }
        }
        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics()
        {
            try
            {
                var lostItems = await _context.LostItems.Include(i => i.Institution).ToListAsync();
                var payments = await _context.Payments.ToListAsync();
                var donations = await _context.Donations.ToListAsync();
                var users = await _context.Users.ToListAsync();
                var institutions = await _context.Institutions.ToListAsync();
                var auctions = await _context.Auctions.ToListAsync();

                var totalLostItems = lostItems.Count;
                var totalAuctions = auctions.Count;
                var totalAuctionRevenue = payments
                    .Where(p => p.PaymentStatus == "paid")
                    .Sum(p => p.Amount);

                var totalDonations = donations.Count(d => d.Status == "approved");
                var totalDeliveredToOwner = lostItems.Count(i => i.Status == "delivered_owner");
                var totalCitizens = users.Count(u => u.Role == "citizen");
                var totalInstitutions = institutions.Count;

                var categories = lostItems
                    .GroupBy(i => i.Category)
                    .Select(g => new { Category = g.Key ?? "Diğer", Count = g.Count() })
                    .ToList();

                var statuses = lostItems
                    .GroupBy(i => i.Status)
                    .Select(g => new { Status = g.Key ?? "Bilinmiyor", Count = g.Count() })
                    .ToList();

                var institutionItems = lostItems
                    .Where(i => i.Institution != null)
                    .GroupBy(i => i.Institution!.Name)
                    .Select(g => new { InstitutionName = g.Key, Count = g.Count() })
                    .ToList();

                return Ok(new
                {
                    Summary = new
                    {
                        TotalLostItems = totalLostItems,
                        TotalAuctions = totalAuctions,
                        TotalAuctionRevenue = totalAuctionRevenue,
                        TotalDonations = totalDonations,
                        TotalDeliveredToOwner = totalDeliveredToOwner,
                        TotalCitizens = totalCitizens,
                        TotalInstitutions = totalInstitutions
                    },
                    Categories = categories,
                    Statuses = statuses,
                    InstitutionItems = institutionItems
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message, Inner = ex.InnerException?.Message });
            }
        }
    }
}
