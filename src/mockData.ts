/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Post, Exam, Club } from './types';

export const DEPARTMENTS = [
  "Bilgisayar Mühendisliği",
  "Endüstri Mühendisliği",
  "Makine Mühendisliği",
  "Mimarlık",
  "İnşaat Mühendisliği",
  "Kimya Mühendisliği",
  "Kontrol ve Otomasyon Mühendisliği",
  "Matematik Mühendisliği",
  "İşletme",
  "Elektrik Mühendisliği",
  "Gemi İnşaatı ve Gemi Makineleri Mühendisliği",
  "Metalurji ve Malzeme Mühendisliği"
];

export const FACULTIES = [
  {
    name: "Elektrik-Elektronik Fakültesi",
    departments: [
      "Bilgisayar Mühendisliği",
      "Kontrol ve Otomasyon Mühendisliği",
      "Elektrik Mühendisliği"
    ]
  },
  {
    name: "Makine Fakültesi",
    departments: [
      "Makine Mühendisliği",
      "Endüstri Mühendisliği"
    ]
  },
  {
    name: "Mimarlık Fakültesi",
    departments: [
      "Mimarlık"
    ]
  },
  {
    name: "İnşaat Fakültesi",
    departments: [
      "İnşaat Mühendisliği"
    ]
  },
  {
    name: "Kimya-Metalurji Fakültesi",
    departments: [
      "Kimya Mühendisliği",
      "Metalurji ve Malzeme Mühendisliği"
    ]
  },
  {
    name: "Fen-Edebiyat Fakültesi",
    departments: [
      "Matematik Mühendisliği"
    ]
  },
  {
    name: "İktisadi ve İdari Bilimler Fakültesi",
    departments: [
      "İşletme"
    ]
  },
  {
    name: "Gemi İnşaatı ve Denizcilik Fakültesi",
    departments: [
      "Gemi İnşaatı ve Gemi Makineleri Mühendisliği"
    ]
  }
];

export const INTEREST_FIELDS = [
  { id: "Teknoloji & Yazılım", label: "Teknoloji & Yazılım", desc: "Kodlama, yapay zeka, hackathonlar ve teknolojik gelişmeler.", icon: "Code" },
  { id: "Kariyer & Staj", label: "Kariyer & Staj", desc: "Teknopark ilanları, iş fırsatları, özgeçmiş hazırlama ve zirveler.", icon: "Briefcase" },
  { id: "Akademik & Duyurular", label: "Akademik & Duyurular", desc: "Rektörlük açıklamaları, ders kayıtları, akademisyen paylaşımları.", icon: "BookOpen" },
  { id: "Sosyal & Eğlence", label: "Sosyal & Eğlence", desc: "Kampüs festivalleri, bahar şenliği, tanışma toplantıları ve mizah.", icon: "Sparkles" },
  { id: "Kültür & Sanat", label: "Kültür & Sanat", desc: "Tiyatro kulübü gösterileri, konserler, sinema günleri ve sergiler.", icon: "Palette" },
  { id: "Spor", label: "Spor", desc: "YTÜ spor takımları, futbol/basketbol turnuvaları, masa tenisi ve salon etkinlikleri.", icon: "Trophy" }
];

