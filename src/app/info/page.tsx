'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Sparkles, CheckCircle2, Wifi, Zap, 
  ShieldCheck, Wrench, MapPin, ArrowRight, ArrowLeft, 
  Droplets, Utensils
} from 'lucide-react';

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState<'semua' | 'standar' | 'ac' | 'studio'>('semua');

  // Otomatis scroll dan memusatkan card target bila ada hash #contact atau #units-pricing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: id === 'contact' ? 'center' : 'start' });
          }, 150);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const unitCategories = [
    {
      id: 'standar',
      blok: 'Blok A · Lantai 1',
      title: 'Kamar Standar (Non-AC)',
      image: '/images/rooms/kamar-standar.jpg',
      rangeUnit: '8 Unit (A-101 s.d A-108)',
      price: 'Rp1.350.000 – Rp1.450.000',
      period: '/ bulan',
      size: '15.0 – 16.0 m²',
      tag: 'Ekonomis & Nyaman',
      tagColor: 'bg-[#E8EFE5] text-[#2D4129] border border-[#95B08A]/30 dark:bg-[#2C382A] dark:text-[#95B08A]',
      description: 'Pilihan kamar nyaman dan hemat di lantai 1 dengan akses langsung tanpa perlu naik tangga. Dilengkapi kamar mandi dalam dan ventilasi alami yang sejuk.',
      features: [
        'Kamar mandi dalam (shower & kloset duduk)',
        'Kasur single berkualitas + sprei & bantal',
        'Lemari pakaian 2 pintu & meja belajar',
        'Ventilasi jendela ke ruang terbuka',
        'Meteran listrik prabayar (token) mandiri',
        'Akses WiFi fiber optic kecepatan tinggi',
      ]
    },
    {
      id: 'ac',
      blok: 'Blok B · Lantai 2',
      title: 'Kamar Ber-AC & Water Heater',
      image: '/images/rooms/kamar-ac.jpg',
      rangeUnit: '8 Unit (B-201 s.d B-208)',
      price: 'Rp1.750.000 – Rp2.000.000',
      period: '/ bulan',
      size: '17.0 – 19.0 m²',
      tag: 'Paling Diminati',
      tagColor: 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300',
      description: 'Kamar lantai 2 yang sejuk dan tenang. Dilengkapi pendingin ruangan (AC) hemat energi serta water heater untuk kenyamanan istirahat maksimal.',
      features: [
        'Air Conditioner (AC) 1/2 PK hemat daya',
        'Water heater (pemanas air) di kamar mandi dalam',
        'Kasur ukuran single besar / queen bed',
        'Meja kerja minimalis, kursi ergonomis, & rak buku',
        'Lemari pakaian modern 2 pintu dengan cermin',
        'Sirkulasi udara & jendela balkon view luar',
        'Meteran listrik token mandiri tiap unit',
      ]
    },
    {
      id: 'studio',
      blok: 'Blok C · Lantai 3',
      title: 'Studio Luas + Kitchenette',
      image: '/images/rooms/kamar-studio.jpg',
      rangeUnit: '8 Unit (C-301 s.d C-308)',
      price: 'Rp2.650.000 – Rp2.800.000',
      period: '/ bulan',
      size: '24.5 – 26.0 m²',
      tag: 'Eksklusif & Private',
      tagColor: 'bg-[#3B5336] text-white border-transparent',
      description: 'Unit tipe studio eksklusif di lantai 3 dengan ruang ekstra luas, kitchen sink pribadi, kulkas mini, dan privasi tinggi cocok untuk profesional maupun mahasiswa.',
      features: [
        'Kitchen sink & meja dapur pribadi (kitchenette)',
        'Kulkas mini satu pintu hemat listrik',
        'AC 1 PK dingin merata ke seluruh ruangan',
        'Water heater & kamar mandi dalam luas',
        'Area santai / seating spot dengan karpet lembut',
        'Smart TV ready & meja kerja luas',
        'Pemandangan lantai 3 yang asri dan tenang',
      ]
    }
  ];

  const filteredCategories = activeTab === 'semua' 
    ? unitCategories 
    : unitCategories.filter(u => u.id === activeTab);

  const generalFacilities = [
    {
      icon: Zap,
      title: 'Listrik Token Mandiri',
      desc: 'Setiap kamar memiliki meteran kWh prabayar mandiri. Penghuni bebas mengisi token sesuai kebutuhan pemakaian pribadi tanpa biaya tersembunyi.'
    },
    {
      icon: Wifi,
      title: 'WiFi Fiber Optic Cepat',
      desc: 'Jaringan internet nirkabel berkecepatan tinggi dengan access point mandiri di tiap lantai untuk kelancaran tugas, kerja remote, dan hiburan.'
    },
    {
      icon: ShieldCheck,
      title: 'Keamanan & CCTV 24 Jam',
      desc: 'Pengawasan CCTV aktif 24/7 di area parkir, lorong tiap lantai, dan gerbang masuk. Dilengkapi pagar akses keamanan untuk kenyamanan penghuni.'
    },
    {
      icon: Wrench,
      title: 'Layanan Tanggap Rusak',
      desc: 'Sistem aplikasi terintegrasi untuk pelaporan kerusakan (AC, lampu, pipa, sanitasi) yang langsung ditindaklanjuti teknisi pengelola.'
    },
    {
      icon: Utensils,
      title: 'Dapur & Area Bersama',
      desc: 'Disediakan fasilitas dapur bersama dengan kompor, dispenser air galon higienis, dan area jemuran pakaian yang terlindung dari hujan.'
    },
    {
      icon: Droplets,
      title: 'Air Bersih Terjamin',
      desc: 'Pasokan air sumur bor jernih dan tandon air bersih berkapasitas besar dengan pompa pendorong otomatis untuk tekanan air yang kuat.'
    }
  ];

  const houseRules = [
    'Wajib menyerahkan identitas resmi (KTP / Paspor) untuk verifikasi penyewa.',
    'Jam tenang malam berlaku mulai pukul 22.00 WIB demi kenyamanan seluruh penghuni.',
    'Tamu lawan jenis dilarang menginap di dalam kamar kos.',
    'Menjaga kebersihan area koridor bersama dan membuang sampah pada tempatnya.',
    'Pembayaran tagihan sewa bulanan jatuh tempo setiap tanggal 10 tiap bulan.',
    'Dilarang merokok di dalam kamar ber-AC dan memelihara hewan peliharaan besar.'
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-12 animate-in fade-in duration-300">
      
      {/* Top Breadcrumb & Back Link */}
      <div className="flex items-center justify-between">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#DCE5D8] bg-[#F4F7F2] px-4 py-2 text-xs font-bold text-[#2D4129] shadow-xs hover:bg-white hover:border-[#738F67] dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#95B08A] transition-all active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <span className="text-[11px] font-semibold text-[#5D6B58] dark:text-stone-400">
          Griya Kenanga Residence · Sleman, Yogyakarta
        </span>
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#3B5336] via-[#486642] to-[#2E432A] p-8 sm:p-12 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#E3EDE1] mb-4 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#95B08A]" />
            <span>Katalog Resmi &amp; Rincian Fasilitas Hunian</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Informasi Unit Kamar, Tarif Sewa &amp; Fasilitas Lengkap
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#D4E4D1] leading-relaxed">
            Griya Kenanga Residence menyediakan 24 unit hunian kos dan studio sewa modern di Sleman, Yogyakarta. 
            Dirancang dengan tata ruang estetis, pencahayaan alami optimal, dan fasilitas pendukung lengkap.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 font-bold text-white">
              <Building2 className="h-3.5 w-3.5" /> 24 Unit Total (3 Lantai)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 font-bold text-white">
              <MapPin className="h-3.5 w-3.5" /> Sleman, D.I. Yogyakarta
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 font-bold text-white">
              <ShieldCheck className="h-3.5 w-3.5" /> CCTV &amp; Akses Aman 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Tipe Kamar & Harga (Units & Pricing) */}
      <div id="units-pricing" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              Pilihan Kategori Unit
            </h2>
            <p className="text-xs sm:text-sm text-[#5D6B58] dark:text-stone-400 mt-0.5">
              Pilih kategori untuk melihat rincian spesifikasi, ukuran kamar, dan fasilitas tiap lantai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-[#DCE5D8] bg-[#F4F7F2] p-1.5 text-xs font-bold dark:border-[#2C382A] dark:bg-[#1E261D]">
            <button
              onClick={() => setActiveTab('semua')}
              className={`rounded-full px-4 py-1.5 transition-all ${
                activeTab === 'semua'
                  ? 'bg-[#3B5336] text-white shadow-xs'
                  : 'text-[#5D6B58] hover:text-[#2D4129] dark:text-stone-400'
              }`}
            >
              Semua Tipe (3)
            </button>
            <button
              onClick={() => setActiveTab('standar')}
              className={`rounded-full px-4 py-1.5 transition-all ${
                activeTab === 'standar'
                  ? 'bg-[#3B5336] text-white shadow-xs'
                  : 'text-[#5D6B58] hover:text-[#2D4129] dark:text-stone-400'
              }`}
            >
              Standar
            </button>
            <button
              onClick={() => setActiveTab('ac')}
              className={`rounded-full px-4 py-1.5 transition-all ${
                activeTab === 'ac'
                  ? 'bg-[#3B5336] text-white shadow-xs'
                  : 'text-[#5D6B58] hover:text-[#2D4129] dark:text-stone-400'
              }`}
            >
              Ber-AC
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`rounded-full px-4 py-1.5 transition-all ${
                activeTab === 'studio'
                  ? 'bg-[#3B5336] text-white shadow-xs'
                  : 'text-[#5D6B58] hover:text-[#2D4129] dark:text-stone-400'
              }`}
            >
              Studio
            </button>
          </div>
        </div>

        {/* Card Grid Unit Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCategories.map((unit) => (
            <div 
              key={unit.id}
              className="flex flex-col justify-between rounded-[28px] border border-[#DCE5D8] bg-white dark:border-[#2C382A] dark:bg-[#1E261D] p-6 sm:p-7 shadow-xs hover:shadow-md transition-all hover:border-[#738F67]"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5D6B58] dark:text-stone-400">
                    {unit.blok}
                  </span>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${unit.tagColor}`}>
                    {unit.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-2">
                  {unit.title}
                </h3>
                
                <p className="text-xs text-[#5D6B58] dark:text-stone-400 font-medium mt-0.5">
                  {unit.rangeUnit} · Luas {unit.size}
                </p>

                {/* Foto Kamar Kategori */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden mt-3 mb-4 border border-[#DCE5D8] dark:border-[#2C382A] bg-stone-100 group">
                  <Image
                    src={unit.image}
                    alt={unit.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                    Foto Asli Kamar
                  </div>
                </div>

                {/* Price Display */}
                <div className="rounded-2xl bg-[#F4F7F2] dark:bg-[#171D16] p-3.5 border border-[#DCE5D8] dark:border-[#2C382A]">
                  <span className="block text-[11px] font-medium text-[#5D6B58] dark:text-stone-400">Tarif Sewa Bulanan:</span>
                  <div className="text-base sm:text-lg font-extrabold text-[#3B5336] dark:text-[#95B08A]">
                    {unit.price} <span className="text-xs font-normal text-stone-400">{unit.period}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {unit.description}
                </p>

                {/* Inclusions / Features List */}
                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-[#5D6B58] dark:text-stone-400 tracking-wider">
                    Fasilitas Kamar:
                  </span>
                  {unit.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#3B5336] dark:text-[#95B08A] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-[#DCE5D8] dark:border-[#2C382A]">
                <Link
                  href="/sewa"
                  className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#3B5336] hover:bg-[#2D4129] py-3 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                >
                  <span>Lihat Ketersediaan &amp; Sewa Kamar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fasilitas Umum Gedung Section */}
      <div className="rounded-[28px] border border-[#DCE5D8] bg-white dark:border-[#2C382A] dark:bg-[#1E261D] p-6 sm:p-10 shadow-xs">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3B5336] dark:text-[#95B08A]">
            Kenyamanan Maksimal
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Fasilitas Bersama &amp; Layanan Gedung
          </h2>
          <p className="text-xs sm:text-sm text-[#5D6B58] dark:text-stone-400 mt-1">
            Dirancang untuk mendukung produktivitas, ketenangan belajar, dan keamanan penghuni selama tinggal di Griya Kenanga.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {generalFacilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-[#DCE5D8] bg-[#F4F7F2] dark:border-[#2C382A] dark:bg-[#171D16] p-5 transition-all hover:border-[#738F67]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8EFE5] text-[#3B5336] dark:bg-[#2C382A] dark:text-[#95B08A] mb-3.5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {fac.title}
                </h3>
                <p className="mt-1.5 text-xs text-[#5D6B58] dark:text-stone-400 leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tata Tertib & Aturan Hunian */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Kolom Aturan */}
        <div className="lg:col-span-7 rounded-[28px] border border-[#DCE5D8] bg-white dark:border-[#2C382A] dark:bg-[#1E261D] p-6 sm:p-8 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5D6B58] dark:text-stone-400">
            Harmoni &amp; Ketertiban
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Tata Tertib &amp; Peraturan Kos
          </h2>
          <p className="text-xs text-[#5D6B58] dark:text-stone-400 mt-1">
            Pedoman bersama untuk memastikan kenyamanan, keamanan, dan ketenangan seluruh warga hunian.
          </p>

          <div className="mt-6 space-y-3">
            {houseRules.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-2xl bg-[#F4F7F2] dark:bg-[#171D16] p-3.5 text-xs text-stone-700 dark:text-stone-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#3B5336] text-[10px] font-bold text-white">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kontak & Lokasi (Contact) */}
        <div 
          id="contact" 
          className="lg:col-span-5 flex flex-col justify-between rounded-[28px] border border-[#DCE5D8] bg-[#F4F7F2] dark:border-[#2C382A] dark:bg-[#171D16] p-6 sm:p-8 shadow-xs scroll-mt-28 target:border-[#3B5336] target:ring-4 target:ring-[#3B5336]/20 dark:target:border-[#95B08A] dark:target:ring-[#95B08A]/30 transition-all duration-300"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3B5336] text-white mb-4 shadow-xs">
              <MapPin className="h-5 w-5" />
            </div>

            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Lokasi &amp; Kontak Pengelola
            </h3>
            
            <p className="mt-2 text-xs text-[#5D6B58] dark:text-stone-400 leading-relaxed">
              <strong>Griya Kenanga Residence</strong><br />
              Jl. Kenanga No. 24, Caturtunggal, Depok, Sleman, Daerah Istimewa Yogyakarta 55281
            </p>

            <div className="mt-5 space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
              <a 
                href="https://wa.me/6281234567002?text=Halo%20Pengelola%20Griya%20Kenanga,%20saya%20ingin%20bertanya%20informasi%20kamar%20kos" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-[#1E261D] border border-[#DCE5D8] dark:border-[#2C382A] hover:border-[#3B5336] dark:hover:border-[#95B08A] transition-all group"
              >
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">WhatsApp:</span>
                  <span className="text-[#3B5336] dark:text-[#95B08A] font-semibold">0812-3456-7002 (Bayu Prasetyo)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 group-hover:scale-105 transition-all">Chat &rarr;</span>
              </a>

              <a 
                href="mailto:pengelola@griyakenanga.test"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-[#1E261D] border border-[#DCE5D8] dark:border-[#2C382A] hover:border-[#3B5336] dark:hover:border-[#95B08A] transition-all group"
              >
                <div>
                  <span className="font-bold text-stone-900 dark:text-stone-100 block">Email:</span>
                  <span>pengelola@griyakenanga.test</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3B5336]/10 text-[#3B5336] dark:text-[#95B08A] group-hover:scale-105 transition-all">Kirim &rarr;</span>
              </a>

              <div className="flex items-center gap-2 px-1 text-xs">
                <span className="font-bold text-stone-900 dark:text-stone-100">Jam Layanan:</span>
                <span>Senin – Sabtu (08.00 – 20.00 WIB)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#DCE5D8] dark:border-[#2C382A] space-y-2.5">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#3B5336] hover:bg-[#2D4129] py-3 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
            >
              <span>Kembali &amp; Masuk ke Akun</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
