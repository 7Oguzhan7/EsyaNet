// EşyaNet Web Application - Live GitHub Sync Test
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom Map Helper to pan map dynamically
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

// Custom Premium SVG Icons for Leaflet
const createMapIcon = (color) => L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>
         </svg>`,
  className: 'custom-leaflet-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const defaultCenter = [41.0082, 28.9784]; // Istanbul center

const DEFAULT_INSTITUTIONS = [
  { id: 1, name: 'Kadıköy Belediyesi Şubesi', address: 'Kadıköy Rıhtım Caddesi, İstanbul', latitude: 40.9901, longitude: 29.0291, contactNumber: '0216 123 45 67' },
  { id: 2, name: 'Beşiktaş Emniyet Müdürlüğü', address: 'Beşiktaş Çarşı İçi, İstanbul', latitude: 41.0428, longitude: 29.0075, contactNumber: '0212 987 65 43' },
  { id: 3, name: 'Üsküdar Zabıta Amirliği', address: 'Üsküdar İskele Meydanı, İstanbul', latitude: 41.0267, longitude: 29.0152, contactNumber: '0216 555 44 33' }
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';

const getItemImageUrl = (item) => {
  if (item?.imageUrl && item.imageUrl.trim() !== '') {
    return item.imageUrl;
  }
  const categoryImages = {
    'Telefon': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    'Cüzdan': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    'Çanta': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    'Anahtar': 'https://images.unsplash.com/photo-1628527304948-06157ee3c8a6?auto=format&fit=crop&w=600&q=80',
    'Elektronik': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'
  };
  return categoryImages[item?.category] || FALLBACK_IMAGE;
};

const DEFAULT_LOST_ITEMS = [
  { id: 1, title: 'iPhone 15 Pro Max', description: 'Mavi Titanyum renkli, arkası şeffaf koruyucu kılıflı, ekran koruyuculu Apple iPhone 15 Pro Max cep telefonu. Kadıköy Metrosu Peron alanında bulundu.', category: 'Telefon', dateFound: '2026-07-11', locationFound: 'Kadıköy Metrosu Peron Alanı', imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80', institutionId: 1, institution: { name: 'Kadıköy Belediyesi Şubesi' }, status: 'waiting_owner' },
  { id: 2, title: 'Kahverengi Deri Erkek Cüzdanı', description: 'Hakiki kahverengi deri erkek cüzdanı. İçerisinde sürücü belgesi, kentkart, alışveriş kartları ve bir miktar nakit para bulunmaktadır.', category: 'Cüzdan', dateFound: '2026-07-12', locationFound: 'M4 Kadıköy Metro Girişi', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKxMaqSNLfZoaNI9-uIHwrIuBDQxdSFrG-ecLQtToAYnFLPV5QmDxJv4y4&s=10', institutionId: 1, institution: { name: 'Kadıköy Belediyesi Şubesi' }, status: 'waiting_owner' },
  { id: 3, title: 'Siyah Sırt Çantası', description: 'Siyah renkli HP marka laptop sırt çantası. İçerisinde dizüstü bilgisayar şarj aleti, A4 defter ve kulaklık bulunmaktadır.', category: 'Çanta', dateFound: '2026-07-10', locationFound: 'Beşiktaş İETT Durağı bankı', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', institutionId: 2, institution: { name: 'Beşiktaş Emniyet Müdürlüğü' }, status: 'ready_for_auction' },
  { id: 4, title: 'Altın Renkli Kol Saati', description: 'Metal kordonlu, analog kadranlı, klasik model altın sarısı kadın kol saati. Üsküdar Vapur İskelesi bekleme salonunda bulundu.', category: 'Diğer', dateFound: '2026-07-09', locationFound: 'Üsküdar Vapur İskelesi Bekleme Salonu', imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80', institutionId: 3, institution: { name: 'Üsküdar Zabıta Amirliği' }, status: 'delivered_owner' },
  { id: 5, title: 'Toyota Araba Anahtarı', description: 'Siyah plastik gövdeli, 3 butonlu Toyota uzaktan kumandalı araç anahtarı. Üzerinde kırmızı deri anahtarlık ve halka mevcuttur.', category: 'Anahtar', dateFound: '2026-07-13', locationFound: 'Beşiktaş Meydanı Büfe Önü', imageUrl: 'https://imagedelivery.net/CoxEVs4076Gs22H_MjXVaQ/49309/w=550', institutionId: 2, institution: { name: 'Beşiktaş Emniyet Müdürlüğü' }, status: 'waiting_owner' },
  { id: 6, title: 'Kışlık Bebek Montu ve Eldiven Seti', description: 'Mavi renkli, kapüşonlu kışlık bebek montu ve uyumlu örme eldiven seti. 500T otobüs hattında unutulmuş ve bağış havuzuna devredilmiştir.', category: 'Diğer', dateFound: '2026-06-28', locationFound: '500T Otobüs Hattı', imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80', institutionId: 2, institution: { name: 'Beşiktaş Emniyet Müdürlüğü' }, status: 'donated' },
  { id: 7, title: 'Çocuk Sırt Çantası & Kırtasiye Seti', description: 'Desenli ilkokul çocuk sırt çantası. İçerisinde resim defteri, sulu boya kutusu, boya kalemleri ve kalemlik mevcuttur. İhtiyaç sahipleri için bağışa açılmıştır.', category: 'Çanta', dateFound: '2026-07-02', locationFound: 'Kadıköy İskele Parkı', imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', institutionId: 1, institution: { name: 'Kadıköy Belediyesi Şubesi' }, status: 'donated' },
  { id: 8, title: 'Sony WH-1000XM5 Siyah Kulaklık', description: 'Siyah renkli, özel taşıma kılıflı ve şarj kablolu Sony gürültü engelleyici kablosuz kulaklık.', category: 'Elektronik', dateFound: '2026-08-20', locationFound: 'M2 Yenikapı-Hacıosman Metro Hattı', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80', institutionId: 1, institution: { name: 'Kadıköy Belediyesi Şubesi' }, status: 'waiting_owner' },
  { id: 9, title: 'Ray-Ban Siyah Güneş Gözlüğü', description: 'Siyah kemik çerçeveli, orijinal deri kılıfı içinde unutulmuş Ray-Ban Wayfarer model güneş gözlüğü.', category: 'Diğer', dateFound: '2026-08-22', locationFound: 'Beşiktaş İskele Çay Bahçesi Masası', imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80', institutionId: 2, institution: { name: 'Beşiktaş Emniyet Müdürlüğü' }, status: 'waiting_owner' },
  { id: 10, title: 'MacBook Air M2 Uzay Grisi', description: 'Uzay grisi renkli, koruma kılıflı Apple MacBook Air M2 dizüstü bilgisayar. İETT otobüsünde unutulmuştur.', category: 'Elektronik', dateFound: '2026-08-23', locationFound: '500T Tuzla-Cevizlibağ Otobüs Hattı', imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80', institutionId: 2, institution: { name: 'Beşiktaş Emniyet Müdürlüğü' }, status: 'waiting_owner' },
  { id: 11, title: 'AirPods Pro 2. Nesil Kulaklık', description: 'Beyaz renkli, Magsafe şarj kutulu Apple AirPods Pro 2. Nesil kablosuz kulaklık.', category: 'Elektronik', dateFound: '2026-08-24', locationFound: 'Kadıköy Vapur İskelesi Turnikeleri', imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80', institutionId: 1, institution: { name: 'Kadıköy Belediyesi Şubesi' }, status: 'waiting_owner' }
];

const DEFAULT_PAYMENTS = [
  {
    id: 1,
    auctionId: 3,
    userId: 1,
    userName: 'Ahmet Yılmaz',
    itemTitle: 'Siyah HP Sırt Çantası & Şarj Aleti',
    amount: 350,
    paymentStatus: 'paid',
    deliveryStatus: 'shipped',
    paymentDate: '2026-07-21T14:30:00Z',
    institutionName: 'Beşiktaş Emniyet Müdürlüğü',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'
  }
];

const DEFAULT_DONATIONS = [
  {
    id: 1,
    lostItemId: 6,
    itemTitle: 'Kışlık Bebek Montu ve Eldiven Seti',
    recipientId: 1,
    recipientName: 'Ahmet Yılmaz (Vatandaş)',
    requestDate: '2026-07-22T09:15:00Z',
    status: 'approved',
    institutionName: 'Beşiktaş Emniyet Müdürlüğü',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
  }
];

const DEFAULT_CLAIMS = [
  {
    id: 1,
    itemId: 1,
    itemTitle: 'iPhone 15 Pro Max',
    citizenId: 1,
    citizenName: 'Ahmet Yılmaz (Vatandaş)',
    citizenPhone: '0555 123 45 67',
    proofType: 'Fatura & Seri No',
    description: 'Telefon kılıfının altında aile fotoğrafımız var, faturası ve IMEI numarası tarafımda mevcuttur.',
    claimDate: '2026-07-22T11:00:00Z',
    status: 'pending',
    institutionName: 'Kadıköy Belediyesi Şubesi'
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    title: '📋 Hak Sahipliği Talebi Onaylandı',
    message: 'iPhone 15 Pro Max eşyası için yaptığınız hak sahipliği talebi Kadıköy Belediyesi tarafından onaylandı.',
    type: 'success',
    date: '10 dakika önce',
    read: false,
    targetRole: 'citizen'
  },
  {
    id: 2,
    title: '🔥 İhalede Yeni Teklif!',
    message: 'Mehmet Demir 400 ₺ teklif vererek ihalede öne geçti.',
    type: 'auction',
    date: '35 dakika önce',
    read: false,
    targetRole: 'citizen'
  },
  {
    id: 3,
    title: '🚚 Kargo Yola Çıktı',
    message: 'Açık artırmadan kazandığınız Deri Sırt Çantası kargoya verildi. Takip no: TR-9823412',
    type: 'info',
    date: '2 saat önce',
    read: true,
    targetRole: 'citizen'
  },
  {
    id: 4,
    title: '📋 Yeni Hak Sahipliği Talebi Geldi',
    message: 'Ahmet Yılmaz, iPhone 15 Pro Max eşyası için fatura kanıtlı hak talebinde bulundu.',
    type: 'warning',
    date: '1 saat önce',
    read: false,
    targetRole: 'institution'
  }
];

const DEFAULT_APPOINTMENTS = [
  {
    id: 1,
    claimId: 1,
    lostItemId: 1,
    itemTitle: 'iPhone 15 Pro Max',
    userId: 1,
    userName: 'Ahmet Yılmaz',
    userPhone: '0555 123 45 67',
    institutionId: 1,
    institutionName: 'Kadıköy Belediyesi Şubesi',
    appointmentDate: '2026-08-05',
    timeSlot: '14:00 - 15:00',
    note: 'Faturayı ve kimliğimi yanımda getireceğim.',
    status: 'scheduled',
    createdAt: '2026-08-04T10:00:00Z'
  }
];

const DEFAULT_FEEDBACKS = [
  {
    id: 1,
    userName: "Ahmet Yılmaz",
    userRole: "Vatandaş",
    institutionId: 1,
    institutionName: "Kadıköy Belediyesi Şubesi",
    rating: 5,
    category: "Teslimat Hizmeti",
    comment: "Kayıp cüzdanımı ve telefonumu 1 gün içinde eksiksiz teslim aldım. Güler yüzlü personellerine ve Kadıköy ekiplerine çok teşekkür ederim!",
    date: "28.07.2026",
    reply: "Memnuniyetiniz bizim için çok değerli Ahmet Bey, geçmiş olsun."
  },
  {
    id: 2,
    userName: "Ayşe Kaya",
    userRole: "Vatandaş",
    institutionId: 2,
    institutionName: "Beşiktaş Emniyet Müdürlüğü",
    rating: 5,
    category: "Kayıp Eşya İadesi",
    comment: "Beşiktaş şubesinden kulaklığımı teslim aldım. Harita üzerindeki konum ve süreç takibi gerçekten harikaydı.",
    date: "29.07.2026",
    reply: "Teşekkür ederiz Ayşe Hanım, iyi günlerde kullanın."
  },
  {
    id: 3,
    userName: "Mehmet Demir",
    userRole: "Vatandaş",
    institutionId: 3,
    institutionName: "Üsküdar Zabıta Amirliği",
    rating: 4,
    category: "İhale Memnuniyeti",
    comment: "Açık artırmadan kazandığım saat kargo ile 2 günde elime ulaştı. Paketleme son derece özenliydi.",
    date: "30.07.2026",
    reply: null
  }
];

const DEFAULT_ANNOUNCEMENTS = [
  { 
    id: 1, 
    title: '🏛️ Kadıköy Belediyesi Şubesi Çalışma Saatleri', 
    text: 'Kadıköy Zabıta Şubemiz hafta içi 08:30 - 17:30 saatleri arasında teslimat randevuları için hizmet vermektedir.', 
    date: '05.08.2026', 
    type: 'info' 
  },
  { 
    id: 2, 
    title: '📢 Toplu Taşımada Bulunan Yeni Eşyalar Eklendi', 
    text: 'Metro, otobüs ve metrobüs hatlarında bulunan 30 yeni eşya Kadıköy ve Beşiktaş şubelerimiz tarafından sisteme kaydedilmiştir.', 
    date: '04.08.2026', 
    type: 'success' 
  },
  { 
    id: 3, 
    title: '🎁 İhtiyaç Sahipleri İçin Ücretsiz Bağış Havuzu', 
    text: 'Yasal bekleme süresi dolan ürünler ihtiyaç sahibi vatandaşlarımıza ücretsiz bağışlanmaktadır. Bağış sekmesinden talep oluşturabilirsiniz.', 
    date: '02.08.2026', 
    type: 'warning' 
  }
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: '🔍 Kayıp Eşya & Hak Talebi',
    question: 'Kaybettiğim bir eşyayı sistemde görünce nasıl talep edebilirim?',
    answer: 'Buluntu eşyalar listesinden kayıp eşyanızı bulduktan sonra "📋 Hak Talebinde Bulun" butonuna tıklayın. Fatura, e-Devlet sahiplik belgesi veya IMEI/seri numarası gibi kanıtlarınızı ve detaylı açıklamanızı sisteme yükleyin. Kurum yetkilisi belgenizi inceleyip onay verecektir.'
  },
  {
    id: 2,
    category: '📅 Şube Teslim & Randevu',
    question: 'Hak talebim onaylandıktan sonra eşyamı nasıl teslim alırım?',
    answer: 'Talebiniz kurum yetkilisi tarafından onaylandığında "Ödemelerim & Kargo Takibi" sekmenizde "📅 Şubeden Teslim Randevusu Al" butonu aktifleşir. Size uygun gün ve mesai saat dilimini seçerek randevunuzu oluşturabilir ve kimliğinizle şubeden teslim alabilirsiniz.'
  },
  {
    id: 3,
    category: '🔥 Canlı Açık Artırma & İhale',
    question: 'Açık artırma sistemi nasıl çalışır ve ödeme nasıl yapılır?',
    answer: 'Sahibi çıkmayan ve bekleme süresi dolan eşyalar belediye ve emniyet şubelerimiz tarafından canlı ihaleye çıkarılır. İhalede en yüksek teklifi veren vatandaş sanal kart ile ödemesini tamamladıktan sonra ürünü kargo ile teslim alabilir.'
  },
  {
    id: 4,
    category: '🎁 İhtiyaç Sahibi Bağış Havuzu',
    question: 'Ücretsiz bağışlık eşyalardan kimler faydalanabilir?',
    answer: 'İhtiyaç sahibi vatandaşlarımız "İhtiyaç Sahibi Bağış Havuzu" sekmesinde listelenen ücretsiz ürünler için başvuru yapabilir. Başvurular kurum yetkililerimiz tarafından değerlendirilip uygun bulunan vatandaşlarımıza ürün ücretsiz teslim edilir.'
  },
  {
    id: 5,
    category: '💬 Kurum Yetkilisine Mesaj',
    question: 'Kurum yetkilisiyle nasıl iletişime geçebilirim?',
    answer: 'Giriş yaptıktan sonra "💬 Mesajlarım" sekmesine girerek sol panellerden Kadıköy, Beşiktaş veya Üsküdar şubelerini seçebilir; Genel, Yardım, Şikayet veya Bilgi Talebi kategorilerinde mesaj gönderebilirsiniz.'
  },
  {
    id: 6,
    category: '🔒 Güvenlik & KVKK',
    question: 'Kişisel verilerim ve yüklediğim fatura belgeleri güvende mi?',
    answer: 'Evet. Yüklediğiniz tüm fatura, kimlik ve sahiplik belgeleri 6698 sayılı KVKK standartlarına uygun olarak şifrelenir ve sadece doğrulamayı yapacak resmi kurum yetkilisi tarafından görüntülenebilir.'
  }
];

function App() {
  // Authentication State — sessionStorage kullanılıyor: sekme kapanınca oturum sona erer
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('authUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('authToken'));

  // Connection state
  const [dbStatus, setDbStatus] = useState({
    loading: true,
    connected: false,
    message: 'API sunucusuna bağlanılamıyor. Standby modu aktif.',
    dataCount: 0
  });

  // Tab & UI State
  const [activeTab, setActiveTab] = useState(() => {
    // sessionStorage'daki kullanıcı rolüne göre doğru sekmeye yönlendir
    try {
      const savedUser = sessionStorage.getItem('authUser');
      const savedToken = sessionStorage.getItem('authToken');
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.role === 'admin') return 'analytics';
        if (parsedUser.role === 'institution') return 'institution_panel';
      }
    } catch (e) {}
    return 'citizen_view';
  });

  // Theme State (Dark / Light mode)
  const [theme, setTheme] = useState(() => localStorage.getItem('kayip_esya_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kayip_esya_theme', theme);
  }, [theme]);

  // Business Data State
  const [institutions, setInstitutions] = useState(DEFAULT_INSTITUTIONS);
  const [lostItems, setLostItems] = useState(DEFAULT_LOST_ITEMS);
  const [payments, setPayments] = useState(DEFAULT_PAYMENTS);
  const [donations, setDonations] = useState(() => {
    const saved = localStorage.getItem('kayip_esya_donations_v2');
    return saved ? JSON.parse(saved) : DEFAULT_DONATIONS;
  });
  const [claims, setClaims] = useState(() => {
    const saved = localStorage.getItem('kayip_esya_claims_v2');
    return saved ? JSON.parse(saved) : DEFAULT_CLAIMS;
  });
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('kayip_esya_notifications_v1');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  // Feedbacks & Satisfaction Rating State
  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem('kayip_esya_feedbacks_v1');
    return saved ? JSON.parse(saved) : DEFAULT_FEEDBACKS;
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    institutionId: 1,
    rating: 5,
    category: 'Kayıp Eşya İadesi',
    comment: ''
  });
  const [replyTextMap, setReplyTextMap] = useState({});

  useEffect(() => {
    localStorage.setItem('kayip_esya_feedbacks_v1', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const [loadingData, setLoadingData] = useState(false);

  // Messaging State — API backed (PostgreSQL)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageThread, setMessageThread] = useState(null);
  const [msgType, setMsgType] = useState('Genel');

  const [msgRefreshTrigger, setMsgRefreshTrigger] = useState(0);

  // Fetch messages from API when user logs in or changes tab to messages
  useEffect(() => {
    if (!user) { setMessages([]); return; }
    const fetchMessages = async () => {
      try {
        const param = user.role === 'citizen'
          ? `userId=${user.id}`
          : user.role === 'admin'
            ? ''
            : `instId=${user.institutionId || 0}`;
        const res = await axios.get(`http://localhost:5030/api/messages?${param}`);
        // Normalize API fields to match frontend field names
        const normalized = res.data.map(m => ({
          id: m.id,
          fromUserId: m.fromUserId,
          fromName: m.fromName,
          toInstId: m.toInstId,
          toInstName: m.toInstName,
          toUserId: m.toUserId,
          toRole: m.toRole,
          msgType: m.msgType,
          text: m.text,
          read: m.isRead,
          date: new Date(m.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(normalized);
      } catch {
        // Backend offline — keep empty array
      }
    };
    fetchMessages();
  }, [user, activeTab, msgRefreshTrigger]);

  // Sync claims, donations, and notifications to localStorage
  useEffect(() => {
    localStorage.setItem('kayip_esya_claims_v2', JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem('kayip_esya_donations_v2', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('kayip_esya_notifications_v1', JSON.stringify(notifications));
  }, [notifications]);

  // Appointment System State & Modals
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('kayip_esya_appointments_v1');
    return saved ? JSON.parse(saved) : DEFAULT_APPOINTMENTS;
  });
  const [showApptModal, setShowApptModal] = useState(false);
  const [activeApptItem, setActiveApptItem] = useState(null);
  const [apptForm, setApptForm] = useState({
    appointmentDate: '',
    timeSlot: '14:00 - 15:00',
    userPhone: '',
    note: ''
  });
  const [instPanelSubTab, setInstPanelSubTab] = useState('claims'); // 'claims' | 'items' | 'appointments'

  useEffect(() => {
    localStorage.setItem('kayip_esya_appointments_v1', JSON.stringify(appointments));
  }, [appointments]);

  // Announcements State
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('kayip_esya_announcements_v1');
    return saved ? JSON.parse(saved) : DEFAULT_ANNOUNCEMENTS;
  });
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announceForm, setAnnounceForm] = useState({ title: '', text: '', type: 'info' });

  useEffect(() => {
    localStorage.setItem('kayip_esya_announcements_v1', JSON.stringify(announcements));
  }, [announcements]);

  // FAQ State
  const [faqCategory, setFaqCategory] = useState('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIds, setOpenFaqIds] = useState([1, 2]);

  const toggleFaq = (id) => {
    setOpenFaqIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!announceForm.title || !announceForm.text) return;
    const newAnn = {
      id: Date.now(),
      title: announceForm.title,
      text: announceForm.text,
      type: announceForm.type,
      date: new Date().toLocaleDateString('tr-TR'),
      active: true
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setShowAnnounceModal(false);
    setAnnounceForm({ title: '', text: '', type: 'info' });
    addNotification('📢 Yeni Duyuru Yayınlandı', announceForm.title, 'info', 'citizen');
    alert('📢 Duyuru başarıyla yayınlandı!');
  };

  // Printable Protocol State
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [protocolData, setProtocolData] = useState(null);

  const openProtocolModal = (data) => {
    const protocolNo = `TR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowStr = new Date().toLocaleString('tr-TR');
    setProtocolData({
      protocolNo,
      dateStr: nowStr,
      itemTitle: data.itemTitle || data.title || 'Kayıp Eşya',
      category: data.category || 'Genel Buluntu Eşya',
      location: data.locationFound || data.location || 'Kadıköy Rıhtım Şubesi',
      userName: data.userName || (user ? user.nameSurname : 'Ahmet Yılmaz'),
      userPhone: data.userPhone || '0555 123 45 67',
      userTc: '********' + Math.floor(100 + Math.random() * 900),
      instName: data.institutionName || data.institution?.name || 'Kadıköy Belediyesi Zabıta Amirliği',
      itemCode: `ITEM-${data.id || Math.floor(10000 + Math.random() * 90000)}`
    });
    setShowProtocolModal(true);
  };

  // Fetch appointments from API
  useEffect(() => {
    if (!user) return;
    const fetchAppts = async () => {
      try {
        const param = user.role === 'citizen'
          ? `userId=${user.id}`
          : user.role === 'admin'
            ? ''
            : `instId=${user.institutionId || 0}`;
        const res = await axios.get(`http://localhost:5030/api/appointments?${param}`);
        if (res.data && res.data.length > 0) {
          setAppointments(res.data);
        }
      } catch {}
    };
    fetchAppts();
  }, [user, activeTab]);

  const openApptModal = (itemOrClaim) => {
    if (!user) {
      alert('📅 Teslimat randevusu alabilmek için lütfen giriş yapın.');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setActiveApptItem(itemOrClaim);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setApptForm({
      appointmentDate: dateStr,
      timeSlot: '14:00 - 15:00',
      userPhone: user.phone || '0555 123 45 67',
      note: ''
    });
    setShowApptModal(true);
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!activeApptItem || !apptForm.appointmentDate || !apptForm.timeSlot) {
      alert('Lütfen randevu tarihi ve saat dilimini eksiksiz seçin.');
      return;
    }

    const instId = activeApptItem.institutionId || (activeApptItem.institutionName?.includes('Kadıköy') ? 1 : activeApptItem.institutionName?.includes('Beşiktaş') ? 2 : 3);
    const instName = activeApptItem.institutionName || activeApptItem.institution?.name || 'Kadıköy Belediyesi Şubesi';
    const itemTitle = activeApptItem.itemTitle || activeApptItem.title || 'Kayıp Eşya';
    const itemId = activeApptItem.lostItemId || activeApptItem.itemId || activeApptItem.id || 1;

    const dto = {
      claimId: activeApptItem.claimId || activeApptItem.id,
      lostItemId: itemId,
      itemTitle: itemTitle,
      userId: user.id,
      userName: user.nameSurname,
      userPhone: apptForm.userPhone,
      institutionId: instId,
      institutionName: instName,
      appointmentDate: apptForm.appointmentDate,
      timeSlot: apptForm.timeSlot,
      note: apptForm.note
    };

    const newAppt = {
      id: Date.now(),
      ...dto,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newAppt, ...prev]);
    setShowApptModal(false);

    try {
      await axios.post('http://localhost:5030/api/appointments', dto);
    } catch {}

    addNotification(
      '📅 Şube Teslim Randevusu Alındı',
      `${itemTitle} eşyası için ${apptForm.appointmentDate} (${apptForm.timeSlot}) tarihine randevunuz oluşturuldu.`,
      'success',
      'citizen'
    );
    addNotification(
      '📅 Yeni Teslimat Randevusu',
      `${user.nameSurname}, ${itemTitle} eşyası için ${apptForm.appointmentDate} (${apptForm.timeSlot}) randevusu aldı.`,
      'info',
      'institution'
    );

    alert(`🎉 Randevunuz Başarıyla Oluşturuldu!\n\nEşya: ${itemTitle}\nTarih: ${apptForm.appointmentDate}\nSaat: ${apptForm.timeSlot}\nŞube: ${instName}`);
  };

  const handleUpdateApptStatus = async (apptId, newStatus) => {
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: newStatus } : a));

    const targetAppt = appointments.find(a => a.id === apptId);
    if (targetAppt && newStatus === 'completed') {
      setLostItems(prev => prev.map(i => i.id === targetAppt.lostItemId ? { ...i, status: 'delivered_owner' } : i));
    }

    try {
      await axios.put(`http://localhost:5030/api/appointments/${apptId}/status`, { status: newStatus });
    } catch {}

    addNotification(
      newStatus === 'completed' ? '✅ Randevu Tamamlandı' : '📅 Randevu Durumu Güncellendi',
      `${targetAppt?.itemTitle || 'Eşya'} randevusu "${newStatus === 'completed' ? 'Teslim Edildi' : newStatus === 'cancelled' ? 'İptal Edildi' : 'Gelinmedi'}" olarak işaretlendi.`,
      newStatus === 'completed' ? 'success' : 'warning',
      'citizen'
    );

    alert(`📅 Randevu durumu "${newStatus === 'completed' ? 'Teslim Edildi (Tamamlandı)' : newStatus === 'cancelled' ? 'İptal Edildi' : 'Gelinmedi'}" olarak güncellendi.`);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterInstitution, setFilterInstitution] = useState('');
  const [instFilter, setInstFilter] = useState('');
  const [selectedMapCenter, setSelectedMapCenter] = useState(defaultCenter);

  // Form Modals State
  const [showItemModal, setShowItemModal] = useState(false);
  const [showInstModal, setShowInstModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Step 6 Modals State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentTarget, setActivePaymentTarget] = useState(null);
  const [paymentCardForm, setPaymentCardForm] = useState({
    cardHolderName: '',
    cardNumber: '4543 2110 8899 1234',
    expirationDate: '12/28',
    cvc: '321'
  });

  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [activeDonationItem, setActiveDonationItem] = useState(null);
  const [donationNote, setDonationNote] = useState('');

  // Form input state variables
  const [newInst, setNewInst] = useState({
    name: '',
    address: '',
    latitude: 41.0082,
    longitude: 28.9784,
    contactNumber: ''
  });

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'Telefon',
    dateFound: new Date().toISOString().split('T')[0],
    locationFound: '',
    imageUrl: '',
    institutionId: '',
    status: 'waiting_owner'
  });

  const [authForm, setAuthForm] = useState({
    nameSurname: '',
    email: '',
    password: '',
    phone: '',
    role: 'citizen',
    institutionId: ''
  });

  // Auction State Variables
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [activeAuctionItem, setActiveAuctionItem] = useState(null);
  const [auctionCurrentPrice, setAuctionCurrentPrice] = useState(350);
  const [auctionBids, setAuctionBids] = useState([
    { id: 1, user: 'Mehmet Demir', amount: 350, time: '10 dakika önce' },
    { id: 2, user: 'Ayşe Kaya', amount: 250, time: '25 dakika önce' },
    { id: 3, user: 'Sistem Başlangıç', amount: 150, time: '1 saat önce' }
  ]);
  const [customBidInput, setCustomBidInput] = useState('');

  // Ownership Claim State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [activeClaimItem, setActiveClaimItem] = useState(null);
  const [claimForm, setClaimForm] = useState({
    description: '',
    proofType: 'fatura',
    contactPhone: ''
  });

  // Dynamic Live Demo Auction Timer
  const [auctionTimeLeft, setAuctionTimeLeft] = useState(25);

  useEffect(() => {
    let timer;
    if (auctionModalOpen && auctionTimeLeft > 0) {
      timer = setInterval(() => {
        setAuctionTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [auctionModalOpen, auctionTimeLeft]);

  // Database Connection Health Check
  const checkStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5030/api/system/status');
      if (response.data.status === 'Healthy') {
        setDbStatus({
          loading: false,
          connected: true,
          message: response.data.message,
          dataCount: response.data.institutionCount
        });
      } else {
        setDbStatus({
          loading: false,
          connected: false,
          message: 'API çalışıyor fakat veritabanına bağlanamadı.',
          dataCount: 0
        });
      }
    } catch (error) {
      setDbStatus({
        loading: false,
        connected: false,
        message: 'API kapalı. Çevrimdışı hazır veriler gösteriliyor.',
        dataCount: 0
      });
    }
  };

  // Fetch Business Data from API
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const instResponse = await axios.get('http://localhost:5030/api/institutions');
      if (instResponse.data && instResponse.data.length > 0) {
        setInstitutions(instResponse.data);
      }

      const itemsUrl = 'http://localhost:5030/api/lostitems';
      const itemsResponse = await axios.get(itemsUrl);
      if (itemsResponse.data && itemsResponse.data.length > 0) {
        setLostItems(itemsResponse.data);
      }

      // Fetch Payments & Donations
      try {
        const payRes = await axios.get('http://localhost:5030/api/payments');
        if (payRes.data && payRes.data.length > 0) {
          setPayments(payRes.data.map(p => ({
            id: p.id,
            auctionId: p.auctionId,
            userId: p.userId,
            userName: p.user?.nameSurname || 'Kullanıcı',
            itemTitle: p.auction?.lostItem?.title || 'Açık Artırma Ürünü',
            amount: p.amount,
            paymentStatus: p.paymentStatus,
            deliveryStatus: p.deliveryStatus,
            paymentDate: p.paymentDate,
            institutionName: p.auction?.lostItem?.institution?.name || 'Kurum Şubesi',
            imageUrl: p.auction?.lostItem?.imageUrl || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'
          })));
        }
      } catch (e) {}

      try {
        const donRes = await axios.get('http://localhost:5030/api/donations');
        if (donRes.data && donRes.data.length > 0) {
          setDonations(donRes.data.map(d => ({
            id: d.id,
            lostItemId: d.lostItemId,
            itemTitle: d.lostItem?.title || 'Bağış Eşyası',
            recipientId: d.recipientId,
            recipientName: d.recipient?.nameSurname || 'Vatandaş',
            requestDate: d.requestDate,
            status: d.status,
            institutionName: d.lostItem?.institution?.name || 'Kurum Şubesi',
            imageUrl: d.lostItem?.imageUrl || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'
          })));
        }
      } catch (e) {}

      try {
        const analyticsRes = await axios.get('http://localhost:5030/api/system/analytics');
        if (analyticsRes.data) {
          setAnalyticsData(analyticsRes.data);
        }
      } catch (e) {}

    } catch (err) {
      console.log("API offline, using local state");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    checkStatus();
    fetchData();
  }, []);

  // Notification Helpers
  const isNotifForUser = (n) => {
    if (n.targetRole === 'all') return true;
    // Kullanıcıya özel bildirim: user_${userId} formatı
    if (n.targetRole && n.targetRole.startsWith('user_')) {
      const targetId = n.targetRole.replace('user_', '');
      return user && String(user.id) === String(targetId);
    }
    const currentRole = user ? user.role : 'citizen';
    if (n.targetRole === 'citizen') return currentRole === 'citizen';
    if (n.targetRole === 'institution') return currentRole === 'institution' || currentRole === 'admin';
    if (n.targetRole === 'admin') return currentRole === 'admin';
    return n.targetRole === currentRole;
  };

  const addNotification = (title, message, type = 'info', targetRole = 'all') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      date: 'Az önce',
      read: false,
      targetRole
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Toast yalnızca hedeflenen kullanıcıya gözüksün
    const currentRole = user ? user.role : 'citizen';
    let isForCurrent = false;

    if (targetRole === 'all') {
      isForCurrent = true;
    } else if (targetRole && targetRole.startsWith('user_')) {
      // Kişisel hedef: user_${userId}
      const targetId = targetRole.replace('user_', '');
      isForCurrent = user && String(user.id) === String(targetId);
    } else {
      isForCurrent =
        (targetRole === 'citizen' && currentRole === 'citizen') ||
        (targetRole === 'institution' && (currentRole === 'institution' || currentRole === 'admin')) ||
        (targetRole === 'admin' && currentRole === 'admin');
    }

    if (isForCurrent) {
      setActiveToast(newNotif);
      setTimeout(() => {
        setActiveToast(prev => (prev?.id === newNotif.id ? null : prev));
      }, 4500);
    }
  };

  const markAllNotifsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotifAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Handlers for Claim Ownership
  const openClaimModal = (item) => {
    if (!user) {
      alert('Hak sahipliği talebi oluşturmak için lütfen önce giriş yapın.');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setActiveClaimItem(item);
    setClaimForm({ description: '', proofType: 'Fatura & Seri No', contactPhone: user?.phone || '0555 123 45 67' });
    setClaimModalOpen(true);
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!activeClaimItem) return;

    const newClaim = {
      id: Date.now(),
      itemId: activeClaimItem.id,
      itemTitle: activeClaimItem.title,
      citizenId: user?.id || 1,
      citizenName: user?.nameSurname || 'Ahmet Yılmaz (Vatandaş)',
      citizenPhone: claimForm.contactPhone || '0555 123 45 67',
      proofType: claimForm.proofType || 'Fatura / Kanıt',
      description: claimForm.description,
      claimDate: new Date().toISOString(),
      status: 'pending',
      institutionName: activeClaimItem.institution?.name || 'Kadıköy Belediyesi Şubesi'
    };

    setClaims(prev => [newClaim, ...prev]);
    setClaimModalOpen(false);

    // Trigger Notifications
    addNotification('📋 Hak Talebiniz İletildi', `${activeClaimItem.title} eşyası için hak sahipliği talebiniz kurum yetkilisine başarıyla iletildi.`, 'info', 'citizen');
    addNotification('📋 Yeni Hak Sahipliği Talebi', `${user?.nameSurname || 'Ahmet Yılmaz'}, ${activeClaimItem.title} için hak talebinde bulundu.`, 'warning', 'institution');

    alert(`✅ Hak sahipliği talebiniz başarıyla oluşturuldu!\n\nEşya: ${activeClaimItem.title}\nTalebiniz Kurum Yetkilisi doğrulama paneline iletilmiştir.`);
  };

  const handleApproveClaim = async (claimId, itemId) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'approved' } : c));
    setLostItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'delivered_owner' } : item));

    try {
      if (itemId) {
        await axios.put(`http://localhost:5030/api/lostitems/${itemId}/status`, {
          status: 'delivered_owner'
        });
      }
    } catch (e) {}

    addNotification('✓ Hak Sahipliği Onaylandı!', `Eşyanız kurum yetkilisi tarafından doğrulandı ve teslim edilmeye hazır.`, 'success', 'citizen');
    alert("✓ Hak sahipliği onaylandı! Eşya 'Sahibine Teslim Edildi' durumuna güncellendi.");
  };

  const handleRejectClaim = (claimId) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: 'rejected' } : c));
    addNotification('✕ Hak Sahipliği Talebi Reddedildi', `Görünüşe göre sunduğunuz kanıt veya açıklama kurum tarafından yetersiz bulundu.`, 'warning', 'citizen');
    alert("✕ Hak sahipliği talebi reddedildi.");
  };

  // Handlers for Auction
  const openAuctionModal = (item) => {
    if (!user) {
      alert('Açık artırmaya katılmak ve teklif vermek için lütfen önce giriş yapın.');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setActiveAuctionItem(item);
    setAuctionCurrentPrice(350);
    setAuctionTimeLeft(25);
    setAuctionBids([
      { id: 1, user: 'Mehmet Demir', amount: 350, time: '10 dakika önce' },
      { id: 2, user: 'Ayşe Kaya', amount: 250, time: '25 dakika önce' },
      { id: 3, user: 'Sistem Başlangıç', amount: 150, time: '1 saat önce' }
    ]);
    setCustomBidInput('');
    setAuctionModalOpen(true);
  };

  const handlePlaceBid = async (amount) => {
    if (auctionTimeLeft <= 0) {
      alert('İhale süresi dolduğu için yeni teklif veremezsiniz.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= auctionCurrentPrice) {
      alert(`Lütfen mevcut fiyattan (${auctionCurrentPrice} ₺) daha yüksek bir teklif girin.`);
      return;
    }
    const bidderName = user.nameSurname;

    try {
      if (user && user.id) {
        await axios.post('http://localhost:5030/api/auctions/1/bids', {
          userId: user.id,
          amount: numAmount
        });
      }
    } catch (e) {}

    setAuctionCurrentPrice(numAmount);
    setAuctionBids(prev => [
      { id: Date.now(), user: bidderName, amount: numAmount, time: 'Az önce' },
      ...prev
    ]);
    setCustomBidInput('');
    addNotification('🔥 İhalede Teklifiniz Alındı!', `${numAmount} ₺ tutarındaki teklifiniz canlı ihalede en yüksek teklif olarak kaydedildi.`, 'auction', 'citizen');
    alert(`Tebrikler! ${numAmount} ₺ tutarındaki teklifiniz başarıyla alındı.`);
  };

  // STEP 6: Handlers for Payment & Delivery
  const openPaymentModal = (target) => {
    if (!user) {
      alert('Ödeme adımı için lütfen önce giriş yapın.');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setActivePaymentTarget(target);
    setPaymentCardForm({
      cardHolderName: user?.nameSurname || 'Ahmet Yılmaz',
      cardNumber: '4543 2110 8899 1234',
      expirationDate: '12/28',
      cvc: '321'
    });
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!activePaymentTarget) return;

    const amountToPay = activePaymentTarget.currentPrice || activePaymentTarget.amount || 350;

    try {
      await axios.post('http://localhost:5030/api/payments', {
        auctionId: activePaymentTarget.id || 1,
        userId: user?.id || 1,
        amount: amountToPay,
        cardHolderName: paymentCardForm.cardHolderName,
        cardNumber: paymentCardForm.cardNumber,
        expirationDate: paymentCardForm.expirationDate,
        cvc: paymentCardForm.cvc
      });
    } catch (err) {}

    const newPayment = {
      id: Date.now(),
      auctionId: activePaymentTarget.id || 1,
      userId: user?.id || 1,
      userName: user?.nameSurname || 'Ahmet Yılmaz',
      itemTitle: activePaymentTarget.title || activePaymentTarget.itemTitle || 'Açık Artırma Ürünü',
      amount: amountToPay,
      paymentStatus: 'paid',
      deliveryStatus: 'pending',
      paymentDate: new Date().toISOString(),
      institutionName: activePaymentTarget.institution?.name || 'Beşiktaş Emniyet Müdürlüğü',
      imageUrl: activePaymentTarget.imageUrl || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80'
    };

    setPayments(prev => [newPayment, ...prev]);
    setAuctionModalOpen(false);
    setPaymentModalOpen(false);
    setActiveTab('my_payments');
    alert(`🎉 Sanal Ödemeniz Başarıyla Tamamlandı!\n\nTutar: ${amountToPay} ₺\nSiparişinizin kargo teslimat takibini "Ödemelerim & Kargo Takibi" sekmesinden izleyebilirsiniz.`);
  };

  const handleUpdateDeliveryStatus = async (paymentId, newStatus) => {
    try {
      await axios.put(`http://localhost:5030/api/payments/${paymentId}/delivery-status`, {
        deliveryStatus: newStatus
      });
    } catch (err) {}

    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, deliveryStatus: newStatus } : p));
    alert(`🚚 Kargo teslimat durumu "${newStatus === 'shipped' ? 'Kargoya Verildi' : newStatus === 'delivered' ? 'Teslim Edildi' : 'Hazırlanıyor'}" meyilinde güncellendi.`);
  };

  // Review & Rating Handlers
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      alert("Lütfen bir yorum yazın.");
      return;
    }
    const targetInst = institutions.find(i => i.id === parseInt(reviewForm.institutionId));
    const newEntry = {
      id: Date.now(),
      userId: user ? user.id : null,
      userName: user ? user.nameSurname : 'Ahmet Yılmaz',
      userRole: user ? (user.role === 'citizen' ? 'Vatandaş' : user.role === 'admin' ? 'Yönetici' : 'Kurum Yetkilisi') : 'Vatandaş',
      institutionId: parseInt(reviewForm.institutionId),
      institutionName: targetInst ? targetInst.name : 'Kadıköy Belediyesi Şubesi',
      rating: parseInt(reviewForm.rating),
      category: reviewForm.category,
      comment: reviewForm.comment.trim(),
      date: new Date().toLocaleDateString('tr-TR'),
      reply: null
    };

    setFeedbacks(prev => [newEntry, ...prev]);
    setShowReviewModal(false);
    setReviewForm({ institutionId: 1, rating: 5, category: 'Kayıp Eşya İadesi', comment: '' });
    alert("⭐ Değerlendirmeniz ve yorumunuz başarıyla yayınlandı. Teşekkür ederiz!");
    addNotification("⭐ Yeni Teşekkür Yorumu!", `${newEntry.userName} → ${newEntry.institutionName} için ${newEntry.rating}⭐ değerlendirme yaptı.`, "success", "all");
  };

  const handleReplyReview = (feedbackId) => {
    const replyMsg = replyTextMap[feedbackId];
    if (!replyMsg || !replyMsg.trim()) {
      alert("Lütfen bir yanıt yazın.");
      return;
    }
    // Yorumu yapan kullanıcıyı bul
    const targetFeedback = feedbacks.find(f => f.id === feedbackId);
    const targetUserId = targetFeedback ? targetFeedback.userId : null;
    const targetUserName = targetFeedback ? targetFeedback.userName : 'Vatandaş';

    setFeedbacks(prev => prev.map(f => f.id === feedbackId ? { ...f, reply: replyMsg.trim() } : f));
    setReplyTextMap(prev => ({ ...prev, [feedbackId]: '' }));
    alert(`✅ ${targetUserName} kullanıcısına kurum yanıtı başarıyla gönderildi.`);
    // Bildirimi yalnızca ilgili kullanıcının userId'sine gönder
    addNotification(
      "💬 Değerlendirmenize Kurum Yanıtı Geldi",
      `Kurumdan yanıt: "${replyMsg.trim()}"`,
      "info",
      targetUserId ? `user_${targetUserId}` : "citizen"
    );
  };

  // STEP 6: Handlers for Donation Pool & Requests
  const openDonationModal = (item) => {
    if (!user) {
      alert('İhtiyaç sahibi olarak ücretsiz bağış talebinde bulunabilmek için lütfen giriş yapın.');
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setActiveDonationItem(item);
    setDonationNote('');
    setDonationModalOpen(true);
  };

  const handleProcessDonationRequest = async (e) => {
    e.preventDefault();
    if (!activeDonationItem) return;

    try {
      await axios.post('http://localhost:5030/api/donations/request', {
        lostItemId: activeDonationItem.id,
        recipientId: user?.id || 1
      });
    } catch (err) {}

    const newDonation = {
      id: Date.now(),
      lostItemId: activeDonationItem.id,
      itemTitle: activeDonationItem.title,
      recipientId: user?.id || 1,
      recipientName: user?.nameSurname || 'Ahmet Yılmaz',
      requestDate: new Date().toISOString(),
      status: 'pending',
      institutionName: activeDonationItem.institution?.name || 'Kadıköy Belediyesi Şubesi',
      imageUrl: activeDonationItem.imageUrl,
      note: donationNote
    };

    setDonations(prev => [newDonation, ...prev]);
    setDonationModalOpen(false);
    setActiveTab('donation_pool');
    alert(`🎁 Ücretsiz bağış talebiniz başarıyla alındı!\n\nEşya: ${activeDonationItem.title}\nTalebiniz kurum yetkilisi onayına sunulmuştur.`);
  };

  const handleUpdateDonationStatus = async (donationId, newStatus) => {
    setDonations(prev => prev.map(d => d.id === donationId ? { ...d, status: newStatus } : d));

    const targetDonation = donations.find(d => d.id === donationId);
    if (targetDonation && targetDonation.lostItemId) {
      if (newStatus === 'approved') {
        setLostItems(prev => prev.map(i => i.id === targetDonation.lostItemId ? { ...i, status: 'donated_delivered' } : i));
      }
    }

    try {
      await axios.put(`http://localhost:5030/api/donations/${donationId}/status`, {
        status: newStatus
      });
    } catch (err) {}

    addNotification(
      newStatus === 'approved' ? '🎁 Bağış Talebiniz Onaylandı!' : '✕ Bağış Talebiniz Reddedildi',
      `Bağış talebiniz ${newStatus === 'approved' ? 'onaylandı. Kurum şubesinden teslim alabilirsiniz.' : 'reddedildi.'}`,
      newStatus === 'approved' ? 'success' : 'warning',
      'citizen'
    );

    alert(`📋 Bağış talebi statüsü "${newStatus === 'approved' ? 'Onaylandı' : 'Reddedildi'}" olarak güncellendi.`);
  };

  const handleMoveToDonationPool = async (itemId) => {
    if (!confirm("Bu eşyayı ihtiyaç sahipleri için ücretsiz bağış havuzuna aktarmak istediğinize emin misiniz?")) return;
    try {
      await axios.post(`http://localhost:5030/api/donations/move-to-donation/${itemId}`);
    } catch (err) {}

    setLostItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'donated' } : item));
    alert("✅ Eşya başarıyla İhtiyaç Sahibi Bağış Havuzuna devredildi!");
  };

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) {
      alert("Lütfen e-posta ve şifre alanlarını doldurun.");
      return;
    }

    // Try API Login
    try {
      const response = await axios.post('http://localhost:5030/api/auth/login', {
        email: authForm.email,
        password: authForm.password
      });
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      sessionStorage.setItem('authToken', receivedToken);
      sessionStorage.setItem('authUser', JSON.stringify(receivedUser));
      setShowAuthModal(false);
      setAuthForm({ nameSurname: '', email: '', password: '', phone: '', role: 'citizen', institutionId: '' });
      if (receivedUser.role === 'institution') setActiveTab('institution_panel');
      else if (receivedUser.role === 'admin') setActiveTab('analytics');
      alert(`✅ Giriş başarılı! Hoş geldiniz, ${receivedUser.nameSurname}.`);
      fetchData();
      return;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || "E-posta veya şifre hatalı!";
      alert(`❌ Giriş Başarısız: ${errorMsg}`);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password || !authForm.nameSurname) {
      alert("Lütfen Ad Soyad, E-posta ve Şifre alanlarını eksiksiz doldurun.");
      return;
    }

    try {
      await axios.post('http://localhost:5030/api/auth/register', {
        nameSurname: authForm.nameSurname,
        email: authForm.email,
        password: authForm.password,
        role: authForm.role || 'citizen',
        institutionId: authForm.institutionId ? parseInt(authForm.institutionId) : 1
      });
    } catch (err) {}

    const createdUser = {
      id: Date.now(),
      nameSurname: authForm.nameSurname,
      email: authForm.email,
      password: authForm.password,
      role: authForm.role || 'citizen',
      institutionId: authForm.institutionId ? parseInt(authForm.institutionId) : 1
    };

    // Save to registered users list in localStorage
    const saved = localStorage.getItem('registered_users_v1');
    const userList = saved ? JSON.parse(saved) : [];
    
    // Check if email already registered locally
    if (userList.some(u => u.email.toLowerCase() === authForm.email.toLowerCase())) {
      alert("❌ Kayıt Başarısız: Bu e-posta adresi zaten kullanımda!");
      return;
    }

    userList.push(createdUser);
    localStorage.setItem('registered_users_v1', JSON.stringify(userList));

    // Do NOT auto-login, switch modal to login mode instead
    setAuthMode('login');
    setAuthForm(prev => ({ ...prev, password: '' }));
    alert(`🎉 Tebrikler! Üyeliğiniz başarıyla oluşturuldu, ${createdUser.nameSurname}.\n\nLütfen şimdi e-posta adresiniz ve belirlediğiniz şifre ile Giriş Yapın.`);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    setActiveTab('citizen_view');
    alert("Oturum kapatıldı.");
  };

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5030/api/institutions', newInst);
      if (response.data) setInstitutions(prev => [...prev, response.data]);
    } catch (err) {
      setInstitutions(prev => [...prev, { id: Date.now(), ...newInst }]);
    }
    setShowInstModal(false);
    setNewInst({ name: '', address: '', latitude: 41.0082, longitude: 28.9784, contactNumber: '' });
    fetchData();
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItem.institutionId) {
      alert("Lütfen eşyanın bulunduğu teslim alma kurumunu seçin.");
      return;
    }
    const inst = institutions.find(i => i.id === parseInt(newItem.institutionId));
    const payload = { ...newItem, institutionId: parseInt(newItem.institutionId) };

    try {
      const response = await axios.post('http://localhost:5030/api/lostitems', payload);
      if (response.data) setLostItems(prev => [response.data, ...prev]);
    } catch (err) {
      setLostItems(prev => [{ id: Date.now(), ...payload, institution: inst ? { name: inst.name } : { name: 'Genel Şube' } }, ...prev]);
    }
    setShowItemModal(false);
    setNewItem({
      title: '',
      description: '',
      category: 'Telefon',
      dateFound: new Date().toISOString().split('T')[0],
      locationFound: '',
      imageUrl: '',
      institutionId: '',
      status: 'waiting_owner'
    });
    fetchData();
  };

  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      await axios.put(`http://localhost:5030/api/lostitems/${itemId}/status`, { status: newStatus });
    } catch (err) {}
    setLostItems(prev => prev.map(item => item.id === itemId ? { ...item, status: newStatus } : item));
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Bu kayıp eşya kaydını silmek istediğinize emin misiniz?")) return;
    try {
      await axios.delete(`http://localhost:5030/api/lostitems/${itemId}`);
    } catch (err) {}
    setLostItems(prev => prev.filter(item => item.id !== itemId));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'waiting_owner':
        return <span className="badge badge-warning">Sahibini Bekliyor</span>;
      case 'delivered_owner':
        return <span className="badge badge-success">Sahibine Teslim Edildi</span>;
      case 'ready_for_auction':
        return <span className="badge badge-primary">Açık Artırmaya Hazır</span>;
      case 'in_auction':
        return <span className="badge badge-secondary">Açık Artırmada</span>;
      case 'donated':
        return <span className="badge badge-donation">🎁 İhtiyaç Sahibine Bağışlık</span>;
      case 'donated_delivered':
        return <span className="badge badge-success">🎁 Bağış Olarak Teslim Edildi</span>;
      default:
        return <span className="badge badge-primary">{status}</span>;
    }
  };

  // Filtered lists
  const filteredLostItems = lostItems.filter(item => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!item.title.toLowerCase().includes(term) && !item.description.toLowerCase().includes(term)) return false;
    }
    if (filterCategory && item.category !== filterCategory) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterInstitution && item.institutionId !== parseInt(filterInstitution)) return false;
    return true;
  });

  const availableDonationItems = lostItems.filter(i => i.status === 'donated' || i.status === 'no_bid_ended');

  // Institution Panel Filtered Lists
  const activeInstId = user && user.role === 'institution'
    ? (user.institutionId || 1)
    : (instFilter ? parseInt(instFilter) : null);

  const activeInstName = activeInstId 
    ? (institutions.find(i => i.id === activeInstId)?.name || 'Şube Yetkilisi')
    : 'Tüm Şubeler (Sistem Geneli)';

  const filteredPanelItems = lostItems.filter(item => {
    if (!activeInstId) return true;
    return item.institutionId === activeInstId || item.institution?.id === activeInstId;
  });

  const filteredPanelClaims = claims.filter(claim => {
    if (!activeInstId) return true;
    return claim.institutionId === activeInstId || (claim.institutionName && claim.institutionName.toLowerCase().includes(activeInstName.toLowerCase()));
  });

  const filteredPanelAppts = appointments.filter(appt => {
    if (!activeInstId) return true;
    return appt.institutionId === activeInstId || appt.institutionName?.toLowerCase().includes(activeInstName.toLowerCase());
  });

  // Filtered Notifications for current user role
  const unreadNotifs = notifications.filter(n => !n.read && isNotifForUser(n));
  const displayNotifs = notifications
    .filter(isNotifForUser)
    .filter(n => notifFilter === 'unread' ? !n.read : true);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', marginBottom: '25px', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)', flexShrink: 0
          }}>🎒</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{
              fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1,
              background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>EşyaNet</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.01em' }}>Kayıp Eşya Takip & İhale Portalı</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 🔔 Notification Bell Button (Only shown when user is logged in) */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button 
                className="notif-bell-btn" 
                onClick={() => setShowNotifDrawer(!showNotifDrawer)} 
                title="Bildirimler"
              >
                🔔
                {unreadNotifs.length > 0 && (
                  <span className="notif-badge-counter">{unreadNotifs.length}</span>
                )}
              </button>

              {/* 📋 Notification Dropdown Drawer */}
              {showNotifDrawer && (
                <div className="notif-drawer">
                  <div className="notif-drawer-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.95rem' }}>🔔 Bildirimler</strong>
                      {unreadNotifs.length > 0 && (
                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{unreadNotifs.length} Yeni</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {unreadNotifs.length > 0 && (
                        <button className="btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={markAllNotifsAsRead}>
                          Tümünü Okundu Say
                        </button>
                      )}
                      <button className="btn-outline btn-sm" style={{ padding: '2px 6px', fontSize: '0.72rem', borderColor: 'transparent' }} onClick={() => setShowNotifDrawer(false)}>
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Filter tabs inside drawer */}
                  <div style={{ display: 'flex', padding: '8px 16px', gap: '10px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button 
                      style={{ background: 'none', border: 'none', color: notifFilter === 'all' ? '#8b5cf6' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setNotifFilter('all')}
                    >
                      Tümü ({notifications.length})
                    </button>
                    <button 
                      style={{ background: 'none', border: 'none', color: notifFilter === 'unread' ? '#8b5cf6' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setNotifFilter('unread')}
                    >
                      Okunmamış ({unreadNotifs.length})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    {displayNotifs.length === 0 ? (
                      <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {notifFilter === 'unread' ? 'Okunmamış bildiriminiz bulunmuyor.' : 'Henüz bildirim bulunmamaktadır.'}
                      </div>
                    ) : (
                      displayNotifs.map(n => (
                        <div 
                          key={n.id} 
                          className={`notif-item ${!n.read ? 'unread' : ''}`}
                          onClick={() => markNotifAsRead(n.id)}
                        >
                          <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>
                            {n.type === 'success' && '✅'}
                            {n.type === 'auction' && '🔥'}
                            {n.type === 'warning' && '⚠️'}
                            {n.type === 'info' && '📋'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{n.title}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.date}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.35 }}>
                              {n.message}
                            </p>
                          </div>
                          <button 
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.6 }}
                            title="Bildirimi sil"
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            className="btn-outline btn-sm"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title="Tema Değiştir"
            style={{ padding: '6px 14px', fontSize: '0.82rem', borderColor: 'var(--border-glass)', color: 'var(--text-main)', background: 'rgba(255,255,255,0.05)' }}
          >
            {theme === 'dark' ? '☀️ Açık Tema' : '🌙 Koyu Tema'}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.88rem' }}>
                👤 <strong style={{ color: 'var(--text-main)' }}>{user.nameSurname}</strong>
                <span className="badge badge-secondary" style={{ marginLeft: '8px', verticalAlign: 'middle' }}>
                  {user.role === 'admin' ? 'Yönetici' : user.role === 'institution' ? 'Kurum Yetkilisi' : 'Vatandaş'}
                </span>
              </span>
              <button className="btn-outline btn-sm" onClick={handleLogout} style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid var(--color-danger)', color: 'var(--color-danger)' }}>
                Çıkış
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-outline btn-sm" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
                🔑 Giriş Yap
              </button>
              <button className="btn-primary btn-sm" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>
                📝 Üye Ol
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Main Navigation Tabs - Ultra Clean UX */}
      <div className="tabs-nav" style={{ marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
        {/* MAIN PUBLIC PORTAL TAB */}
        <button
          className={`tab-btn ${activeTab === 'citizen_view' ? 'active' : ''}`}
          onClick={() => setActiveTab('citizen_view')}
        >
          🔍 Kayıp Eşya Portalı (Harita & Arama)
        </button>

        <button
          className={`tab-btn ${activeTab === 'feedbacks' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedbacks')}
        >
          ⭐ Memnuniyet & Yorumlar {feedbacks.length > 0 && <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>{feedbacks.length}</span>}
        </button>

        <button
          className={`tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          ❓ Sıkça Sorulan Sorular (SSS)
        </button>

        {/* ADMIN ONLY: Analytics Tab */}
        {user && user.role === 'admin' && (
          <button
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 İstatistik & Analiz Paneli
          </button>
        )}

        {/* CITIZEN SPECIFIC TABS */}
        {user && user.role === 'citizen' && (
          <>
            <button
              className={`tab-btn ${activeTab === 'my_payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('my_payments')}
            >
              💳 Ödemelerim & Kargo Takibi {payments.length > 0 && <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>{payments.length}</span>}
            </button>
            <button
              className={`tab-btn ${activeTab === 'my_requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('my_requests')}
            >
              📋 Taleplerim & Randevularım
              {(claims.filter(c => c.userId === user.id).length + donations.filter(d => d.userId === user.id).length) > 0 && (
                <span style={{ background: '#818cf8', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>
                  {claims.filter(c => c.userId === user.id).length + donations.filter(d => d.userId === user.id).length}
                </span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              💬 Mesajlarım
              {messages.filter(m => m.toUserId === user.id && !m.read).length > 0 && (
                <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>
                  {messages.filter(m => m.toUserId === user.id && !m.read).length}
                </span>
              )}
            </button>
          </>
        )}

        {/* INSTITUTION / ADMIN SPECIFIC TABS */}
        {user && (user.role === 'institution' || user.role === 'admin') && (
          <>
            <button
              className={`tab-btn ${activeTab === 'institution_panel' ? 'active' : ''}`}
              onClick={() => setActiveTab('institution_panel')}
            >
              🏢 Eşya & İhale Yönetimi {claims.filter(c => c.status === 'pending').length > 0 && <span style={{ background: '#818cf8', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>{claims.filter(c => c.status === 'pending').length} Talepler</span>}
            </button>
            <button
              className={`tab-btn ${activeTab === 'cargo_mgmt' ? 'active' : ''}`}
              onClick={() => setActiveTab('cargo_mgmt')}
            >
              🚚 Kargo Yönetimi {payments.filter(p => p.deliveryStatus === 'pending').length > 0 && <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>{payments.filter(p => p.deliveryStatus === 'pending').length}</span>}
            </button>
            <button
              className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => { setActiveTab('messages'); setMessageThread(null); }}
            >
              💬 Vatandaş Mesajları
              {messages.filter(m => m.toRole === user.role && !m.read).length > 0 && (
                <span style={{ background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '6px' }}>
                  {messages.filter(m => m.toRole === user.role && !m.read).length}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* 📢 LIVE ANNOUNCEMENTS BANNER */}
      {announcements.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '14px', padding: '14px 20px',
          marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
            <span style={{ fontSize: '1.4rem' }}>📢</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong style={{ fontSize: '0.94rem', color: '#fff' }}>{announcements[0].title}</strong>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{announcements[0].date}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '3px 0 0 0', lineHeight: 1.35 }}>
                {announcements[0].text}
              </p>
            </div>
          </div>
          {user && (user.role === 'admin' || user.role === 'institution') && (
            <button className="btn-outline btn-sm" style={{ borderColor: '#a78bfa', color: '#a78bfa', padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => setShowAnnounceModal(true)}>
              + Duyuru Yayınla
            </button>
          )}
        </div>
      )}

      {/* TAB 1: CITIZEN VIEW */}
      {activeTab === 'citizen_view' && (
        <div>
          {/* Map Section */}
          <div className="glass-panel" style={{ padding: '25px', marginBottom: '35px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
              📍 Harita Entegrasyonu (Fiziksel Teslim Noktaları)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Bulunan eşyaların teslim edildiği kurum şubelerini haritadan inceleyebilir, işaretçilere tıklayarak iletişim kurabilirsiniz:
            </p>

            <div className="map-container">
              <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom={true}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeMapView center={selectedMapCenter} />
                
                {institutions.map((inst) => {
                  if (!inst || !inst.latitude || !inst.longitude) return null;
                  const lat = parseFloat(inst.latitude);
                  const lng = parseFloat(inst.longitude);
                  if (isNaN(lat) || isNaN(lng)) return null;

                  const instFeedbacks = feedbacks.filter(f => f.institutionId === inst.id);
                  const avgRating = instFeedbacks.length > 0 ? (instFeedbacks.reduce((acc, f) => acc + f.rating, 0) / instFeedbacks.length).toFixed(1) : '5.0';

                  return (
                    <Marker key={inst.id} position={[lat, lng]} icon={createMapIcon('var(--color-primary)')}>
                      <Popup>
                        <div style={{ color: '#111827', fontFamily: 'sans-serif' }}>
                          <h4 style={{ margin: '0 0 3px 0', fontSize: '1rem', fontWeight: 'bold' }}>{inst.name}</h4>
                          <div style={{ margin: '0 0 5px 0', fontSize: '0.82rem', color: '#d97706', fontWeight: 'bold' }}>
                            ⭐ {avgRating} / 5.0 ({instFeedbacks.length} Değerlendirme)
                          </div>
                          <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem' }}>{inst.address}</p>
                          <p style={{ margin: '0', fontSize: '0.85rem' }}><b>Telefon:</b> {inst.contactNumber}</p>
                          <button
                            style={{
                              marginTop: '10px',
                              background: 'var(--color-primary)',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              width: '100%'
                            }}
                            onClick={() => {
                              setFilterInstitution(inst.id.toString());
                              document.getElementById('items-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            Buradaki Eşyaları Filtrele
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Search, Filters and Cards Grid */}
          <div id="items-section" className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>
              🎒 Kayıp Eşya Katalogu
            </h3>

            {/* Filter controls */}
            <div className="search-section">
              <input
                type="text"
                placeholder="Eşya adı, cüzdan, telefon vb. aratın..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select className="search-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">Tüm Kategoriler</option>
                <option value="Telefon">Telefon</option>
                <option value="Cüzdan">Cüzdan</option>
                <option value="Çanta">Çanta</option>
                <option value="Anahtar">Anahtar</option>
                <option value="Diğer">Diğer</option>
              </select>

              <select className="search-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Tüm Durumlar</option>
                <option value="waiting_owner">Sahibini Bekliyor</option>
                <option value="delivered_owner">Sahibine Teslim Edildi</option>
                <option value="ready_for_auction">Açık Artırmaya Hazır</option>
                <option value="donated">🎁 Ücretsiz Bağış Havuzundaki Eşyalar</option>
              </select>

              <select className="search-select" value={filterInstitution} onChange={(e) => setFilterInstitution(e.target.value)}>
                <option value="">Tüm Şubeler</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>

              {(searchTerm || filterCategory || filterStatus || filterInstitution) && (
                <button className="btn-outline btn-sm" onClick={() => { setSearchTerm(''); setFilterCategory(''); setFilterStatus(''); setFilterInstitution(''); }}>
                  Temizle
                </button>
              )}
            </div>

            {/* Items Grid */}
            {filteredLostItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Aradığınız kriterlere uygun kayıp eşya bulunamadı.
              </div>
            ) : (
              <div className="items-grid">
                {filteredLostItems.map((item) => (
                  <div key={item.id} className="card glass-panel item-card">
                    <img 
                      src={getItemImageUrl(item)} 
                      alt={item.title} 
                      className="item-card-image" 
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 className="item-card-title">{item.title}</h4>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="item-card-desc">{item.description}</p>
                    <div className="item-card-meta">
                      <span>📂 <b>Kategori:</b> {item.category}</span>
                      <span>📍 <b>Bulunduğu Yer:</b> {item.locationFound}</span>
                      <span>🏢 <b>Kurum:</b> {item.institution?.name || 'Belirtilmemiş'}</span>
                    </div>

                    {/* 🤖 Smart AI Similar Item Matcher Widget */}
                    {(() => {
                      const similarItems = lostItems.filter(s => s.id !== item.id && (s.category === item.category || s.institutionId === item.institutionId)).slice(0, 2);
                      if (similarItems.length === 0) return null;
                      return (
                        <div style={{ marginTop: '10px', background: 'rgba(129, 140, 248, 0.08)', border: '1px solid rgba(129, 140, 248, 0.2)', padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem' }}>
                          <div style={{ color: '#818cf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            🤖 Akıllı Benzer Buluntu Eşya ({similarItems.length}):
                          </div>
                          {similarItems.map(sim => (
                            <div key={sim.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', marginTop: '3px' }}>
                              <span>• {sim.title}</span>
                              <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>📍 {sim.locationFound}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Action buttons depending on user role & status */}
                    {(!user || user.role === 'citizen') ? (
                      <>
                        {item.status === 'waiting_owner' && (
                          <button className="btn-primary" style={{ marginTop: '15px', width: '100%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }} onClick={() => openClaimModal(item)}>
                            📋 Hak Sahipliği Talebi Oluştur
                          </button>
                        )}

                        {item.status === 'ready_for_auction' && (
                          <button className="btn-primary" style={{ marginTop: '15px', width: '100%', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} onClick={() => openAuctionModal(item)}>
                            🔥 Canlı İhale & Teklif Ver
                          </button>
                        )}

                        {item.status === 'donated' && (
                          <button className="btn-primary" style={{ marginTop: '15px', width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => openDonationModal(item)}>
                            🎁 Ücretsiz Bağış Talep Et
                          </button>
                        )}
                      </>
                    ) : (
                      <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.25)', borderRadius: '10px', textAlign: 'center', fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600 }}>
                        🏢 Kurum Yetkilisi / Admin Görünümü <br/>
                        <span style={{ fontSize: '0.72rem', opacity: 0.8, color: '#cbd5e1' }}>(Yönetim için "Eşya & İhale Yönetimi" sekmesini kullanın)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY PAYMENTS & CARGO TRACKING (STEP 6) */}
      {activeTab === 'my_payments' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>💳 Ödemelerim & Kargo Teslimat Takibi</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Açık artırmada kazandığınız eşyaların ödeme geçmişi ve canlı teslimat durumu</p>
            </div>
            <button className="btn-primary btn-sm" onClick={() => openPaymentModal({ title: 'Açık Artırma Ürünü (Örnek)', currentPrice: 350, institution: { name: 'Beşiktaş Emniyet Müdürlüğü' } })}>
              💳 Örnek Sanal Ödeme Test Et
            </button>
          </div>

          {payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🛒</div>
              <h4>Henüz ödeme yapmış olduğunuz bir sipariş bulunmuyor.</h4>
              <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Açık artırmada kazandığınız ürünlerin ödemelerini bu panelden gerçekleştirebilir ve kargonuzu takip edebilirsiniz.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {payments.map((pay) => (
                <div key={pay.id} className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <img 
                      src={getItemImageUrl(pay)} 
                      alt={pay.itemTitle} 
                      style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px' }} 
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                    />
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{pay.itemTitle}</h4>
                        <span className="badge badge-success">Ödendi ({pay.amount} ₺)</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🏢 <b>Teslimat Şubesi:</b> {pay.institutionName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>📅 <b>Ödeme Tarihi:</b> {new Date(pay.paymentDate).toLocaleString('tr-TR')}</div>
                    </div>
                  </div>

                  {/* Delivery Stepper timeline */}
                  <div className="delivery-stepper">
                    <div className={`stepper-step ${pay.deliveryStatus === 'pending' || pay.deliveryStatus === 'shipped' || pay.deliveryStatus === 'delivered' ? 'completed' : ''}`}>
                      <div className="stepper-icon">✓</div>
                      <span className="stepper-label">Ödeme Alındı</span>
                    </div>

                    <div className={`stepper-step ${pay.deliveryStatus === 'shipped' || pay.deliveryStatus === 'delivered' ? 'completed' : pay.deliveryStatus === 'pending' ? 'active' : ''}`}>
                      <div className="stepper-icon">📦</div>
                      <span className="stepper-label">Kargoya Verildi</span>
                    </div>

                    <div className={`stepper-step ${pay.deliveryStatus === 'delivered' ? 'completed' : ''}`}>
                      <div className="stepper-icon">🏠</div>
                      <span className="stepper-label">Teslim Edildi</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CITIZEN TALEPLERİM VE RANDEVULARIM TAB */}
      {activeTab === 'my_requests' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              📋 Taleplerim & Randevularım
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              Oluşturduğunuz hak sahipliği başvurularını, bağış taleplerinizi ve teslimat randevularınızı buradan takip edin.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Claims Status Card */}
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#a78bfa' }}>📋 Hak Sahipliği Taleplerim</h5>
              {claims.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Oluşturulmuş hak sahipliği talebiniz bulunmamaktadır.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {claims.map(c => {
                    const hasAppt = appointments.some(a => (a.claimId === c.id || a.lostItemId === c.itemId) && a.status === 'scheduled');
                    return (
                      <div key={c.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{c.itemTitle}</strong>
                          {c.status === 'pending' && <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>İncelemede</span>}
                          {c.status === 'approved' && <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ Onaylandı</span>}
                          {c.status === 'rejected' && <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>✕ Reddedildi</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>🏢 {c.institutionName}</div>
                        {c.status === 'approved' && (
                          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            {hasAppt ? (
                              <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>📅 Randevunuz Alındı</span>
                            ) : (
                              <button className="btn-primary btn-sm" style={{ padding: '4px 12px', fontSize: '0.78rem', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }} onClick={() => openApptModal(c)}>
                                📅 Şubeden Teslim Randevusu Al
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Donations Status Card */}
            <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: '#34d399' }}>🎁 Ücretsiz Bağış Taleplerim</h5>
              {donations.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Oluşturulmuş bağış talebiniz bulunmamaktadır.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {donations.map(d => {
                    const hasAppt = appointments.some(a => a.lostItemId === d.lostItemId && a.status === 'scheduled');
                    return (
                      <div key={d.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{d.itemTitle}</strong>
                          {d.status === 'pending' && <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Kurum Onayında</span>}
                          {d.status === 'approved' && <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ Onaylandı</span>}
                          {d.status === 'rejected' && <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>✕ Reddedildi</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>🏢 {d.institutionName}</div>
                        {d.status === 'approved' && (
                          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            {hasAppt ? (
                              <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>📅 Randevunuz Alındı</span>
                            ) : (
                              <button className="btn-primary btn-sm" style={{ padding: '4px 12px', fontSize: '0.78rem', background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={() => openApptModal(d)}>
                                📅 Şubeden Teslim Randevusu Al
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Appointments Overview Card */}
          <div className="glass-panel" style={{ padding: '24px', marginTop: '25px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <h5 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '15px', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📅 Aktif Şube Teslim Randevularım ({appointments.filter(a => user && (String(a.userId) === String(user.id) || user.role === 'admin')).length})
            </h5>

            {appointments.filter(a => user && (String(a.userId) === String(user.id) || user.role === 'admin')).length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '15px' }}>
                Henüz oluşturulmuş aktif teslimat randevunuz bulunmuyor. Onaylanan hak sahipliği talepleriniz üzerinden randevu alabilirsiniz.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {appointments.filter(a => user && (String(a.userId) === String(user.id) || user.role === 'admin')).map(appt => (
                  <div key={appt.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{appt.itemTitle}</strong>
                      {appt.status === 'scheduled' && <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>⌛ Randevu Bekliyor</span>}
                      {appt.status === 'completed' && <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>✅ Teslim Edildi</span>}
                      {appt.status === 'cancelled' && <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>✕ İptal Edildi</span>}
                      {appt.status === 'no_show' && <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>⚠️ Gelinmedi</span>}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#67e8f9', margin: '4px 0', fontWeight: 600 }}>
                      📍 {appt.institutionName}
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#fbbf24', marginTop: '6px', fontWeight: 700 }}>
                      📅 Tarih: {appt.appointmentDate} · ⏰ {appt.timeSlot}
                    </div>

                    {appt.note && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                        "Not: {appt.note}"
                      </div>
                    )}

                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button className="btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => openProtocolModal(appt)}>
                        🖨️ Teslim Tutanağı (PDF)
                      </button>
                      {appt.status === 'scheduled' && (
                        <button className="btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleUpdateApptStatus(appt.id, 'cancelled')}>
                          ✕ Randevuyu İptal Et
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💬 MESSAGES TAB */}
      {activeTab === 'messages' && user && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              💬 {user.role === 'citizen' ? 'Mesajlarım' : 'Vatandaş Mesajları'}
            </h3>
            <button
              className="btn-outline btn-sm"
              onClick={() => setMsgRefreshTrigger(prev => prev + 1)}
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              🔄 Mesajları Yenile
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '25px', marginTop: 0 }}>
            {user.role === 'citizen'
              ? 'Taleplerinizle ilgili kurum yetkililerine mesaj gönderebilirsiniz.'
              : 'Vatandaşlardan gelen mesajları görüntüleyin ve yanıtlayın.'}
          </p>

          {/* INSTITUTION VIEW: Show list of threads on left, chat on right */}
          {user.role !== 'citizen' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', minHeight: '400px' }}>
              {/* Thread List */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  👤 Vatandaşlar
                </div>
                {(() => {
                  // Get all unique citizen user IDs in the messages
                  const citizenIds = [...new Set(messages.flatMap(m => [m.fromUserId, m.toUserId]))]
                    .filter(id => id && String(id) !== String(user.id) && id !== 'institution');
                  
                  if (citizenIds.length === 0) {
                    return (
                      <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Henüz mesaj yok
                      </div>
                    );
                  }
                  
                  return citizenIds.map(uid => {
                    // Find the last message in this thread
                    const threadMsgs = messages.filter(m => String(m.fromUserId) === String(uid) || String(m.toUserId) === String(uid));
                    const lastMsg = threadMsgs.slice(-1)[0];
                    const citizenMsg = threadMsgs.find(m => String(m.fromUserId) === String(uid));
                    const citizenName = citizenMsg ? citizenMsg.fromName : 'Vatandaş';
                    const unread = threadMsgs.filter(m => String(m.fromUserId) === String(uid) && !m.read).length;

                    return (
                      <div
                        key={uid}
                        onClick={() => {
                          setMessageThread(uid);
                          setMessages(prev => prev.map(m => String(m.fromUserId) === String(uid) ? { ...m, read: true } : m));
                          // Call API to mark thread as read
                          axios.put(`http://localhost:5030/api/messages/read-thread?fromUserId=${uid}&toInstId=${user.institutionId || 0}`).catch(() => {});
                        }}
                        style={{
                          padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: messageThread === uid ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                          borderLeft: messageThread === uid ? '3px solid #8b5cf6' : '3px solid transparent',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{citizenName}</span>
                          {unread > 0 && <span style={{ background: '#10b981', color: '#fff', borderRadius: '10px', padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700 }}>{unread}</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lastMsg?.text?.slice(0, 38)}{lastMsg?.text?.length > 38 ? '...' : ''}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Chat Window */}
              <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.15)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                {!messageThread ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ← Sol taraftan bir vatandaş seçin
                  </div>
                ) : (() => {
                  const sendReply = async () => {
                    if (!newMessage.trim()) return;
                    const dto = {
                      fromUserId: user.id,
                      FromName: user.nameSurname,
                      toUserId: messageThread, // The citizen's user id
                      toRole: 'citizen',
                      toInstId: user.institutionId,
                      msgType: 'Genel',
                      text: newMessage.trim()
                    };
                    const optimistic = {
                      id: Date.now(),
                      fromUserId: user.id,
                      fromName: user.nameSurname,
                      toUserId: messageThread,
                      toRole: 'citizen',
                      toInstId: user.institutionId,
                      msgType: 'Genel',
                      text: newMessage.trim(),
                      read: false,
                      date: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, optimistic]);
                    setNewMessage('');
                    try {
                      const res = await axios.post('http://localhost:5030/api/messages', dto);
                      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...optimistic, id: res.data.id } : m));
                    } catch (err) {}
                    addNotification('💬 Yetkiliden Mesaj Geldi', `${user.nameSurname}: ${dto.text}`, 'info', 'citizen');
                  };
                  return (
                    <>
                      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: '0.9rem' }}>
                        💬 {messages.find(m => String(m.fromUserId) === String(messageThread))?.fromName || 'Vatandaş'} ile Konuşma
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px' }}>
                        {messages.filter(m => String(m.fromUserId) === String(messageThread) || String(m.toUserId) === String(messageThread)).map(m => (
                          <div key={m.id} style={{ display: 'flex', justifyContent: String(m.fromUserId) === String(user.id) ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '70%', padding: '10px 14px', borderRadius: String(m.fromUserId) === String(user.id) ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              background: String(m.fromUserId) === String(user.id) ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'rgba(255,255,255,0.08)',
                              fontSize: '0.88rem', lineHeight: 1.5
                            }}>
                              {m.text}
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textAlign: 'right' }}>{m.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px' }}>
                        <input
                          type="text" placeholder="Yanıtınızı yazın..." value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') sendReply(); }}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                        />
                        <button className="btn-primary" style={{ padding: '10px 18px' }} onClick={sendReply}>Gönder ➤</button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* CITIZEN VIEW: Select institution on left, chat on right */
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', minHeight: '420px' }}>
              {/* Institution List */}
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  🏛️ Kurum Seç
                </div>
                {institutions.map(inst => {
                  const unread = messages.filter(m => String(m.toUserId) === String(user.id) && String(m.toInstId) === String(inst.id) && !m.read).length;
                  const lastMsg = messages.filter(m => (String(m.fromUserId) === String(user.id) && String(m.toInstId) === String(inst.id)) || (String(m.toUserId) === String(user.id) && String(m.toInstId) === String(inst.id))).slice(-1)[0];
                  return (
                    <div
                      key={inst.id}
                      onClick={() => {
                        setMessageThread(inst.id);
                        setMessages(prev => prev.map(m => String(m.toInstId) === String(inst.id) && String(m.toUserId) === String(user.id) ? { ...m, read: true } : m));
                      }}
                      style={{
                        padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: messageThread === inst.id ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                        borderLeft: messageThread === inst.id ? '3px solid #8b5cf6' : '3px solid transparent',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.3 }}>{inst.name}</span>
                        {unread > 0 && <span style={{ background: '#10b981', color: '#fff', borderRadius: '10px', padding: '2px 7px', fontSize: '0.72rem', fontWeight: 700 }}>{unread}</span>}
                      </div>
                      {lastMsg && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {lastMsg.text?.slice(0, 36)}{lastMsg.text?.length > 36 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chat Window */}
              <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.15)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                {!messageThread ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    ← Sol taraftan bir kurum seçin
                  </div>
                ) : (() => {
                  const selInst = institutions.find(i => i.id === messageThread);
                  const threadMsgs = messages.filter(m =>
                    (String(m.fromUserId) === String(user.id) && String(m.toInstId) === String(messageThread)) ||
                    (String(m.toUserId) === String(user.id) && String(m.toInstId) === String(messageThread))
                  );
                  const MSG_TYPES = [
                    { label: '💬 Genel', value: 'Genel', color: '#6366f1' },
                    { label: '🆘 Yardım', value: 'Yardım', color: '#ef4444' },
                    { label: '📢 Şikayet', value: 'Şikayet', color: '#f59e0b' },
                    { label: '📋 Bilgi Talebi', value: 'Bilgi Talebi', color: '#06b6d4' },
                    { label: '🙏 Teşekkür', value: 'Teşekkür', color: '#10b981' },
                  ];
                  const sendMsg = async () => {
                    if (!newMessage.trim()) return;
                    const dto = {
                      fromUserId: user.id, fromName: user.nameSurname,
                      toUserId: null, toRole: 'institution', toInstId: messageThread,
                      toInstName: selInst?.name,
                      msgType: msgType,
                      text: newMessage.trim()
                    };
                    const optimistic = {
                      id: Date.now(), ...dto,
                      read: false,
                      date: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, optimistic]);
                    setNewMessage('');
                    try {
                      const res = await axios.post('http://localhost:5030/api/messages', dto);
                      // Replace optimistic entry with real DB record
                      setMessages(prev => prev.map(m => m.id === optimistic.id ? {
                        ...optimistic, id: res.data.id
                      } : m));
                    } catch { /* backend offline — optimistic message stays */ }
                    addNotification(`💬 [${msgType}] Yeni Vatandaş Mesajı`, `${user.nameSurname} → ${selInst?.name}: ${dto.text}`, 'info', 'institution');
                  };
                  return (
                    <>
                      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, fontSize: '0.9rem' }}>
                        💬 {selInst?.name} ile Konuşma
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px' }}>
                        {threadMsgs.length === 0 && (
                          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '60px' }}>
                            Henüz mesaj yok. İlk mesajınızı gönderin.
                          </div>
                        )}
                        {threadMsgs.map(m => (
                          <div key={m.id} style={{ display: 'flex', justifyContent: m.fromUserId === user.id ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '70%', padding: '10px 14px',
                              borderRadius: m.fromUserId === user.id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              background: m.fromUserId === user.id ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'rgba(255,255,255,0.08)',
                              fontSize: '0.88rem', lineHeight: 1.5
                            }}>
                              {m.msgType && m.msgType !== 'Genel' && (
                                <div style={{ marginBottom: '5px' }}>
                                  <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                                    background: m.msgType === 'Yardım' ? 'rgba(239,68,68,0.3)' : m.msgType === 'Şikayet' ? 'rgba(245,158,11,0.3)' : m.msgType === 'Bilgi Talebi' ? 'rgba(6,182,212,0.3)' : 'rgba(16,185,129,0.3)',
                                    color: m.msgType === 'Yardım' ? '#fca5a5' : m.msgType === 'Şikayet' ? '#fcd34d' : m.msgType === 'Bilgi Talebi' ? '#67e8f9' : '#6ee7b7',
                                    border: '1px solid rgba(255,255,255,0.15)'
                                  }}>
                                    {m.msgType === 'Yardım' ? '🆘' : m.msgType === 'Şikayet' ? '📢' : m.msgType === 'Bilgi Talebi' ? '📋' : '🙏'} {m.msgType}
                                  </span>
                                </div>
                              )}
                              {m.text}
                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textAlign: 'right' }}>{m.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: '10px 18px 14px', borderTop: 'none', display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <input
                          type="text" placeholder={`${selInst?.name} yetkilisine mesaj yazın...`}
                          value={newMessage} onChange={e => setNewMessage(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') sendMsg(); }}
                          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                        />
                        <button className="btn-primary" style={{ padding: '10px 18px' }} onClick={sendMsg}>Gönder ➤</button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ⭐ FEEDBACKS & REVIEWS TAB */}
      {activeTab === 'feedbacks' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          {/* Header Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ⭐ Vatandaş Memnuniyeti & Teşekkür Yorumları
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                Kayıp eşyasını teslim alan, ihale kazanan veya bağıştan faydalanan vatandaşlarımızın kurumlarımız hakkındaki görüşleri.
              </p>
            </div>
            {(!user || user.role === 'citizen') && (
              <button
                className="btn-primary"
                onClick={() => {
                  if (!user) {
                    alert("Değerlendirme ve yorum yapabilmek için lütfen giriş yapın.");
                    setAuthMode('login');
                    setShowAuthModal(true);
                    return;
                  }
                  setShowReviewModal(true);
                }}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', padding: '10px 20px', fontSize: '0.9rem' }}
              >
                ✍️ Değerlendirme & Yorum Yap
              </button>
            )}
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '18px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
                {(feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0
              </div>
              <div style={{ fontSize: '1rem', color: '#fbbf24', marginTop: '2px' }}>
                {'★'.repeat(Math.round(feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length || 1)))}{'☆'.repeat(5 - Math.round(feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length || 1)))}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Ortalama Memnuniyet Puanı</div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '18px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{feedbacks.length}</div>
              <div style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 600, marginTop: '2px' }}>Değerlendirme & Yorum</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Doğrulanmış Vatandaş Görüşü</div>
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '18px', borderRadius: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa' }}>%98.5</div>
              <div style={{ fontSize: '0.85rem', color: '#c4b5fd', fontWeight: 600, marginTop: '2px' }}>Teslimat Başarısı</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Eşya İade Memnuniyet Oranı</div>
            </div>
          </div>

          {/* Feedback Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {feedbacks.map(item => (
              <div key={item.id} style={{
                background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}>
                <div>
                  {/* Top user row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff'
                      }}>
                        {item.userName ? item.userName.charAt(0) : 'V'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#fff', display: 'block' }}>{item.userName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.userRole} · {item.date}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '12px',
                      background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div style={{ fontSize: '1.1rem', color: '#f59e0b', marginBottom: '10px' }}>
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({item.rating}.0 / 5.0)</span>
                  </div>

                  {/* Institution Tag */}
                  <div style={{ fontSize: '0.8rem', color: '#67e8f9', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🏛️ {item.institutionName}
                  </div>

                  {/* Comment */}
                  <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                    "{item.comment}"
                  </p>
                </div>

                {/* Institution Reply Box */}
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {item.reply ? (
                    <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '10px 14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', marginBottom: '3px' }}>
                        🏛️ Kurum Yetkilisi Yanıtı:
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#ddd' }}>{item.reply}</div>
                    </div>
                  ) : user && (user.role === 'institution' || user.role === 'admin') ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Kurum adına yanıt yazın..."
                        value={replyTextMap[item.id] || ''}
                        onChange={e => setReplyTextMap({ ...replyTextMap, [item.id]: e.target.value })}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                      />
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleReplyReview(item.id)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#8b5cf6' }}
                      >
                        Yanıtla
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DONATION POOL (STEP 6) */}
      {activeTab === 'donation_pool' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎁 İhtiyaç Sahibi Bağış Havuzu
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Sahibi çıkmayan veya açık artırma süresi dolan ürünler, belediye ve kurumlarımız tarafından ihtiyaç sahibi vatandaşlarımıza **ücretsiz** olarak bağışlanmaktadır.
            </p>
          </div>

          {/* User's existing requests section if logged in */}
          {user && donations.length > 0 && (
            <div style={{ marginBottom: '35px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '15px', color: '#6ee7b7' }}>📋 Bağış Taleplerim ve Takip Durumu</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {donations.map(don => (
                  <div key={don.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>📦</span>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{don.itemTitle}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {don.institutionName} · Tarih: {new Date(don.requestDate).toLocaleDateString('tr-TR')}</div>
                      </div>
                    </div>
                    <div>
                      {don.status === 'pending' && <span className="badge badge-warning">⌛ Kurum Onayı Bekliyor</span>}
                      {don.status === 'approved' && <span className="badge badge-success">✅ Talebiniz Onaylandı (Teslim Alabilirsiniz)</span>}
                      {don.status === 'rejected' && <span className="badge badge-danger">❌ Talebiniz Reddedildi</span>}
                      {don.status === 'delivered' && <span className="badge badge-success">🎉 Teslim Edildi</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Donation Items Grid */}
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>✨ Ücretsiz Talep Edilebilir Bağışlık Eşyalar</h4>
          {availableDonationItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Şu anda bağış havuzunda listelenen eşya bulunmamaktadır.
            </div>
          ) : (
            <div className="items-grid">
              {availableDonationItems.map(item => (
                <div key={item.id} className="card glass-panel item-card" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <img 
                    src={getItemImageUrl(item)} 
                    alt={item.title} 
                    className="item-card-image" 
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 className="item-card-title">{item.title}</h4>
                    <span className="badge badge-donation">🎁 Ücretsiz Bağışlık</span>
                  </div>
                  <p className="item-card-desc">{item.description}</p>
                  <div className="item-card-meta">
                    <span>🏢 <b>Bağış Yapan Kurum:</b> {item.institution?.name || 'Belediye Şubesi'}</span>
                    <span>📍 <b>Bulunduğu Konum:</b> {item.locationFound}</span>
                  </div>
                  {(!user || user.role === 'citizen') ? (
                    <button className="btn-primary" style={{ marginTop: '15px', width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontWeight: 'bold' }} onClick={() => openDonationModal(item)}>
                      🎁 Ücretsiz Bağış Talep Et
                    </button>
                  ) : (
                    <div style={{ marginTop: '15px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', textAlign: 'center', fontSize: '0.78rem', color: '#6ee7b7', fontWeight: 600 }}>
                      🏢 Kurum Yetkilisi / Admin Görünümü
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INSTITUTION PANEL */}
      {activeTab === 'institution_panel' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          {(!user || (user.role !== 'institution' && user.role !== 'admin')) ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>🔒 Yetkili Girişi Gerekli</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Bu panele erişmek için Kurum Yetkilisi veya Admin olarak giriş yapmalısınız.</p>
              <button className="btn-primary" style={{ marginTop: '15px' }} onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>Giriş Yap</button>
            </div>
          ) : (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>🏢 Kurum & Eşya Yönetim Paneli</h3>
                    <div style={{ fontSize: '0.88rem', color: '#818cf8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📍 <b>Yetkili Şube:</b></span>
                      {user.role === 'admin' ? (
                        <select 
                          className="search-select" 
                          style={{ padding: '4px 10px', fontSize: '0.85rem' }} 
                          value={instFilter} 
                          onChange={(e) => setInstFilter(e.target.value)}
                        >
                          <option value="">🏛️ Tüm Şubeler (Sistem Geneli - Admin)</option>
                          {institutions.map(inst => (
                            <option key={inst.id} value={inst.id}>🏢 {inst.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>🏢 {activeInstName}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {user.role === 'admin' && (
                      <button className="btn-outline btn-sm" style={{ borderColor: '#818cf8', color: '#818cf8' }} onClick={() => setShowInstModal(true)}>+ Yeni Şube/Kurum Ekle (Admin)</button>
                    )}
                    <button className="btn-primary btn-sm" onClick={() => setShowItemModal(true)}>+ Yeni Buluntu Eşya Kaydet</button>
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                  <button 
                    className={`btn-outline btn-sm ${instPanelSubTab === 'claims' ? 'active' : ''}`}
                    onClick={() => setInstPanelSubTab('claims')}
                    style={{
                      background: instPanelSubTab === 'claims' ? 'rgba(129, 140, 248, 0.2)' : 'transparent',
                      borderColor: instPanelSubTab === 'claims' ? '#818cf8' : 'rgba(255,255,255,0.1)',
                      color: instPanelSubTab === 'claims' ? '#fff' : 'var(--text-muted)',
                      fontWeight: 600
                    }}
                  >
                    📋 Hak Sahipliği Talepleri ({filteredPanelClaims.length})
                    {filteredPanelClaims.filter(c => c.status === 'pending').length > 0 && (
                      <span style={{ background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', marginLeft: '6px' }}>
                        {filteredPanelClaims.filter(c => c.status === 'pending').length}
                      </span>
                    )}
                  </button>

                  <button 
                    className={`btn-outline btn-sm ${instPanelSubTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setInstPanelSubTab('appointments')}
                    style={{
                      background: instPanelSubTab === 'appointments' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                      borderColor: instPanelSubTab === 'appointments' ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                      color: instPanelSubTab === 'appointments' ? '#fff' : 'var(--text-muted)',
                      fontWeight: 600
                    }}
                  >
                    📅 Şube Teslim Randevuları ({filteredPanelAppts.length})
                    {filteredPanelAppts.filter(a => a.status === 'scheduled').length > 0 && (
                      <span style={{ background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', marginLeft: '6px' }}>
                        {filteredPanelAppts.filter(a => a.status === 'scheduled').length}
                      </span>
                    )}
                  </button>

                  <button 
                    className={`btn-outline btn-sm ${instPanelSubTab === 'items' ? 'active' : ''}`}
                    onClick={() => setInstPanelSubTab('items')}
                    style={{
                      background: instPanelSubTab === 'items' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                      borderColor: instPanelSubTab === 'items' ? '#34d399' : 'rgba(255,255,255,0.1)',
                      color: instPanelSubTab === 'items' ? '#fff' : 'var(--text-muted)',
                      fontWeight: 600
                    }}
                  >
                    🎒 Buluntu Eşya Kayıtları ({filteredPanelItems.length})
                  </button>

                  <button 
                    className={`btn-outline btn-sm ${instPanelSubTab === 'donations' ? 'active' : ''}`}
                    onClick={() => setInstPanelSubTab('donations')}
                    style={{
                      background: instPanelSubTab === 'donations' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                      borderColor: instPanelSubTab === 'donations' ? '#10b981' : 'rgba(255,255,255,0.1)',
                      color: instPanelSubTab === 'donations' ? '#fff' : 'var(--text-muted)',
                      fontWeight: 600
                    }}
                  >
                    🎁 Bağış Talepleri ({donations.length})
                    {donations.filter(d => d.status === 'pending').length > 0 && (
                      <span style={{ background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem', marginLeft: '6px' }}>
                        {donations.filter(d => d.status === 'pending').length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Sub Tab 1: Claims */}
                {instPanelSubTab === 'claims' && (
                  <div style={{ background: 'rgba(129, 140, 248, 0.05)', border: '1px solid rgba(129, 140, 248, 0.2)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#818cf8' }}>
                      📋 Şubeye Gelen Hak Sahipliği Talepleri
                    </h4>
                    {filteredPanelClaims.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Bu şube için bekleyen hak sahipliği talebi bulunmamaktadır.</div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '10px' }}>Talep Eden Vatandaş</th>
                              <th style={{ padding: '10px' }}>İletişim Tel</th>
                              <th style={{ padding: '10px' }}>Talep Edilen Eşya</th>
                              <th style={{ padding: '10px' }}>Kanıt & Açıklama</th>
                              <th style={{ padding: '10px' }}>Durum</th>
                              <th style={{ padding: '10px', textAlign: 'right' }}>Doğrulama Kararı</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPanelClaims.map(claim => (
                              <tr key={claim.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '10px', fontWeight: 600 }}>{claim.citizenName}</td>
                                <td style={{ padding: '10px' }}>{claim.citizenPhone}</td>
                                <td style={{ padding: '10px', color: '#60a5fa', fontWeight: 'bold' }}>{claim.itemTitle}</td>
                                <td style={{ padding: '10px', maxWidth: '250px' }}>
                                  <div style={{ fontSize: '0.8rem', color: '#a78bfa' }}><b>Kanıt:</b> {claim.proofType}</div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{claim.description}</div>
                                </td>
                                <td style={{ padding: '10px' }}>
                                  {claim.status === 'pending' && <span className="badge badge-warning">Beklemede</span>}
                                  {claim.status === 'approved' && <span className="badge badge-success">✓ Hak Sahipliği Onaylandı</span>}
                                  {claim.status === 'rejected' && <span className="badge badge-danger">✕ Reddedildi</span>}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                  {claim.status === 'pending' ? (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                      <button className="btn-primary btn-sm" style={{ background: '#10b981' }} onClick={() => handleApproveClaim(claim.id, claim.itemId)}>
                                        ✓ Hak Sahipliğini Onayla
                                      </button>
                                      <button className="btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleRejectClaim(claim.id)}>
                                        ✕ Reddet
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>İşlem Tamamlandı</span>
                                      {claim.status === 'approved' && (
                                        <button className="btn-outline btn-sm" style={{ borderColor: '#60a5fa', color: '#60a5fa', fontSize: '0.78rem' }} onClick={() => openProtocolModal(claim)}>
                                          📄 Resmi Tutanak
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub Tab 2: Appointments */}
                {instPanelSubTab === 'appointments' && (
                  <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '20px', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#c4b5fd' }}>
                      📅 Şube Fiziksel Teslimat Randevuları ({filteredPanelAppts.length})
                    </h4>
                    {filteredPanelAppts.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '15px', textAlign: 'center' }}>
                        Bu şube için kayıtlı teslimat randevusu bulunmamaktadır.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '10px' }}>Teslim Alacak Vatandaş</th>
                              <th style={{ padding: '10px' }}>Telefon</th>
                              <th style={{ padding: '10px' }}>Teslim Edilecek Eşya</th>
                              <th style={{ padding: '10px' }}>Randevu Tarihi & Saat</th>
                              <th style={{ padding: '10px' }}>Durum</th>
                              <th style={{ padding: '10px', textAlign: 'right' }}>Randevu Yönetimi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPanelAppts.map(appt => (
                              <tr key={appt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '10px', fontWeight: 600, color: '#fff' }}>👤 {appt.userName}</td>
                                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>📞 {appt.userPhone}</td>
                                <td style={{ padding: '10px', color: '#a78bfa', fontWeight: 700 }}>🎒 {appt.itemTitle}</td>
                                <td style={{ padding: '10px', color: '#fbbf24', fontWeight: 600 }}>📅 {appt.appointmentDate} <br/><small style={{ color: 'var(--text-muted)' }}>⏰ {appt.timeSlot}</small></td>
                                <td style={{ padding: '10px' }}>
                                  {appt.status === 'scheduled' && <span className="badge badge-warning">⌛ Randevu Bekliyor</span>}
                                  {appt.status === 'completed' && <span className="badge badge-success">✅ Teslim Edildi</span>}
                                  {appt.status === 'cancelled' && <span className="badge badge-danger">✕ İptal Edildi</span>}
                                  {appt.status === 'no_show' && <span className="badge badge-danger">⚠️ Gelinmedi</span>}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                  {appt.status === 'scheduled' ? (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                      <button className="btn-primary btn-sm" style={{ background: '#10b981', fontSize: '0.78rem' }} onClick={() => handleUpdateApptStatus(appt.id, 'completed')}>
                                        ✅ Teslim Edildi (Tamamla)
                                      </button>
                                      <button className="btn-outline btn-sm" style={{ borderColor: '#f59e0b', color: '#f59e0b', fontSize: '0.78rem' }} onClick={() => handleUpdateApptStatus(appt.id, 'no_show')}>
                                        ⚠️ Gelinmedi
                                      </button>
                                      <button className="btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444', fontSize: '0.78rem' }} onClick={() => handleUpdateApptStatus(appt.id, 'cancelled')}>
                                        ✕ İptal
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tamamlandı</span>
                                      {appt.status === 'completed' && (
                                        <button className="btn-outline btn-sm" style={{ borderColor: '#60a5fa', color: '#60a5fa', fontSize: '0.78rem' }} onClick={() => openProtocolModal(appt)}>
                                          📄 Resmi Tutanak
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub Tab 3: Items */}
                {instPanelSubTab === 'items' && (
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>🎒 Şubedeki Buluntu Eşya Kayıtları ({filteredPanelItems.length})</h4>
                    {filteredPanelItems.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '20px', textAlign: 'center' }}>
                        Bu şubede şu anda kayıtlı eşya bulunmamaktadır.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '12px' }}>Eşya</th>
                              <th style={{ padding: '12px' }}>Kategori</th>
                              <th style={{ padding: '12px' }}>Bulunduğu Yer</th>
                              <th style={{ padding: '12px' }}>Durum</th>
                              <th style={{ padding: '12px', textAlign: 'right' }}>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPanelItems.map(item => (
                              <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px', fontWeight: 600 }}>{item.title}</td>
                                <td style={{ padding: '12px' }}>{item.category}</td>
                                <td style={{ padding: '12px' }}>{item.locationFound}</td>
                                <td style={{ padding: '12px' }}>{getStatusBadge(item.status)}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                  {user && (user.role === 'admin' || (user.role === 'institution' && (item.institutionId === user.institutionId || !item.institutionId))) ? (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                      {item.status === 'waiting_owner' && (
                                        <button className="btn-outline btn-sm" style={{ borderColor: '#10b981', color: '#10b981' }} onClick={() => handleUpdateStatus(item.id, 'delivered_owner')}>Sahibine Teslim Et</button>
                                      )}
                                      {item.status === 'waiting_owner' && (
                                        <button className="btn-outline btn-sm" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => handleUpdateStatus(item.id, 'ready_for_auction')}>İhaleye Çıkar</button>
                                      )}
                                      {item.status !== 'donated' && (
                                        <button className="btn-outline btn-sm" style={{ borderColor: '#34d399', color: '#34d399' }} onClick={() => handleMoveToDonationPool(item.id)}>Bağışa Aktar</button>
                                      )}
                                      <button className="btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDeleteItem(item.id)}>Sil</button>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 Başka Şube Kaydı</span>
                                  )}
                                </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                  </div>
                )}
                {/* Sub Tab 4: Donations & Cargo */}
                {instPanelSubTab === 'donations' && (
                  <div>
                    {/* Donation Requests Section */}
                    <div style={{ marginBottom: '40px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px', color: '#6ee7b7' }}>🎁 Gelen Vatandaş Bağış Talepleri</h4>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                              <th style={{ padding: '12px' }}>Talep Eden</th>
                              <th style={{ padding: '12px' }}>Eşya</th>
                              <th style={{ padding: '12px' }}>Talep Tarihi</th>
                              <th style={{ padding: '12px' }}>Durum</th>
                              <th style={{ padding: '12px', textAlign: 'right' }}>Onay İşlemleri</th>
                            </tr>
                          </thead>
                          <tbody>
                            {donations.map(don => (
                              <tr key={don.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px', fontWeight: 600 }}>{don.recipientName}</td>
                                <td style={{ padding: '12px' }}>{don.itemTitle}</td>
                                <td style={{ padding: '12px' }}>{new Date(don.requestDate).toLocaleDateString('tr-TR')}</td>
                                <td style={{ padding: '12px' }}>
                                  {don.status === 'pending' && <span className="badge badge-warning">Beklemede</span>}
                                  {don.status === 'approved' && <span className="badge badge-success">Onaylandı</span>}
                                  {don.status === 'rejected' && <span className="badge badge-danger">Reddedildi</span>}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                  {don.status === 'pending' ? (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                      <button className="btn-primary btn-sm" style={{ background: '#10b981' }} onClick={() => handleUpdateDonationStatus(don.id, 'approved')}>✓ Onayla</button>
                                      <button className="btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleUpdateDonationStatus(don.id, 'rejected')}>✕ Reddet</button>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>İşlem Tamamlandı</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        )}

      {/* KARGO YÖNETİMİ TAB - Kurum/Admin */}
      {activeTab === 'cargo_mgmt' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          {(!user || (user.role !== 'institution' && user.role !== 'admin')) ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>🔒 Yetkili Girişi Gerekli</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Bu panele yalnızca Kurum Yetkilileri ve Yöneticiler erişebilir.</p>
              <button className="btn-primary" style={{ marginTop: '15px' }} onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>Giriş Yap</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🚚 Kargo & Teslimat Yönetimi
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '5px' }}>
                    İhale kazananlarına ve satın alınan ürünlere ait kargo süreçlerini buradan yönetin.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', padding: '10px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{payments.filter(p => p.deliveryStatus === 'pending').length}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hazırlanıyor</div>
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '10px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{payments.filter(p => p.deliveryStatus === 'shipped').length}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kargoda</div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '10px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{payments.filter(p => p.deliveryStatus === 'delivered').length}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teslim Edildi</div>
                  </div>
                </div>
              </div>

              {(() => {
                const filteredPayments = payments.filter(pay => !user || user.role === 'admin' || pay.institutionId === user.institutionId || !pay.institutionId);
                if (filteredPayments.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      📦 Şubenize ait kargo takibi yapılacak ödeme kaydı bulunmamaktadır.
                    </div>
                  );
                }
                return (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '13px' }}>Alıcı Vatandaş</th>
                          <th style={{ padding: '13px' }}>Eşya</th>
                          <th style={{ padding: '13px' }}>Ödenen Tutar</th>
                          <th style={{ padding: '13px' }}>Ödeme Tarihi</th>
                          <th style={{ padding: '13px' }}>Kargo Durumu</th>
                          <th style={{ padding: '13px', textAlign: 'right' }}>Teslimat Güncelle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map(pay => (
                        <tr key={pay.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '13px', fontWeight: 600, color: '#f1f5f9' }}>👤 {pay.userName}</td>
                          <td style={{ padding: '13px', color: '#a78bfa', fontWeight: 600 }}>🎒 {pay.itemTitle}</td>
                          <td style={{ padding: '13px', color: '#10b981', fontWeight: 700 }}>💰 {pay.amount} ₺</td>
                          <td style={{ padding: '13px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString('tr-TR') : '—'}
                          </td>
                          <td style={{ padding: '13px' }}>
                            {pay.deliveryStatus === 'pending' && <span className="badge badge-warning">⏳ Hazırlanıyor</span>}
                            {pay.deliveryStatus === 'shipped' && <span className="badge badge-primary">📦 Kargoya Verildi</span>}
                            {pay.deliveryStatus === 'delivered' && <span className="badge badge-success">🏠 Teslim Edildi</span>}
                          </td>
                          <td style={{ padding: '13px', textAlign: 'right' }}>
                            {pay.deliveryStatus !== 'delivered' ? (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                {pay.deliveryStatus === 'pending' && (
                                  <button className="btn-outline btn-sm" style={{ borderColor: '#3b82f6', color: '#3b82f6' }} onClick={() => handleUpdateDeliveryStatus(pay.id, 'shipped')}>📦 Kargoya Ver</button>
                                )}
                                <button className="btn-primary btn-sm" style={{ background: '#10b981' }} onClick={() => handleUpdateDeliveryStatus(pay.id, 'delivered')}>🏠 Teslim Edildi</button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>✅ Tamamlandı</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            </div>
          )}
        </div>
      )}

      {/* STEP 7: ANALYTICS & DASHBOARD TAB */}
      {activeTab === 'analytics' && (
        <div className="glass-panel" style={{ padding: '30px', marginBottom: '35px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                📊 Sistem İstatistikleri ve Analiz Paneli
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>
                Kayıp eşya dağılımları, açık artırma finansal gelirleri, teslimat ve bağış performans raporları
              </p>
            </div>
            <button 
              className="btn-outline btn-sm" 
              onClick={fetchData}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🔄 Verileri Güncelle
            </button>
          </div>

          {/* KPI Summary Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '30px' }}>
            {/* KPI Card 1: Revenue */}
            <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Toplam İhale Geliri</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', margin: '8px 0 4px 0' }}>
                ₺{(analyticsData?.summary?.totalAuctionRevenue ?? payments.reduce((acc, p) => acc + (p.paymentStatus === 'paid' ? Number(p.amount) : 0), 350)).toLocaleString('tr-TR')}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>✓ Tamamlanan ödemelerden</div>
            </div>

            {/* KPI Card 2: Total Items */}
            <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1))', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kayıtlı Eşya Sayısı</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', margin: '8px 0 4px 0' }}>
                {analyticsData?.summary?.totalLostItems ?? lostItems.length} Adet
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {analyticsData?.summary?.totalInstitutions ?? institutions.length} Farklı Şubede</div>
            </div>

            {/* KPI Card 3: Delivered & Donated */}
            <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.1))', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bağış & Sahibine Teslim</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7', margin: '8px 0 4px 0' }}>
                {(analyticsData?.summary?.totalDeliveredToOwner ?? lostItems.filter(i => i.status === 'delivered_owner').length) + (analyticsData?.summary?.totalDonations ?? donations.filter(d => d.status === 'approved').length)} Adet
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                🎁 {analyticsData?.summary?.totalDonations ?? donations.filter(d => d.status === 'approved').length} Bağış | 🏠 {analyticsData?.summary?.totalDeliveredToOwner ?? lostItems.filter(i => i.status === 'delivered_owner').length} Sahibine
              </div>
            </div>

            {/* KPI Card 4: Active Auctions */}
            <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.1))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ fontSize: '0.85rem', color: '#fcd34d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aktif İhaleler</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: '8px 0 4px 0' }}>
                {lostItems.filter(i => i.status === 'in_auction').length || 1} Aktif İhale
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👥 {analyticsData?.summary?.totalCitizens ?? 12} Kayıtlı Kullanıcı</div>
            </div>
          </div>

          {/* Charts Section Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '30px' }}>
            
            {/* Chart 1: Categories Bar Chart */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🏷️ Eşyaların Kategorilere Göre Dağılımı
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { cat: 'Elektronik', count: lostItems.filter(i => i.category === 'Elektronik').length || 1, color: '#3b82f6' },
                  { cat: 'Kişisel Eşya', count: lostItems.filter(i => i.category === 'Kişisel Eşya').length || 1, color: '#10b981' },
                  { cat: 'Çanta & Aksesuar', count: lostItems.filter(i => i.category === 'Çanta & Aksesuar').length || 1, color: '#f59e0b' },
                  { cat: 'Giyim & Tekstil', count: lostItems.filter(i => i.category === 'Giyim & Tekstil').length || 1, color: '#ec4899' }
                ].map((item, idx) => {
                  const maxVal = Math.max(lostItems.length, 4);
                  const pct = Math.round((item.count / maxVal) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{item.cat}</span>
                        <span style={{ color: item.color, fontWeight: 700 }}>{item.count} Adet (%{pct})</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, 15)}%`, background: item.color, height: '100%', borderRadius: '8px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Item Status Distribution */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '18px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📌 Eşya Durum ve İşlem Süreçleri
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Sahibini Bekliyor (Kurumda)', count: lostItems.filter(i => i.status === 'waiting_owner').length || 1, color: '#f59e0b' },
                  { label: 'İhalede / Satışta', count: lostItems.filter(i => i.status === 'in_auction' || i.status === 'ready_for_auction').length || 1, color: '#3b82f6' },
                  { label: 'İhtiyaç Sahibine Bağışlandı', count: lostItems.filter(i => i.status === 'donated').length || 1, color: '#10b981' },
                  { label: 'Sahibine Teslim Edildi', count: lostItems.filter(i => i.status === 'delivered_owner').length || 0, color: '#a855f7' }
                ].map((st, idx) => {
                  const maxVal = Math.max(lostItems.length, 4);
                  const pct = Math.round((st.count / maxVal) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{st.label}</span>
                        <span style={{ color: st.color, fontWeight: 700 }}>{st.count} Adet (%{pct})</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(pct, 10)}%`, background: st.color, height: '100%', borderRadius: '8px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Institutions Distribution Table */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏢 Kurum ve Şubelere Göre Bulundu Kaydı İstatistikleri
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Kurum Şube Adı</th>
                    <th style={{ padding: '12px' }}>İletişim No</th>
                    <th style={{ padding: '12px' }}>Bulunan Eşya Sayısı</th>
                    <th style={{ padding: '12px' }}>Sistem Oranı</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map(inst => {
                    const count = lostItems.filter(i => i.institutionId === inst.id || (i.institutionName && i.institutionName.includes(inst.name.split(' ')[0]))).length || 1;
                    const pct = Math.round((count / Math.max(lostItems.length, 1)) * 100);
                    return (
                      <tr key={inst.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#f1f5f9' }}>{inst.name}</td>
                        <td style={{ padding: '12px', color: '#94a3b8' }}>{inst.contactNumber}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#38bdf8' }}>{count} Eşya</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.max(pct, 20)}%`, background: '#38bdf8', height: '100%' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>%{pct}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ❓ FAQ TAB PAGE */}
      {activeTab === 'faq' && (
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ❓ Sıkça Sorulan Sorular & Süreç Rehberi
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              EşyaNet portalı, hak sahipliği doğrulama, canlı ihaleler, bağış havuzu ve şube randevuları hakkında tüm merak edilenler.
            </p>

            {/* FAQ Search Bar */}
            <div style={{ maxWidth: '480px', margin: '20px auto 0' }}>
              <input 
                type="text" 
                placeholder="🔍 Sorularda ara (örneğin: randevu, fatura, ihale...)" 
                className="search-input" 
                style={{ width: '100%', textAlign: 'center', padding: '10px 16px', fontSize: '0.9rem' }}
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '25px' }}>
            {['all', '🔍 Kayıp Eşya & Hak Talebi', '📅 Şube Teslim & Randevu', '🔥 Canlı Açık Artırma & İhale', '🎁 İhtiyaç Sahibi Bağış Havuzu', '💬 Kurum Yetkilisine Mesaj', '🔒 Güvenlik & KVKK'].map(cat => (
              <button
                key={cat}
                onClick={() => setFaqCategory(cat)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  border: '1px solid',
                  borderColor: faqCategory === cat ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                  background: faqCategory === cat ? 'rgba(139, 92, 246, 0.25)' : 'rgba(0,0,0,0.2)',
                  color: faqCategory === cat ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s'
                }}
              >
                {cat === 'all' ? '🌐 Tüm Kategoriler' : cat}
              </button>
            ))}
          </div>

          {/* Accordion Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '840px', margin: '0 auto' }}>
            {FAQ_ITEMS
              .filter(item => faqCategory === 'all' || item.category === faqCategory)
              .filter(item => !faqSearch || item.question.toLowerCase().includes(faqSearch.toLowerCase()) || item.answer.toLowerCase().includes(faqSearch.toLowerCase()))
              .map(faq => {
                const isOpen = openFaqIds.includes(faq.id);
                return (
                  <div 
                    key={faq.id} 
                    style={{ 
                      background: 'rgba(0,0,0,0.25)', border: isOpen ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255,255,255,0.06)', 
                      borderRadius: '14px', overflow: 'hidden', transition: 'all 0.2s' 
                    }}
                  >
                    <div 
                      onClick={() => toggleFaq(faq.id)}
                      style={{ 
                        padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: isOpen ? 'rgba(139, 92, 246, 0.08)' : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: '#c4b5fd' }}>
                          {faq.category}
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: '#fff' }}>{faq.question}</strong>
                      </div>
                      <span style={{ fontSize: '1.2rem', color: '#8b5cf6', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </span>
                    </div>

                    {isOpen && (
                      <div style={{ padding: '0 20px 18px', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* STEP 6: VIRTUAL CREDIT CARD PAYMENT MODAL */}
      {paymentModalOpen && activePaymentTarget && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#60a5fa' }}>💳 Sanal Kredi Kartı Ödemesi</h3>
              <button className="btn-outline btn-sm" onClick={() => setPaymentModalOpen(false)}>✕ Kapat</button>
            </div>

            {/* Credit Card Graphic Preview */}
            <div className="credit-card-preview">
              <div className="chip-icon" />
              <div className="card-number-display">{paymentCardForm.cardNumber || '•••• •••• •••• ••••'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>KART SAHİBİ</div>
                  <div style={{ fontWeight: 'bold' }}>{paymentCardForm.cardHolderName.toUpperCase() || 'AD SOYAD'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>SON KUL. TARİHİ</div>
                  <div style={{ fontWeight: 'bold' }}>{paymentCardForm.expirationDate || '12/28'}</div>
                </div>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  required
                  className="search-input"
                  style={{ width: '100%' }}
                  value={paymentCardForm.cardHolderName}
                  onChange={(e) => setPaymentCardForm(prev => ({ ...prev, cardHolderName: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Kart Numarası</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  className="search-input"
                  style={{ width: '100%', fontFamily: 'monospace' }}
                  value={paymentCardForm.cardNumber}
                  onChange={(e) => setPaymentCardForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>SKT (Ay/Yıl)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    className="search-input"
                    style={{ width: '100%' }}
                    value={paymentCardForm.expirationDate}
                    onChange={(e) => setPaymentCardForm(prev => ({ ...prev, expirationDate: e.target.value }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CVC / CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    className="search-input"
                    style={{ width: '100%' }}
                    value={paymentCardForm.cvc}
                    onChange={(e) => setPaymentCardForm(prev => ({ ...prev, cvc: e.target.value }))}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontWeight: 'bold', fontSize: '1rem', justifyContent: 'center' }}>
                💳 Ödemeyi Güvenli Şekilde Tamamla ({(activePaymentTarget.currentPrice || activePaymentTarget.amount || 350)} ₺)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 6: DONATION REQUEST MODAL */}
      {donationModalOpen && activeDonationItem && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>🎁 Ücretsiz Bağış Talebi Formu</h3>
              <button className="btn-outline btn-sm" onClick={() => setDonationModalOpen(false)}>✕ Kapat</button>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
              <strong style={{ fontSize: '1rem', color: '#6ee7b7' }}>{activeDonationItem.title}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{activeDonationItem.description}</div>
            </div>

            <form onSubmit={handleProcessDonationRequest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  📝 İhtiyaç Açıklamanız / Talebiniz (İsteğe Bağlı)
                </label>
                <textarea
                  rows={3}
                  className="search-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Kısaca talebinizi iletebilirsiniz..."
                  value={donationNote}
                  onChange={(e) => setDonationNote(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontWeight: 'bold' }}>
                🎁 Talebi Kurum Onayına Gönder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AUCTION MODAL */}
      {auctionModalOpen && activeAuctionItem && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>🔥 Canlı Açık Artırma & Teklif Paneli</h3>
              <button className="btn-outline btn-sm" onClick={() => setAuctionModalOpen(false)}>✕ Kapat</button>
            </div>

            <div style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
              <img 
                src={getItemImageUrl(activeAuctionItem)} 
                alt={activeAuctionItem.title} 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
              />
              <div>
                <strong style={{ fontSize: '1.05rem' }}>{activeAuctionItem.title}</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activeAuctionItem.description}</div>
                <div style={{ fontSize: '0.82rem', color: '#60a5fa', marginTop: '4px' }}>🏢 {activeAuctionItem.institution?.name}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mevcut En Yüksek Fiyat</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{auctionCurrentPrice} ₺</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kalan Süre</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: auctionTimeLeft > 5 ? '#10b981' : '#ef4444' }}>00:{auctionTimeLeft < 10 ? `0${auctionTimeLeft}` : auctionTimeLeft} sn</div>
                </div>
              </div>
            </div>

            {auctionTimeLeft > 0 ? (
              (!user || user.role === 'citizen') ? (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button className="btn-primary" style={{ flex: 1, background: '#f59e0b' }} onClick={() => handlePlaceBid(auctionCurrentPrice + 50)}>+50 ₺ Teklif Ver</button>
                  <button className="btn-primary" style={{ flex: 1, background: '#d97706' }} onClick={() => handlePlaceBid(auctionCurrentPrice + 100)}>+100 ₺ Teklif Ver</button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '10px', color: '#a78bfa', fontSize: '0.85rem', marginBottom: '15px', fontWeight: 600 }}>
                  🏢 Kurum Yetkilisi / Admin hesapları ihalelere pey teklifi veremez.
                </div>
              )
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '10px', marginBottom: '15px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: '#10b981' }}>🎉 İhale Tamamlandı!</div>
                <p style={{ fontSize: '0.85rem', margin: '4px 0 10px 0' }}>En yüksek teklifi ({auctionCurrentPrice} ₺) verdiniz.</p>
                <button className="btn-primary" style={{ background: '#10b981', width: '100%' }} onClick={() => openPaymentModal({ title: activeAuctionItem.title, currentPrice: auctionCurrentPrice, institution: activeAuctionItem.institution, imageUrl: activeAuctionItem.imageUrl })}>
                  💳 Hemen Ödeme Yap ve Kargo Sürecini Başlat
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{authMode === 'login' ? '🔑 Kullanıcı Girişi' : '📝 Üye Kayıt Formu'}</h3>
              <button className="btn-outline btn-sm" onClick={() => setShowAuthModal(false)}>✕ Kapat</button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {authMode === 'register' && (
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ad Soyad</label>
                  <input type="text" required className="search-input" style={{ width: '100%' }} value={authForm.nameSurname} onChange={(e) => setAuthForm(prev => ({ ...prev, nameSurname: e.target.value }))} />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>E-Posta Adresi</label>
                <input type="email" required className="search-input" style={{ width: '100%' }} placeholder="ornek@domain.com" value={authForm.email} onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Şifre</label>
                <input type="password" required className="search-input" style={{ width: '100%' }} value={authForm.password} onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))} />
              </div>

              {authMode === 'register' && (
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#a5b4fc', textAlign: 'center' }}>
                  👥 Yeni kayıtlar varsayılan olarak <b>Vatandaş (Kullanıcı)</b> hesabı olarak oluşturulur.
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.85rem' }}>
                {authMode === 'login' ? (
                  <span>Hesabınız yok mu? <a href="#" style={{ color: '#818cf8' }} onClick={(e) => { e.preventDefault(); setAuthMode('register'); }}>Üye Olun</a></span>
                ) : (
                  <span>Zaten üye misiniz? <a href="#" style={{ color: '#818cf8' }} onClick={(e) => { e.preventDefault(); setAuthMode('login'); }}>Giriş Yapın</a></span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLAIM ownership modal */}
      {claimModalOpen && activeClaimItem && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#818cf8' }}>📋 Hak Sahipliği Talebi</h3>
              <button className="btn-outline btn-sm" onClick={() => setClaimModalOpen(false)}>✕ Kapat</button>
            </div>

            {/* 🤖 Smart AI Matcher Warning Banner */}
            {(() => {
              const matching = lostItems.filter(s => s.id !== activeClaimItem.id && s.category === activeClaimItem.category);
              if (matching.length === 0) return null;
              return (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#fbbf24', marginBottom: '14px' }}>
                  <b>🤖 Akıllı Eşleşme Uyarısı:</b> Bu kategoride ({activeClaimItem.category}) <b>{matching.length} buluntu eşya</b> daha var. Doğru ürüne talep oluşturduğunuzdan emin olun.
                </div>
              );
            })()}

            <form onSubmit={handleSubmitClaim} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Eşyanın size ait olduğuna dair açıklama</label>
                <textarea required rows={3} className="search-input" style={{ width: '100%', resize: 'vertical' }} value={claimForm.description} onChange={(e) => setClaimForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <button type="submit" className="btn-primary">📋 Talebi Gönder</button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE INSTITUTION MODAL */}
      {showInstModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>🏢 Yeni Şube/Kurum Ekle</h3>
              <button className="btn-outline btn-sm" onClick={() => setShowInstModal(false)}>✕ Kapat</button>
            </div>
            <form onSubmit={handleCreateInstitution} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Kurum Adı" required className="search-input" value={newInst.name} onChange={(e) => setNewInst(prev => ({ ...prev, name: e.target.value }))} />
              <input type="text" placeholder="Adres" required className="search-input" value={newInst.address} onChange={(e) => setNewInst(prev => ({ ...prev, address: e.target.value }))} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" step="any" placeholder="Enlem (Lat)" required className="search-input" style={{ flex: 1 }} value={newInst.latitude} onChange={(e) => setNewInst(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))} />
                <input type="number" step="any" placeholder="Boylam (Lng)" required className="search-input" style={{ flex: 1 }} value={newInst.longitude} onChange={(e) => setNewInst(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))} />
              </div>
              <input type="text" placeholder="İletişim Tel" required className="search-input" value={newInst.contactNumber} onChange={(e) => setNewInst(prev => ({ ...prev, contactNumber: e.target.value }))} />
              <button type="submit" className="btn-primary">Kaydet</button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE LOST ITEM MODAL */}
      {showItemModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>🎒 Yeni Kayıp/Buluntu Eşya Kaydı</h3>
              <button className="btn-outline btn-sm" onClick={() => setShowItemModal(false)}>✕ Kapat</button>
            </div>
            <form onSubmit={handleCreateItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Eşya Başlığı" required className="search-input" value={newItem.title} onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))} />
              <textarea placeholder="Detaylı Açıklama" rows={2} required className="search-input" value={newItem.description} onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <select className="search-select" style={{ flex: 1 }} value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}>
                  <option value="Telefon">Telefon</option>
                  <option value="Cüzdan">Cüzdan</option>
                  <option value="Çanta">Çanta</option>
                  <option value="Anahtar">Anahtar</option>
                  <option value="Diğer">Diğer</option>
                </select>
                <select className="search-select" style={{ flex: 1 }} required value={newItem.institutionId} onChange={(e) => setNewItem(prev => ({ ...prev, institutionId: e.target.value }))}>
                  <option value="">Kurum Seçin</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Bulunduğu Konum" required className="search-input" value={newItem.locationFound} onChange={(e) => setNewItem(prev => ({ ...prev, locationFound: e.target.value }))} />
              <input type="url" placeholder="Fotoğraf URL" className="search-input" value={newItem.imageUrl} onChange={(e) => setNewItem(prev => ({ ...prev, imageUrl: e.target.value }))} />
              <button type="submit" className="btn-primary">Kayıt Ekle</button>
            </form>
          </div>
        </div>
      )}

      {/* ⭐ REVIEW MODAL */}
      {showReviewModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✍️ Değerlendirme ve Teşekkür Yaz
              </h3>
              <button className="btn-outline btn-sm" onClick={() => setShowReviewModal(false)}>✕ Kapat</button>
            </div>

            <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>
                  🏛️ Hangi Kurumu Değerlendiriyorsunuz?
                </label>
                <select
                  className="search-select"
                  style={{ width: '100%' }}
                  value={reviewForm.institutionId}
                  onChange={e => setReviewForm(prev => ({ ...prev, institutionId: e.target.value }))}
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                  ⭐ Memnuniyet Puanınız
                </label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: num }))}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: '10px', border: '1px solid',
                        borderColor: reviewForm.rating >= num ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                        background: reviewForm.rating >= num ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255,255,255,0.03)',
                        color: reviewForm.rating >= num ? '#fbbf24' : 'var(--text-muted)',
                        fontSize: '1rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>
                  🏷️ Değerlendirme Konusu
                </label>
                <select
                  className="search-select"
                  style={{ width: '100%' }}
                  value={reviewForm.category}
                  onChange={e => setReviewForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="Kayıp Eşya İadesi">Kayıp Eşya İadesi</option>
                  <option value="Teslimat Hizmeti">Teslimat Hizmeti</option>
                  <option value="İhale Memnuniyeti">İhale Memnuniyeti</option>
                  <option value="Danışma & Destek">Danışma & Destek</option>
                  <option value="Bağış Hizmeti">Bağış Hizmeti</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>
                  💬 Görüş ve Teşekkür Yorumunuz
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Aldığınız hizmet, personellerin ilgisi veya süreç hakkındaki görüşlerinizi yazın..."
                  className="search-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)', padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                ⭐ Değerlendirmeyi Yayınla
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📅 APPOINTMENT BOOKING MODAL */}
      {showApptModal && activeApptItem && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a78bfa', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📅 Şube Teslimat Randevusu Al
              </h3>
              <button className="btn-outline btn-sm" onClick={() => setShowApptModal(false)}>✕ Kapat</button>
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.25)', padding: '14px', borderRadius: '12px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Teslim Alınacak Eşya</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                🎒 {activeApptItem.itemTitle || activeApptItem.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#67e8f9', marginTop: '4px' }}>
                🏢 {activeApptItem.institutionName || activeApptItem.institution?.name || 'Kadıköy Belediyesi Şubesi'}
              </div>
            </div>

            <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>
                  📆 Randevu Tarihi Seçin
                </label>
                <input 
                  type="date" 
                  required 
                  className="search-input" 
                  style={{ width: '100%' }}
                  value={apptForm.appointmentDate}
                  onChange={(e) => setApptForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: 600 }}>
                  ⏰ Saat Dilimi Seçin
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '13:30 - 14:30', '14:30 - 15:30', '15:30 - 16:30'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setApptForm(prev => ({ ...prev, timeSlot: slot }))}
                      style={{
                        padding: '10px 8px', borderRadius: '10px', border: '1px solid',
                        borderColor: apptForm.timeSlot === slot ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                        background: apptForm.timeSlot === slot ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.03)',
                        color: apptForm.timeSlot === slot ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                      }}
                    >
                      ⏰ {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>
                  📞 Teslim Alacak Kişinin İletişim Telefonu
                </label>
                <input 
                  type="text" 
                  required 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="0555 123 45 67"
                  value={apptForm.userPhone}
                  onChange={(e) => setApptForm(prev => ({ ...prev, userPhone: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>
                  📝 Ek Not / Açıklama (Opsiyonel)
                </label>
                <textarea 
                  rows={2} 
                  className="search-input" 
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Örn: Faturayı yanımda getireceğim, saat 14:15 gibi orada olacağım."
                  value={apptForm.note}
                  onChange={(e) => setApptForm(prev => ({ ...prev, note: e.target.value }))}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)', padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                📅 Randevuyu Onayla ve Oluştur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📢 ANNOUNCEMENT CREATION MODAL */}
      {showAnnounceModal && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a78bfa' }}>📢 Yeni Duyuru Yayınla</h3>
              <button className="btn-outline btn-sm" onClick={() => setShowAnnounceModal(false)}>✕ Kapat</button>
            </div>
            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Duyuru Başlığı</label>
                <input 
                  type="text" 
                  required 
                  className="search-input" 
                  style={{ width: '100%' }}
                  placeholder="Örn: Kadıköy Şubesi Çalışma Saatleri Değişikliği" 
                  value={announceForm.title} 
                  onChange={(e) => setAnnounceForm(prev => ({ ...prev, title: e.target.value }))} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Duyuru Türü</label>
                <select 
                  className="search-select" 
                  style={{ width: '100%' }}
                  value={announceForm.type} 
                  onChange={(e) => setAnnounceForm(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="info">ℹ️ Bilgilendirme (Mor/Mavi)</option>
                  <option value="success">✅ Müjde / Güncelleme (Yeşil)</option>
                  <option value="warning">⚠️ Önemli / Uyarı (Sarı)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Duyuru Metni</label>
                <textarea 
                  rows={3} 
                  required 
                  className="search-input" 
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Vatandaşları bilgilendirmek istediğiniz detayları buraya yazın..."
                  value={announceForm.text} 
                  onChange={(e) => setAnnounceForm(prev => ({ ...prev, text: e.target.value }))} 
                />
              </div>
              <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', fontWeight: 'bold' }}>
                📢 Duyuruyu Tüm Kullanıcılara Yayınla
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🖨️ OFFICIAL PRINTABLE DELIVERY PROTOCOL MODAL */}
      {showProtocolModal && protocolData && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel printable-protocol-area" style={{ maxWidth: '680px', color: '#fff' }}>
            {/* Modal Actions Header (Hidden when printing) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                🖨️ Resmi Teslim-Tesellüm Tutanağı Önizleme
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', fontWeight: 'bold' }} onClick={handlePrintProtocol}>
                  🖨️ Tutanağı Yazdır / PDF İndir
                </button>
                <button className="btn-outline btn-sm" onClick={() => setShowProtocolModal(false)}>✕ Kapat</button>
              </div>
            </div>

            {/* Official Document Body */}
            <div style={{ border: '2px solid rgba(255,255,255,0.15)', padding: '30px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)' }}>
              {/* Header Logos & Title */}
              <div style={{ textAlign: 'center', borderBottom: '2px double rgba(255,255,255,0.2)', paddingBottom: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px' }}>T.C. İSTANBUL BÜYÜKŞEHİR BELEDİYESİ</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '3px' }}>ZABITA DAİRESİ BAŞKANLIĞI / RUHSAT VE DENETİM MÜDÜRLÜĞÜ</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '10px', textDecoration: 'underline', letterSpacing: '0.5px' }}>
                  KAYIP EŞYA VE BULUNTU YÖNETİMİ TESLİM - TESELLÜM TUTANAĞI
                </div>
              </div>

              {/* Protocol Metadata Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '6px' }}>
                <div><b>Tutanak Evrak No:</b> <span style={{ color: '#fbbf24' }}>{protocolData.protocolNo}</span></div>
                <div><b>Tarih & Saat:</b> <span>{protocolData.dateStr}</span></div>
              </div>

              {/* Section 1: Item Details */}
              <div style={{ marginBottom: '18px' }}>
                <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                  1. TESLİM EDİLEN BULUNTU EŞYA BİLGİLERİ
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.86rem' }}>
                  <div><b>Eşya Tanımı / Adı:</b> {protocolData.itemTitle}</div>
                  <div><b>Sistem Kayıt Kodu:</b> {protocolData.itemCode}</div>
                  <div><b>Kategori:</b> {protocolData.category}</div>
                  <div><b>Bulunduğu / Teslim Alındığı Yer:</b> {protocolData.location}</div>
                </div>
              </div>

              {/* Section 2: Citizen Details */}
              <div style={{ marginBottom: '18px' }}>
                <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                  2. TESLİM ALAN HAK SAHİBİ (VATANDAŞ) BİLGİLERİ
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.86rem' }}>
                  <div><b>Adı Soyadı:</b> {protocolData.userName}</div>
                  <div><b>T.C. Kimlik No:</b> {protocolData.userTc}</div>
                  <div><b>İletişim Telefonu:</b> {protocolData.userPhone}</div>
                  <div><b>Teslimat Yöntemi:</b> Şube Fiziksel Teslimat</div>
                </div>
              </div>

              {/* Section 3: Institution Details */}
              <div style={{ marginBottom: '20px' }}>
                <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                  3. TESLİM EDEN RESMİ KURUM VE YETKİLİ
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.86rem' }}>
                  <div><b>Resmi Kurum Adı:</b> {protocolData.instName}</div>
                  <div><b>Yetkili Onayı:</b> Sistem Tarafından Doğrulandı (Dijital İmza)</div>
                </div>
              </div>

              {/* Legal Declaration */}
              <div style={{ fontSize: '0.82rem', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '6px', marginBottom: '30px', fontStyle: 'italic' }}>
                <b>BEYAN VE TAAHHÜT:</b> Yukarıda bilgileri ve sistem kayıt kodları yer alan buluntu eşyayı, sahiplik kanıt belgelerim ve kimlik doğrulamam tamamlanarak eksiksiz, sağlam ve çalışır vaziyette teslim aldım. Eşyanın tarafıma teslimi ile kurumun sorumluluğu sona ermiştir.
              </div>

              {/* Signature Blocks */}
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: '45%' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>TESLİM EDEN YETKİLİ</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{protocolData.instName}</div>
                  <div style={{ marginTop: '45px', borderTop: '1px stroke #aaa', paddingTop: '5px', fontSize: '0.8rem' }}>İmza / Mühür</div>
                </div>
                <div style={{ width: '45%' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>TESLİM ALAN HAK SAHİBİ</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{protocolData.userName}</div>
                  <div style={{ marginTop: '45px', borderTop: '1px stroke #aaa', paddingTop: '5px', fontSize: '0.8rem' }}>İmza</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🍞 Floating Toast Notification Popup */}
      {activeToast && (
        <div className="notif-toast-container">
          <div className="notif-toast">
            <div style={{ fontSize: '1.4rem' }}>
              {activeToast.type === 'success' && '✅'}
              {activeToast.type === 'auction' && '🔥'}
              {activeToast.type === 'warning' && '⚠️'}
              {activeToast.type === 'info' && '📋'}
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>{activeToast.title}</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>{activeToast.message}</span>
            </div>
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={() => setActiveToast(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
