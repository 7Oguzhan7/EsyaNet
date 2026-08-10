# 🎒 Kayıp Eşya Açık Artırma ve Satın Alma Sistemi - Staj Sunum Rehberi

Bu belge, staj hocanıza projeyi sayfa sayfa gezdirerek anlatırken kullanabileceğiniz, hangi butonun ne işe yaradığını, arka planda hangi verileri kullandığını ve sistemin teknik yapısını (Adım 1 - Adım 6 tam kapsam) açıklayan adım adım sunum kılavuzudur.

---

## 🏛️ GİRİŞ: SİTENİN AMACI VE İLK EKRAN (Ultra-Sade UX)
Sitenin ana amacı: **"Kamu kurumlarında veya toplu taşımada unutulan kayıp eşyaların tek bir merkezden takibi, sahiplerine ulaştırılması, sahibi bulunamayanların ihale ile satılması veya ihtiyaç sahiplerine ücretsiz bağışlanması."**

### 1. Sayfa İlk Açıldığında Karşımıza Ne Çıkıyor? (Ziyaretçi Ekranı)
Sistem son derece sade bir açılış ekranı sunar. Kalabalık butonlar kaldırılmıştır:
* En tepede portal başlığı, sağ üstte **"🔑 Giriş Yap / 📝 Üye Ol"** butonları ve ana menüde sadece **"🔍 Kayıp Eşya Portalı"** yer alır.

#### A. Harita Bölümü (📍 Entegrasyon):
* **Ne işe yarar?** Vatandaşın eşyasını fiziksel olarak gidip alabileceği teslim noktalarını (belediye şubeleri, emniyet müdürlükleri vb.) harita üzerinde gösterir.
* **Hangi verileri kullanır?** `institutions` tablosundaki koordinatları (`latitude`, `longitude`), kurumun adını, adresini ve telefon numarasını harita üzerine işaretçi (marker) olarak yerleştirir.

#### B. Arama ve Filtreleme Paneli (🔍 Arama & Bağış Havuzu Filtresi):
* **Ne işe yarar?** Vatandaşın kaybettiği eşyayı bulması veya bağışlık eşyaları görmesi için arama çubuğu, kategori filtresi (Telefon, Cüzdan, Anahtar vb.) ve durum filtresi sunar.
* **Bağış Havuzu Entegrasyonu:** Durum filtresinden **"🎁 Ücretsiz Bağış Havuzundaki Eşyalar"** seçilerek satılamayan veya bağışa devredilen ürünler doğrudan katalogda süzülebilir.

#### C. Kayıp Eşya Kartları:
Haritanın hemen altında kayıtlı olan eşyalar kartlar halinde listelenir. Her kartın üzerinde şunlar yazar:
* **Eşya Görseli, Başlığı ve Açıklaması**
* **Kategori ve Bulunduğu Yer** (Örn: "Cüzdan", Bulunduğu yer: "Kadıköy Metro İstasyonu")
* **Kayıt Tarihi ve Bulunduğu Kurum Şubesi**
* **Durum Rozeti (Status Badge):** Eşyanın durumunu gösterir:
  * `Sahibini Bekliyor (waiting_owner)` - Sarı
  * `Açık Artırmaya Hazır (ready_for_auction)` - Mavi
  * `Sahibine Teslim Edildi (delivered_owner)` - Yeşil
  * `🎁 İhtiyaç Sahibine Bağışlık (donated)` - Yeşil Rozet

---

## 🔐 2. GİRİŞ VE ÜYELİK SİSTEMİ (Role-Based Dynamic UX)
Sağ üstteki **🔑 Giriş Yap** butonuna tıklanarak sisteme 3 farklı rolden biriyle giriş yapılabilir. Giriş yapıldığında üst sekmeler kullanıcının yetkisine göre **dinamik ve tertemiz açılır**:

1. **Ziyaretçi (Giriş Yapmamış):**
   * Sadece **"🔍 Kayıp Eşya Portalı"** (Harita ve Arama Kataloğu) görünür. Arayüz kalabalığı önlenmiştir.
2. **Vatandaş Girişi (`vatandas@gmail.com`):**
   * Giriş yapınca menüye **"💳 Ödemelerim & Kargo Takibi"** sekmesi otomatik eklenir.
3. **Kurum Yetkilisi Girişi (`kurum@kadikoy.bel.tr`):**
   * Yetkili giriş yapınca menüye **"🏢 Eşya & İhale Yönetimi"** ve **"📦 Bağış & Kargo Yönetimi"** panelleri eklenir.
4. **Sistem Yöneticisi Girişi (`admin@sistem.gov.tr`):**
   * Tüm kurumları yönetebilen, yeni şube ekleyebilen ve tüm bağış/kargo süreçlerini izleyebilen ana yetkilidir.

---

## 👤 3. VATANDAŞ PORTALINDA YAPILABİLECEK İŞLEMLER

