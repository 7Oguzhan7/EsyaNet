# Kayıp Eşya Açık Artırma ve Satın Alma Sistemi - Proje Yol Haritası

Bu belge, staj projenizin başarılı, modüler ve hocanızın beklentilerini karşılayacak şekilde geliştirilmesi için hazırlanan kapsamlı yol haritasıdır.

---

## 1. Modüller ve Kapsam

Sistem, temel kayıp eşya takibinin ötesine geçerek eklediğiniz yenilikçi fikirlerle (Harita entegrasyonu, İhtiyaç sahiplerine ücretsiz bağış) zenginleştirilmiştir. Projeyi **3 ana rol** üzerinden modüler olarak tasarlayacağız:

### A. Vatandaş (Kullanıcı) Modülü
*   **Kayıt & Giriş:** Sisteme üye olma ve profil yönetimi.
*   **Kayıtlı Eşya Arama & Sorgulama:** Kaybolan eşyaların sorgulanması.
*   **Harita Entegrasyonu (Yenilikçi Fikir 1):** Eşyanın hangi kurumda/şubede olduğunu gösteren interaktif harita (Leaflet.js veya Google Maps).
*   **Açık Artırma Katılımı:** Aktif açık artırmaları listeleme, pey (teklif) verme, teklif geçmişini izleme.
*   **Ödeme ve Teslimat Takibi:** Kazanılan ürünün sanal ödemesini gerçekleştirme ve teslimat sürecini (kargo/elden teslim) takip etme.
*   **Ücretsiz Bağış Talebi (Yenilikçi Fikir 2):** Açık artırma süresi dolan ve satılamayan eşyaların, ihtiyaç sahibi vatandaşlar tarafından ücretsiz talep edilebilmesi.

### B. Kurum / Yönetici (Admin) Modülü
*   **Kayıt & Giriş:** Kurum yetkililerinin sisteme girişi.
*   **Kayıp Eşya Kaydı:** Kuruma getirilen eşyaların kategori, tarih, durum ve kurum konumuyla sisteme girilmesi.
*   **Sahip Eşleştirme:** Eşya sahibinin çıkması durumunda eşyanın "Sahibine Teslim Edildi" olarak işaretlenmesi.
*   **Açık Artırma Başlatma:** Sahibi çıkmayan eşyaların başlangıç fiyatı, başlangıç/bitiş tarihi belirlenerek açık artırmaya sunulması.
*   **Bağışa Yönlendirme:** Açık artırmada satılmayan eşyaların "İhtiyaç Sahibine Bağış" statüsüne geçirilmesi ve taleplerin onaylanması.
*   **Raporlama ve İstatistikler:** Satış gelirleri, bulunan eşya sayıları ve teslimat istatistiklerinin grafiklerle raporlanması.

---

## 2. PostgreSQL Veritabanı Tablo Tasarımı (Taslak)

İlişkisel veritabanı yapısını PostgreSQL kullanarak kuracağız. Tablolar ve aralarındaki ilişkiler şu şekildedir:

### `users` (Kullanıcılar)
Sistemdeki tüm kullanıcılar (Vatandaş, Kurum Temsilcisi, Admin) bu tabloda tutulur.
*   `id` (SERIAL, Primary Key)
*   `name_surname` (VARCHAR)
*   `email` (VARCHAR, Unique)
*   `password_hash` (VARCHAR)
*   `role` (VARCHAR) -> `'citizen'`, `'institution'`, `'admin'`
*   `phone` (VARCHAR)
*   `institution_id` (INTEGER, Foreign Key -> `institutions.id`)
*   `created_at` (TIMESTAMP)

### `institutions` (Kurumlar/Şubeler)
Eşyaların bulunduğu fiziksel konumlar ve harita bilgileri.
*   `id` (SERIAL, Primary Key)
*   `name` (VARCHAR) -> Örneğin: "Kadıköy Belediyesi", "Metro İstanbul A.Ş."
*   `address` (TEXT)
*   `latitude` (DECIMAL) -> Harita koordinatı
*   `longitude` (DECIMAL) -> Harita koordinatı
*   `contact_number` (VARCHAR)

