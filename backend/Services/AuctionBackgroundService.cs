using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Services
{
    public class AuctionBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuctionBackgroundService> _logger;

        public AuctionBackgroundService(IServiceProvider serviceProvider, ILogger<AuctionBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[AuctionBackgroundService] Arka plan ihale yönetim servisi başlatıldı.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                        // 1. Check for expired active auctions and finalize them
                        var expiredAuctions = await dbContext.Auctions
                            .Where(a => a.Status == "active" && a.EndDate <= DateTime.UtcNow)
                            .ToListAsync(stoppingToken);

                        foreach (var auction in expiredAuctions)
                        {
                            var topBid = await dbContext.Bids
                                .Where(b => b.AuctionId == auction.Id)
                                .OrderByDescending(b => b.Amount)
                                .FirstOrDefaultAsync(stoppingToken);

                            if (topBid != null)
                            {
                                auction.Status = "completed";
                                auction.WinnerId = topBid.UserId;
                                auction.CurrentPrice = topBid.Amount;
                                _logger.LogInformation($"[AuctionBackgroundService] İhale #{auction.Id} tamamlandı! Kazanan User ID: {topBid.UserId}, Son Fiyat: {topBid.Amount} ₺");
                            }
                            else
                            {
                                auction.Status = "no_bid_ended";
                                _logger.LogInformation($"[AuctionBackgroundService] İhale #{auction.Id} teklif alınamadan sona erdi.");
                            }
                        }

                        // 2. Check for lost items waiting > 30 days and auto-promote to ready_for_auction
                        var thresholdDate = DateTime.UtcNow.AddDays(-30);
                        var eligibleItems = await dbContext.LostItems
                            .Where(i => i.Status == "waiting_owner" && i.DateFound <= thresholdDate)
                            .ToListAsync(stoppingToken);

                        foreach (var item in eligibleItems)
                        {
                            item.Status = "ready_for_auction";
                            _logger.LogInformation($"[AuctionBackgroundService] Eşya #{item.Id} ({item.Title}) 30 günlük yasal bekleme süresini doldurdu, ihaleye açıldı.");
                        }

                        if (expiredAuctions.Any() || eligibleItems.Any())
                        {
                            await dbContext.SaveChangesAsync(stoppingToken);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[AuctionBackgroundService] Arka plan döngüsünde hata oluştu.");
                }

                // Run check every 30 seconds
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }
}