Giriş yapmış bir vatandaş kayıp eşya kartlarında durumuna göre şu aksiyonları alabilir:

### A. Hak Sahipliği Talebi Oluşturma (Sahibini Bekleyen Eşyalar İçin)
* **Senaryo:** Vatandaş kendi kaybettiği telefonu listede gördü.
* **Nasıl Çalışır?** Eşya kartındaki **"📋 Hak Sahipliği Talebi Oluştur"** butonuna tıklar. Kanıt türü ve açıklama girerek talebi kuruma gönderir.

### B. Açık Artırma & Canlı Teklif Verme (İhaledeki Eşyalar İçin)
* **Senaryo:** Bekleme süresi dolan değerli eşyalar açık artırmaya çıkar.
* **Nasıl Çalışır?** Vatandaş karttaki **"🔥 Canlı İhale & Teklif Ver"** butonuna tıklar. Canlı ihale modalı açılır, anlık geri sayım sayacı çalışır ve hızlı teklif butonlarıyla pey verilir.

### C. Ücretsiz Bağış Talep Etme (Bağış Havuzundaki Eşyalar İçin)
* **Senaryo:** Satılamayan veya bağışa devredilen eşyalar (mont, çanta vb.) için vatandaş kart üzerindeki **"🎁 Ücretsiz Bağış Talep Et"** butonuna basar ve talebini iletir.

---

## 💳 4. ÖDEME VE KARGO TESLİMAT TAKİBİ (Adım 6 - Modül 4)

Açık artırma tamamlandığında veya ödeme yapılacağında devreye girer:

### A. Sanal Kredi Kartı Ödeme Modalı
* **Nasıl Çalışır?** İhaleyi kazanan vatandaş **"💳 Sanal Ödeme Yap"** butonuna tıklar.
* **Özellikler:** Kart çip görseli, 16 haneli kart numarası, SKT ve CVC alanları içeren sanal kart simülasyonu.
* **Arka Plan:** `POST /api/payments` endpoint'i çalışır, `payments` tablosunda `payment_status = 'paid'`, `delivery_status = 'pending'` kaydı oluşturulur.

### B. Ödemelerim & Canlı Kargo Takip Sekmesi (`my_payments`)
* **Nasıl Çalışır?** Kazandığınız ürünlerin ödeme geçmişi ve 3 adımlı canlı kargo durum takip çizgisi gösterilir:
  * `[1] Ödeme Alındı ➔ [2] Kargoya Verildi ➔ [3] Teslim Edildi`

---

## 🏢 5. KURUM YETKİLİSİ VE ADMIN YÖNETİM PANELLERİ

Kurum yetkilisi ve sistem yöneticisi bu panellerden işlemleri yönetir:

### A. Eşya ve İhale Yönetimi (`institution_panel`)
* **Yeni Buluntu Eşya Kaydet:** Şubeye teslim edilen eşyayı sisteme ekler.
* **Durum Güncelleme:** Eşyayı **"Sahibine Teslim Et"**, **"İhaleye Çıkar"** veya **"Bağışa Aktar"** butonlarıyla yönetir.
* **Yeni Kurum Şubesi Ekle (Admin):** Haritada görünecek yeni bir şubeyi koordinatlarıyla ekler.

### B. Bağış ve Kargo Yönetimi (`donations_cargo_mgmt` - Adım 6)
* **Gelen Bağış Taleplerini Yönetme:** Vatandaşlardan gelen ücretsiz bağış taleplerini görüntüler, tek tıkla **✓ Onayla** (`approved`) veya **✕ Reddet** (`rejected`) yapar.
* **Kargo Teslimat Durumu Güncelleme:** Satılan ürünleri tek tıkla **"📦 Kargolandı"** (`shipped`) veya **"🏠 Teslim Edildi"** (`delivered`) durumuna getirir.

---

## ⚙️ 6. TEKNİK ARKA PLAN (Hocanın En Çok Soracağı Sorular)

* **Veritabanı nerede tutuluyor?** İlişkisel PostgreSQL veritabanı kullanıyoruz. Tablolar: `users`, `institutions`, `lost_items`, `auctions`, `bids`, `payments`, `donations`.
* **API katmanı nasıl çalışıyor?** ASP.NET Core Web API (C#) ile yazıldı. Entity Framework Core (EF Core) kullanıyor. Controller yapısı:
  * `AuthController.cs` (JWT Auth)
  * `InstitutionsController.cs`
  * `LostItemsController.cs`
  * `AuctionsController.cs`
  * `PaymentsController.cs` (Ödeme & Kargo)
  * `DonationsController.cs` (Bağış Havuzu & Talepler)
* **Arka Plan Servisi (Background Service):** `AuctionBackgroundService` arka planda uyanık kalarak süresi dolan ihaleleri otomatik tamamlar.
* **Ön Yüz Teknolojisi:** React + Vite, harita görselleştirmesi için Leaflet.js ve modern Glassmorphism CSS tasarımı kullanıldı.