export const CLUBS: Club[] = [
  { id: "skylab", name: "SKY LAB", logo: "💻", description: "YTÜ Bilgisayar Bilimleri Kulübü. Hackathonlar ve yazılım eğitimleri düzenler." },
  { id: "ieee", name: "IEEE YTÜ", logo: "⚡", description: "Teknoloji ve mühendislik projeleri üreten, uluslararası ağa sahip en aktif kulüplerden biri." },
  { id: "kvk", name: "Kalite ve Verimlilik", logo: "📈", description: "Liderlik zirveleri, kariyer günleri ve şirket gezileri organize eden köklü kulüp." },
  { id: "isletme", name: "İşletme Kulübü", logo: "💼", description: "Girişimcilik zirveleri, vaka analizleri ve iş dünyası buluşmaları düzenler." },
  { id: "sstk", name: "SSTK (Savunma Sanayii)", logo: "🛡️", description: "Savunma sanayii devleri ile projeler, teknik geziler ve paneller düzenler." },
  { id: "sanattasarim", name: "Sanat & Tasarım", logo: "🎭", description: "Tiyatro, müzik dinletileri, heykel ve resim atölyeleri ile ruhu besler." },
  { id: "spor_kulubu", name: "YTÜ Spor Kulübü", logo: "⚽", description: "Kampüs içi turnuvalar ve üniversiteler arası müsabakaları koordine eder." }
];

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    author: "SKY LAB Kulübü",
    authorAvatar: "https://ui-avatars.com/api/?name=SKY+LAB&background=003057&color=EAAA00",
    time: "20 dakika önce",
    content: "🚀 Dev Hackathon Başlıyor! Bu sene 'Yıldız Hack' ile Davutpaşa Tarihi Hamam'da 48 saat aralıksız kod yazacağız. Birinciye büyük ödül! Hemen başvur, takımını kur veya bireysel gel. Tüm bölümlere açık!",
    likes: 134,
    field: "Teknoloji & Yazılım",
    club: "skylab",
    isPinned: true
  },
  {
    id: "p2",
    author: "YTÜ Kariyer Planlama",
    authorAvatar: "https://ui-avatars.com/api/?name=Kariyer&background=EAAA00&color=003057",
    time: "1 saat önce",
    content: "💼 Davutpaşa Teknopark'taki 12 farklı yazılım ve Ar-Ge firması, yaz dönemi için 'Yıldız Stajyer' programı kapsamında başvuruları açtı. Bilgisayar, Matematik Mühendisliği ve Endüstri Mühendisliği öğrencileri öncelikli olup, 3 ve 4. sınıflar başvurabilir.",
    likes: 89,
    field: "Kariyer & Staj"
  },
  {
    id: "p3",
    author: "Prof. Dr. Ahmet Yılmaz (Bilgisayar Müh.)",
    authorAvatar: "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=random",
    time: "3 saat önce",
    content: "Değerli Bilgisayar Mühendisliği öğrencileri, BLM3002 Yapay Zeka dersinin proje teslimleri sisteme yüklenmiştir. Son gün 10 Temmuz. Detaylı teknik dökümanı kontrol etmeyi unutmayın. Başarılar dilerim.",
    likes: 54,
    department: "Bilgisayar Mühendisliği",
    field: "Akademik & Duyurular"
  },
  {
    id: "p4",
    author: "IEEE YTÜ",
    authorAvatar: "https://ui-avatars.com/api/?name=IEEE&background=003057&color=ffffff",
    time: "4 saat önce",
    content: "🤖 Yıldız Robocon 2026 başvuruları başladı! Otonom labirent çözen, çizgi izleyen ve serbest kategoride yarışacak projelerinizi bekliyoruz. Davutpaşa Kongre Merkezi'nde gerçekleşecek bu görsel şöleni kaçırmayın.",
    likes: 92,
    field: "Teknoloji & Yazılım",
    club: "ieee"
  },
  {
    id: "p5",
    author: "Kalite ve Verimlilik Kulübü",
    authorAvatar: "https://ui-avatars.com/api/?name=KVK&background=0284c7&color=ffffff",
    time: "5 saat önce",
    content: "🎓 'Liderlik ve Kariyer Zirvesi' için geri sayım başladı! Vestel, Sabancı ve Turkcell C-level yöneticilerinin katılımıyla Beşiktaş Kampüsü Oditoryumu'nda gerçekleşecek oturumlara katılan herkese sertifika verilecektir. Kayıt linki biomuzda.",
    likes: 110,
    field: "Kariyer & Staj",
    club: "kvk"
  },
  {
    id: "p6",
    author: "YTÜ Rektörlük Duyuru",
    authorAvatar: "https://ui-avatars.com/api/?name=YTU&background=003057&color=ffffff",
    time: "1 gün önce",
    content: "📢 ÖNEMLİ DUYURU: Yaz okulu ders kayıtları 6-8 Temmuz tarihleri arasında USIS üzerinden gerçekleştirilecektir. Çakışan dersler hakkında bölümlerinizden onay almanız önemle rica olunur.",
    likes: 245,
    field: "Akademik & Duyurular"
  },
  {
    id: "p7",
    author: "Sanat & Tasarım Kulübü",
    authorAvatar: "https://ui-avatars.com/api/?name=Sanat&background=ec4899&color=ffffff",
    time: "1 gün önce",
    content: "🎨 Davutpaşa Orta Bahçe'de bu çarşamba günü saat 14:00'te 'Kampüste Açık Hava Akrilik Boya Atölyesi' düzenliyoruz. Malzemeler bizden, yaratıcılık sizden! Çay ve müzik eşliğinde stresten uzaklaşalım.",
    likes: 76,
    field: "Kültür & Sanat",
    club: "sanattasarim"
  },
  {
    id: "p8",
    author: "YTÜ Spor Kulübü",
    authorAvatar: "https://ui-avatars.com/api/?name=Spor&background=10b981&color=ffffff",
    time: "2 gün önce",
    content: "🏆 Bölümler Arası Halı Saha Turnuvası heyecanı başlıyor! Kayıtlar takım kaptanları tarafından Spor Birliği Ofisine yapılacaktır. Her bölüm en fazla 2 takım ile katılabilir. Şampiyon takıma sürpriz bir ödül ve kupa var!",
    likes: 105,
    field: "Spor",
    club: "spor_kulubu"
  },
  {
    id: "p9",
    author: "Doç. Dr. Elif Kaya (Endüstri Müh.)",
    authorAvatar: "https://ui-avatars.com/api/?name=Elif+Kaya&background=random",
    time: "2 gün önce",
    content: "Endüstri Mühendisliği son sınıf öğrencilerinin Bitirme Çalışması (Tasarım Projesi) sunum programı fakülte panosunda ve web sitesinde ilan edilmiştir. Sunumlar jüri önünde slayt eşliğinde yapılacaktır.",
    likes: 41,
    department: "Endüstri Mühendisliği",
    field: "Akademik & Duyurular"
  },
  {
    id: "p10",
    author: "İşletme Kulübü",
    authorAvatar: "https://ui-avatars.com/api/?name=Isletme&background=f59e0b&color=ffffff",
    time: "2 gün önce",
    content: "💡 'Startup Yıldızları' yarışmasıyla kendi iş fikrini yatırımcılara sunmaya hazır mısın? Ön eleme aşamasını geçen 5 girişime mentorluk desteği ve Davutpaşa Teknopark Kuluçka Merkezi'nde ofis imkanı sağlanacaktır.",
    likes: 67,
    field: "Kariyer & Staj",
    club: "isletme"
  },
  {
    id: "p11",
    author: "YTÜ Mizah Topluluğu",
    authorAvatar: "https://ui-avatars.com/api/?name=Mizah&background=a855f7&color=ffffff",
    time: "3 gün önce",
    content: "Şu Davutpaşa ring sırasını beklerken biten ömürler için bir dakikalık saygı duruşu... Ringe binmek, vizelerden geçmekten daha zor diyebilir miyiz? 😂🚌 #yturing #davutpasa",
    likes: 312,
    field: "Sosyal & Eğlence"
  },
  {
    id: "p12",
    author: "Prof. Dr. Caner Şahin (Makine Müh.)",
    authorAvatar: "https://ui-avatars.com/api/?name=Caner+Sahin&background=random",
    time: "3 gün önce",
    content: "Makine Mühendisliği Mukavemet II dersi bütünleme sınavı öncesi soru çözüm saati çarşamba günü saat 10:00'da Makine Konferans Salonu'nda yapılacaktır. Sınava hazırlanan tüm öğrencilerin katılımını tavsiye ederim.",
    likes: 48,
    department: "Makine Mühendisliği",
    field: "Akademik & Duyurular"
  },
  {
    id: "p13",
    author: "Mimarlık Fakültesi Dekanlığı",
    authorAvatar: "https://ui-avatars.com/api/?name=Mimarlik&background=3b82f6&color=ffffff",
    time: "4 gün önce",
    content: "Beşiktaş Tarihi Kampüs Şevket Sabancı binasındaki 'Mimari Tasarım Stüdyosu IV' sergisi ziyarete açılmıştır. Öğrencilerimizin muazzam pafta ve maketlerini görmek isteyen herkesi bekleriz.",
    likes: 93,
    department: "Mimarlık",
    field: "Kültür & Sanat"
  }
];

