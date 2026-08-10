using System;
using System.Linq;
using backend.Models;

namespace backend.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            context.Database.EnsureCreated();

            // 1. Kurumlar (Institutions)
            if (!context.Institutions.Any())
            {
                var inst1 = new Institution
                {
                    Name = "Kadıköy Zabıta Amirliği",
                    Address = "Osmanağa Mah. Söğütlüçeşme Cd. No:45 Kadıköy/İstanbul",
                    Latitude = 40.99010000m,
                    Longitude = 29.02910000m,
                    ContactNumber = "0216 550 00 00"
                };

                var inst2 = new Institution
                {
                    Name = "İETT Topkapı Kayıp Eşya Bürosu",
                    Address = "Topkapı Merkez Mah. Seyitnizam Cd. Zeytinburnu/İstanbul",
                    Latitude = 41.01520000m,
                    Longitude = 28.92150000m,
                    ContactNumber = "0212 567 89 00"
                };

                var inst3 = new Institution
                {
                    Name = "Beşiktaş Belediyesi Zabıta Müdürlüğü",
                    Address = "Nisbetiye Mah. Aytar Cd. No:2 Beşiktaş/İstanbul",
                    Latitude = 41.07450000m,
                    Longitude = 29.01420000m,
                    ContactNumber = "0212 319 42 00"
                };

                context.Institutions.AddRange(inst1, inst2, inst3);
                context.SaveChanges();
            }

            // 2. Kullanıcılar (Users)
            if (!context.Users.Any())
            {
                string defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("123456");

                var kadikoyInst = context.Institutions.FirstOrDefault(i => i.Name.Contains("Kadıköy"));
                var iettInst = context.Institutions.FirstOrDefault(i => i.Name.Contains("İETT"));

                var user1 = new User
                {
                    NameSurname = "Ahmet Yılmaz",
                    Email = "ahmet@gmail.com",
                    PasswordHash = defaultPasswordHash,
                    Role = "citizen",
                    Phone = "0555 123 45 67",
                    CreatedAt = DateTime.UtcNow
                };

                var user2 = new User
                {
                    NameSurname = "Mehmet Yetkili (Kadıköy Zabıta)",
                    Email = "zabita@kadikoy.bel.tr",
                    PasswordHash = defaultPasswordHash,
                    Role = "institution",
                    Phone = "0216 550 00 01",
                    InstitutionId = kadikoyInst?.Id,
                    CreatedAt = DateTime.UtcNow
                };

                var user3 = new User
                {
                    NameSurname = "Ayşe Demir (İETT Kayıp Eşya)",
                    Email = "iett@iett.gov.tr",
                    PasswordHash = defaultPasswordHash,
                    Role = "institution",
                    Phone = "0212 567 89 01",
                    InstitutionId = iettInst?.Id,
                    CreatedAt = DateTime.UtcNow
                };

                var user4 = new User
                {
                    NameSurname = "Sistem Yöneticisi",
                    Email = "admin@kayipesya.gov.tr",
                    PasswordHash = defaultPasswordHash,
                    Role = "admin",
                    Phone = "0850 123 00 00",
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.AddRange(user1, user2, user3, user4);
                context.SaveChanges();
            }

            // 3. Kayıp Eşyalar (LostItems)
            if (!context.LostItems.Any())
            {
                var kadikoyInst = context.Institutions.FirstOrDefault(i => i.Name.Contains("Kadıköy"));
                var iettInst = context.Institutions.FirstOrDefault(i => i.Name.Contains("İETT"));
                var besiktasInst = context.Institutions.FirstOrDefault(i => i.Name.Contains("Beşiktaş"));

                var item1 = new LostItem
                {
                    Title = "iPhone 15 Pro Max",
                    Description = "Kadıköy Rıhtım durağında siyah kılıflı telefon bulundu.",
                    Category = "Elektronik",
                    DateFound = DateTime.UtcNow.AddDays(-5),
                    LocationFound = "Kadıköy Rıhtım Durağı",
                    ImageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
                    InstitutionId = kadikoyInst?.Id,
                    Status = "waiting_owner",
                    CreatedAt = DateTime.UtcNow
                };

                var item2 = new LostItem
                {
                    Title = "Kahverengi Deri Cüzdan",
                    Description = "İçerisinde sürücü belgesi ve bir miktar nakit para var.",
                    Category = "Kişisel Eşya",
                    DateFound = DateTime.UtcNow.AddDays(-10),
                    LocationFound = "Topkapı Tramvay Durağı",
                    ImageUrl = "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
                    InstitutionId = iettInst?.Id,
                    Status = "ready_for_auction",
                    CreatedAt = DateTime.UtcNow
                };

                var item3 = new LostItem
                {
                    Title = "Siyah HP Sırt Çantası & Şarj Aleti",
                    Description = "İçinde HP şarj aleti ve ders notları mevcut.",
                    Category = "Çanta & Aksesuar",
                    DateFound = DateTime.UtcNow.AddDays(-40),
                    LocationFound = "Beşiktaş Meydan",
                    ImageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
                    InstitutionId = besiktasInst?.Id,
                    Status = "in_auction",
                    CreatedAt = DateTime.UtcNow
                };

                var item4 = new LostItem
                {
                    Title = "Kışlık Bebek Montu ve Eldiven Seti",
                    Description = "Mavi renkli kışlık mont ve eldiven takımı.",
                    Category = "Giyim & Tekstil",
                    DateFound = DateTime.UtcNow.AddDays(-45),
                    LocationFound = "Kadıköy Modapark",
                    ImageUrl = "https://images.unsplash.com/photo-1519702777585-07f121d38954?w=600",
                    InstitutionId = kadikoyInst?.Id,
                    Status = "donated",
                    CreatedAt = DateTime.UtcNow
                };

                context.LostItems.AddRange(item1, item2, item3, item4);
                context.SaveChanges();
            }

            // 4. Açık Artırmalar (Auctions)
            if (!context.Auctions.Any())
            {
                var auctionItem = context.LostItems.FirstOrDefault(i => i.Status == "in_auction");
                if (auctionItem != null)
                {
                    var auction = new Auction
                    {
                        LostItemId = auctionItem.Id,
                        StartDate = DateTime.UtcNow.AddDays(-1),
                        EndDate = DateTime.UtcNow.AddDays(2),
                        StartPrice = 250.00m,
                        CurrentPrice = 350.00m,
                        Status = "active"
                    };

                    context.Auctions.Add(auction);
                    context.SaveChanges();

                    var ahmetUser = context.Users.FirstOrDefault(u => u.Email == "ahmet@gmail.com");
                    if (ahmetUser != null)
                    {
                        var bid = new Bid
                        {
                            AuctionId = auction.Id,
                            UserId = ahmetUser.Id,
                            Amount = 350.00m,
                            BidTime = DateTime.UtcNow.AddHours(-2)
                        };
                        context.Bids.Add(bid);
                        context.SaveChanges();
                    }
                }
            }

            // 5. Bağışlar (Donations)
            if (!context.Donations.Any())
            {
                var donatedItem = context.LostItems.FirstOrDefault(i => i.Status == "donated");
                var ahmetUser = context.Users.FirstOrDefault(u => u.Email == "ahmet@gmail.com");
                if (donatedItem != null && ahmetUser != null)
                {
                    var donation = new Donation
                    {
                        LostItemId = donatedItem.Id,
                        RecipientId = ahmetUser.Id,
                        RequestDate = DateTime.UtcNow.AddDays(-1),
                        Status = "approved"
                    };

                    context.Donations.Add(donation);
                    context.SaveChanges();
                }
            }

            // 6. Mesajlar (Messages)
            if (!context.Messages.Any())
            {
                var ahmetUser = context.Users.FirstOrDefault(u => u.Email == "ahmet@gmail.com");
                var kadikoyInst = context.Institutions.FirstOrDefault(i => i.Name.Contains("Kadıköy"));
                
                if (ahmetUser != null && kadikoyInst != null)
                {
                    var msg1 = new Message
                    {
                        FromUserId = ahmetUser.Id,
                        FromName = ahmetUser.NameSurname,
                        ToInstId = kadikoyInst.Id,
                        ToInstName = kadikoyInst.Name,
                        ToUserId = null,
                        ToRole = "institution",
                        MsgType = "Yardım",
                        Text = "Merhaba, Kadıköy Rıhtım durağında kaybettiğim siyah kılıflı iPhone 15 Pro Max telefonum şubenizde mi acaba? Hak sahipliği talebi oluşturdum.",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow.AddHours(-3)
                    };

                    var msg2 = new Message
                    {
                        FromUserId = 2, // Mehmet Yetkili's ID (Kadıköy Zabıta)
                        FromName = "Mehmet Yetkili (Kadıköy Zabıta)",
                        ToInstId = kadikoyInst.Id,
                        ToInstName = kadikoyInst.Name,
                        ToUserId = ahmetUser.Id,
                        ToRole = "citizen",
                        MsgType = "Genel",
                        Text = "Merhaba Ahmet Bey, evet telefonunuz şu an şubemizde muhafaza edilmektedir. Fatura kanıtınız onaylandıktan sonra gelip teslim alabilirsiniz.",
                        IsRead = true,
                        CreatedAt = DateTime.UtcNow.AddHours(-2)
                    };

                    context.Messages.AddRange(msg1, msg2);
                    context.SaveChanges();
                }
            }
        }
    }
}