### `lost_items` (Kayıp Eşyalar)
Sisteme kaydedilen tüm eşyaların ana tablosu.
*   `id` (SERIAL, Primary Key)
*   `title` (VARCHAR)
*   `description` (TEXT)
*   `category` (VARCHAR) -> Telefon, Cüzdan, Anahtar vb.
*   `date_found` (DATE)
*   `location_found` (VARCHAR) -> Bulunduğu yer (Örn: 500T Otobüsü)
*   `institution_id` (INTEGER, Foreign Key -> `institutions.id`)
*   `status` (VARCHAR) -> `'waiting_owner'`, `'delivered_owner'`, `'ready_for_auction'`, `'in_auction'`, `'sold'`, `'donated'`
*   `created_at` (TIMESTAMP)

### `auctions` (Açık Artırmalar)
Açık artırma süreçlerinin yönetildiği tablo.
*   `id` (SERIAL, Primary Key)
*   `lost_item_id` (INTEGER, Foreign Key -> `lost_items.id`)
*   `start_date` (TIMESTAMP)
*   `end_date` (TIMESTAMP)
*   `start_price` (DECIMAL)
*   `current_price` (DECIMAL)
*   `status` (VARCHAR) -> `'pending'`, `'active'`, `'completed'`, `'no_bid_ended'`
*   `winner_id` (INTEGER, Foreign Key -> `users.id`, Nullable)

### `bids` (Teklifler)
Açık artırmalara verilen tekliflerin geçmişi.
*   `id` (SERIAL, Primary Key)
*   `auction_id` (INTEGER, Foreign Key -> `auctions.id`)
*   `user_id` (INTEGER, Foreign Key -> `users.id`)
*   `amount` (DECIMAL)
*   `bid_time` (TIMESTAMP)

### `payments` (Ödemeler ve Teslimat)
Açık artırmayı kazananların ödeme ve teslimat takibi.
*   `id` (SERIAL, Primary Key)
*   `auction_id` (INTEGER, Foreign Key -> `auctions.id`)
*   `user_id` (INTEGER, Foreign Key -> `users.id`)
*   `amount` (DECIMAL)
*   `payment_status` (VARCHAR) -> `'pending'`, `'paid'`, `'failed'`
*   `delivery_status` (VARCHAR) -> `'pending'`, `'shipped'`, `'delivered'`
*   `payment_date` (TIMESTAMP)

### `donations` (Bağış Talepleri)
Satılamayan ürünlerin ihtiyaç sahiplerine verilme süreci.
*   `id` (SERIAL, Primary Key)
*   `lost_item_id` (INTEGER, Foreign Key -> `lost_items.id`)
*   `recipient_id` (INTEGER, Foreign Key -> `users.id`)
*   `request_date` (TIMESTAMP)
*   `status` (VARCHAR) -> `'pending'`, `'approved'`, `'rejected'`, `'delivered'`

---

## 3. Adım Adım Geliştirme Yol Haritası

Projeyi modüler olarak geliştirmek için izleyeceğimiz adımlar:

*   **Adım 1: Analiz ve Tasarım (Tamamlandı)**
    *   Draw.io akış şemasının çizilmesi ve PDF olarak kaydedilmesi.
    *   Veritabanı tablolarının (PostgreSQL DDL scriptlerinin) netleştirilmesi.
*   **Adım 2: Veritabanı ve Proje Altyapısının Kurulması (Şu Anki Aşama)**
    *   PostgreSQL veritabanının kurulması ve tabloların oluşturulması.
    *   Backend (ASP.NET Core Web API) ve Frontend (React - JS) projelerinin oluşturulması.
*   **Adım 3: Kayıp Eşya ve Kurum Yönetimi (Modül 1)**
    *   Kurumların sisteme eklenmesi, harita koordinatlarının belirlenmesi.
    *   Kayıp eşya kayıt, düzenleme ve listeleme API'lerinin yazılması.
*   **Adım 4: Kullanıcı Yönetimi ve Harita Entegrasyonu (Modül 2)**
    *   Üyelik sistemi (Auth - JWT).
    *   Vatandaş arayüzünde kayıp eşyaların ve bulundukları kurumların harita üzerinde gösterilmesi.
*   **Adım 5: Açık Artırma ve Teklif Mekanizması (Modül 3)**
    *   Açık artırma tanımlama ve otomatik başlatma/bitirme mekanizması.
    *   Gerçek zamanlı teklif verme altyapısı.
*   **Adım 6: Ödeme ve Bağış Modülü (Modül 4)**
    *   Sanal ödeme adımı ve kazanan teslimat takibi.
    *   Satılmayan ürünlerin bağış havuzuna aktarılması ve talep sistemi.
*   **Adım 7: Raporlama, Testler ve Sunum**
    *   Yönetim paneli istatistikleri ve grafikler.
    *   Hata testleri ve performans iyileştirmeleri.