export const MOCK_EXAMS: Exam[] = [
  { id: "e1", course: "Matematik II (Lineer)", date: "12", month: "TEM", time: "13:00", room: "D-102 (Davutpaşa)", department: "Genel Mühendislik" },
  { id: "e2", course: "Fizik II (Elektrik)", date: "14", month: "TEM", time: "10:00", room: "B-205 (Davutpaşa)", department: "Genel Mühendislik" },
  { id: "e3", course: "Yapay Zekaya Giriş", date: "16", month: "TEM", time: "14:30", room: "A-101 (Bilgisayar Müh.)", department: "Bilgisayar Mühendisliği" },
  { id: "e4", course: "Yöneylem Araştırması I", date: "17", month: "TEM", time: "09:30", room: "E-302 (Endüstri Müh.)", department: "Endüstri Mühendisliği" },
  { id: "e5", course: "Mukavemet I", date: "18", month: "TEM", time: "11:00", room: "M-104 (Makine Müh.)", department: "Makine Mühendisliği" },
  { id: "e6", course: "Mimari Tasarım Kuramları", date: "20", month: "TEM", time: "15:00", room: "Stüdyo 3 (Beşiktaş)", department: "Mimarlık" },
  { id: "e7", course: "Isı Transferi", date: "21", month: "TEM", time: "13:00", room: "M-201 (Makine Müh.)", department: "Makine Mühendisliği" },
  { id: "e8", course: "Mikroişlemcili Sistemler", date: "22", month: "TEM", time: "10:00", room: "A-208 (Bilgisayar Müh.)", department: "Bilgisayar Mühendisliği" },
  // İnşaat Mühendisliği
  { id: "e9", course: "Statik", date: "15", month: "TEM", time: "11:00", room: "İ-101 (İnşaat Müh.)", department: "İnşaat Mühendisliği" },
  { id: "e10", course: "Zemin Mekaniği", date: "23", month: "TEM", time: "14:00", room: "İ-202 (İnşaat Müh.)", department: "İnşaat Mühendisliği" },
  // Kimya Mühendisliği
  { id: "e11", course: "Organik Kimya", date: "16", month: "TEM", time: "10:30", room: "K-201 (Kimya Müh.)", department: "Kimya Mühendisliği" },
  { id: "e12", course: "Kimya Müh. Termodinamiği", date: "24", month: "TEM", time: "13:00", room: "K-105 (Kimya Müh.)", department: "Kimya Mühendisliği" },
  // Kontrol ve Otomasyon Mühendisliği
  { id: "e13", course: "Doğrusal Sistem Analizi", date: "17", month: "TEM", time: "11:30", room: "KO-101 (Kontrol Müh.)", department: "Kontrol ve Otomasyon Mühendisliği" },
  { id: "e14", course: "Geri Beslemeli Kontrol Sistemleri", date: "23", month: "TEM", time: "14:30", room: "KO-204 (Kontrol Müh.)", department: "Kontrol ve Otomasyon Mühendisliği" },
  // Matematik Mühendisliği
  { id: "e15", course: "Soyut Cebir", date: "19", month: "TEM", time: "10:00", room: "M-101 (Matematik Müh.)", department: "Matematik Mühendisliği" },
  { id: "e16", course: "Nümerik Analiz", date: "25", month: "TEM", time: "15:00", room: "M-302 (Matematik Müh.)", department: "Matematik Mühendisliği" },
  // İşletme
  { id: "e17", course: "Mikroiktisat", date: "15", month: "TEM", time: "09:30", room: "İS-102 (İktisat)", department: "İşletme" },
  { id: "e18", course: "Finansal Muhasebe I", date: "22", month: "TEM", time: "13:30", room: "İS-201 (İktisat)", department: "İşletme" },
  // Elektrik Mühendisliği
  { id: "e19", course: "Elektrik Devre Analizi II", date: "16", month: "TEM", time: "11:00", room: "EE-102 (Elektrik Müh.)", department: "Elektrik Mühendisliği" },
  { id: "e20", course: "Elektromanyetik Alan Teorisi", date: "24", month: "TEM", time: "14:00", room: "EE-205 (Elektrik Müh.)", department: "Elektrik Mühendisliği" },
  // Gemi İnşaatı ve Gemi Makineleri Mühendisliği
  { id: "e21", course: "Gemi Teorisi", date: "18", month: "TEM", time: "10:30", room: "G-102 (Gemi Müh.)", department: "Gemi İnşaatı ve Gemi Makineleri Mühendisliği" },
  { id: "e22", course: "Gemi Hidrodinamiği", date: "25", month: "TEM", time: "13:00", room: "G-201 (Gemi Müh.)", department: "Gemi İnşaatı ve Gemi Makineleri Mühendisliği" },
  // Metalurji ve Malzeme Mühendisliği
  { id: "e23", course: "Malzeme Bilimi I", date: "19", month: "TEM", time: "11:00", room: "MM-102 (Metalurji)", department: "Metalurji ve Malzeme Mühendisliği" },
  { id: "e24", course: "Alaşım Faz Diyagramları", date: "26", month: "TEM", time: "15:30", room: "MM-204 (Metalurji)", department: "Metalurji ve Malzeme Mühendisliği" }
];
