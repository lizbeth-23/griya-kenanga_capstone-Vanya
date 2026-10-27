'use client';

import { 
  Profile, TenantIdentity, PropertyUnit, Contract, Invoice, Payment, 
  DamageReport, AuditLogItem, UserRole, VerificationStatus, DamageStatus 
} from './types';
import { 
  INITIAL_PROFILES, INITIAL_IDENTITIES, INITIAL_UNITS, INITIAL_CONTRACTS, 
  INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_DAMAGE_REPORTS, INITIAL_AUDIT_LOGS 
} from './mock-data';

export const REFERENCE_DATE = '2026-10-15';

interface StorageState {
  currentUser: Profile | null;
  profiles: Profile[];
  identities: TenantIdentity[];
  units: PropertyUnit[];
  contracts: Contract[];
  invoices: Invoice[];
  payments: Payment[];
  damageReports: DamageReport[];
  auditLogs: AuditLogItem[];
  nextDocSeq: {
    KTR: Record<string, number>;
    INV: Record<string, number>;
    LK: Record<string, number>;
  };
}

const STORAGE_KEY = 'griya_kenanga_state_v1';

export function getDefaultState(): StorageState {
  return {
    currentUser: null, // Default: Belum login saat pertama buka link
    profiles: INITIAL_PROFILES,
    identities: INITIAL_IDENTITIES,
    units: INITIAL_UNITS,
    contracts: INITIAL_CONTRACTS,
    invoices: INITIAL_INVOICES,
    payments: INITIAL_PAYMENTS,
    damageReports: INITIAL_DAMAGE_REPORTS,
    auditLogs: INITIAL_AUDIT_LOGS,
    nextDocSeq: {
      KTR: { '2026': 23 },
      INV: { '202610': 19, '202609': 19, '202608': 19 },
      LK: { '2026': 13 }
    }
  };
}

export class GriyaStore {
  private static instance: GriyaStore;
  private state: StorageState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): GriyaStore {
    if (!GriyaStore.instance) {
      GriyaStore.instance = new GriyaStore();
    }
    return GriyaStore.instance;
  }

  private loadState(): StorageState {
    if (typeof window === 'undefined') {
      return getDefaultState();
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial mock data', e);
    }
    return getDefaultState();
  }

  private persistState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to persist state to localStorage', e);
      }
    }
    this.listeners.forEach(fn => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public resetToDefault() {
    this.state = getDefaultState();
    this.persistState();
  }

  // --- AUTHENTICATION & SESSION ---
  public getState(): StorageState {
    return this.state;
  }

  public getCurrentUser(): Profile | null {
    return this.state.currentUser;
  }

  public isEmailRegistered(email: string): boolean {
    const trimmed = email.trim().toLowerCase();
    return this.state.profiles.some(p => p.email.toLowerCase() === trimmed);
  }

  public getProfileByEmail(email: string): Profile | undefined {
    const trimmed = email.trim().toLowerCase();
    return this.state.profiles.find(p => p.email.toLowerCase() === trimmed);
  }

  public loginWithGoogle(email: string): Profile {
    const trimmed = email.trim().toLowerCase();
    const found = this.state.profiles.find(p => p.email.toLowerCase() === trimmed);
    if (!found) {
      throw new Error('Akun Google ini belum terdaftar dalam sistem. Silakan buat akun pendaftaran terlebih dahulu.');
    }
    if (!found.aktif) {
      throw new Error('Akun Google ini telah dinonaktifkan oleh administrator');
    }
    this.state.currentUser = found;
    this.persistState();
    return found;
  }

  public login(email: string, kataSandi?: string): Profile {
    const trimmed = email.trim().toLowerCase();
    const found = this.state.profiles.find(p => p.email.toLowerCase() === trimmed);
    if (!found) {
      throw new Error('Email tidak terdaftar dalam sistem');
    }
    if (!found.aktif) {
      throw new Error('Akun ini telah dinonaktifkan oleh administrator');
    }
    // Sandi latihan default Latihan#2026 atau jika diisi sembarang untuk demo
    if (kataSandi && kataSandi !== 'Latihan#2026' && kataSandi.length < 6) {
      throw new Error('Kata sandi minimal 6 karakter');
    }

    this.state.currentUser = found;
    this.persistState();
    return found;
  }

  public register(data: { nama_lengkap: string; email: string; no_hp?: string; kata_sandi?: string }): Profile {
    const trimmedEmail = data.email.trim().toLowerCase();
    if (!trimmedEmail || !data.nama_lengkap) {
      throw new Error('Nama lengkap dan email wajib diisi');
    }

    const exists = this.state.profiles.some(p => p.email.toLowerCase() === trimmedEmail);
    if (exists) {
      throw new Error('Email sudah terdaftar, silakan langsung masuk (login)');
    }

    // PRD: Akun baru yang mendaftar sendiri SELALU berperan Penyewa
    const newProfile: Profile = {
      id: `user-${Date.now()}`,
      nama_lengkap: data.nama_lengkap.trim(),
      email: trimmedEmail,
      no_hp: data.no_hp?.trim() || undefined,
      peran: 'penyewa',
      aktif: true,
      dibuat_pada: new Date().toISOString()
    };

    this.state.profiles.push(newProfile);
    this.state.currentUser = newProfile;
    this.persistState();
    return newProfile;
  }

  public logout() {
    this.state.currentUser = null;
    this.persistState();
  }

  public setCurrentUserByEmail(email: string) {
    const found = this.state.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      this.state.currentUser = found;
      this.persistState();
    }
  }

  public setCurrentUserByRole(role: UserRole) {
    const found = this.state.profiles.find(p => p.peran === role && p.aktif);
    if (found) {
      this.state.currentUser = found;
      this.persistState();
    }
  }

  // --- AUDIT LOG HELPER ---
  private logAudit(aksi: string, tabel: string, dataId: string, sebelum?: Record<string, unknown>, sesudah?: Record<string, unknown>) {
    const user = this.state.currentUser;
    const newLog: AuditLogItem = {
      id: Date.now(),
      pelaku_id: user ? user.id : undefined,
      pelaku_nama: user ? user.nama_lengkap : 'Sistem / Anonim',
      peran: user ? user.peran : undefined,
      aksi,
      tabel,
      data_id: dataId,
      sebelum: sebelum || null,
      sesudah: sesudah || null,
      dibuat_pada: new Date().toISOString()
    };
    this.state.auditLogs = [newLog, ...this.state.auditLogs];
  }

  // --- NO URUT GENERATOR ---
  private getNextNumber(jenis: 'KTR' | 'INV' | 'LK', periode: string): string {
    if (!this.state.nextDocSeq[jenis]) {
      this.state.nextDocSeq[jenis] = {};
    }
    const current = this.state.nextDocSeq[jenis][periode] || 0;
    const nextVal = current + 1;
    this.state.nextDocSeq[jenis][periode] = nextVal;
    
    const seqStr = String(nextVal).padStart(4, '0');
    if (jenis === 'INV') {
      return `INV-${periode}-${seqStr}`;
    }
    return `${jenis}-${periode}-${seqStr}`;
  }

  public requireUser(): Profile {
    if (!this.state.currentUser) {
      throw new Error('Silakan masuk (login) terlebih dahulu');
    }
    return this.state.currentUser;
  }

  // --- UNIT ACTIONS ---
  public updateUnitStatus(unitId: string, newStatus: 'tersedia' | 'perbaikan' | 'nonaktif') {
    const user = this.requireUser();
    if (user.peran === 'penyewa') {
      throw new Error('Penyewa tidak memiliki izin mengubah status unit');
    }

    const unit = this.state.units.find(u => u.id === unitId);
    if (!unit) throw new Error('Unit tidak ditemukan');

    // BR-04: Unit yang masih punya kontrak draf atau aktif tidak boleh dinonaktifkan
    if (newStatus === 'nonaktif') {
      const hasActiveOrDraft = this.state.contracts.some(
        c => c.unit_id === unitId && (c.status === 'aktif' || c.status === 'draf')
      );
      if (hasActiveOrDraft) {
        throw new Error('Unit yang masih memiliki kontrak aktif atau draf tidak boleh dinonaktifkan');
      }
    }

    const oldStatus = unit.status;
    unit.status = newStatus;
    this.logAudit('unit:ubah_status', 'unit', unit.kode, { status: oldStatus }, { status: newStatus });
    this.persistState();
  }

  public updateUnitPrice(unitId: string, newPrice: number) {
    const user = this.requireUser();
    // BR-04 & BR-10: Hanya Pemilik yang boleh ubah harga
    if (user.peran !== 'pemilik') {
      throw new Error('Hanya Pemilik yang berhak mengubah harga sewa unit');
    }
    if (newPrice <= 0) {
      throw new Error('Harga sewa harus lebih dari Rp 0');
    }

    const unit = this.state.units.find(u => u.id === unitId);
    if (!unit) throw new Error('Unit tidak ditemukan');

    const oldPrice = unit.harga_sewa_bulanan;
    unit.harga_sewa_bulanan = newPrice;
    this.logAudit('unit:ubah_harga', 'unit', unit.kode, { harga: oldPrice }, { harga: newPrice });
    this.persistState();
  }

  // --- IDENTITAS PENYEWA ACTIONS ---
  public submitIdentity(identity: Omit<TenantIdentity, 'penyewa_id' | 'status_verifikasi' | 'diperbarui_pada'>) {
    const user = this.requireUser();
    const tenantId = user.id;
    if (identity.nik.length !== 16 || !/^\d{16}$/.test(identity.nik)) {
      throw new Error('NIK harus tepat 16 angka');
    }

    const existingIndex = this.state.identities.findIndex(i => i.penyewa_id === tenantId);
    const updated: TenantIdentity = {
      ...identity,
      penyewa_id: tenantId,
      status_verifikasi: 'belum',
      diperbarui_pada: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.state.identities[existingIndex] = updated;
    } else {
      this.state.identities.push(updated);
    }
    this.persistState();
  }

  public verifyIdentity(tenantId: string, approved: boolean, alasanTolak?: string) {
    const user = this.requireUser();
    if (user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat memverifikasi identitas penyewa');
    }

    const ident = this.state.identities.find(i => i.penyewa_id === tenantId);
    if (!ident) throw new Error('Identitas penyewa belum diunggah');

    if (!approved && !alasanTolak) {
      throw new Error('Alasan wajib diisi bila identitas ditolak');
    }

    ident.status_verifikasi = approved ? 'terverifikasi' : 'ditolak';
    ident.alasan_tolak = approved ? undefined : alasanTolak;
    ident.diverifikasi_oleh = user.id;
    ident.diverifikasi_pada = new Date().toISOString();
    ident.diperbarui_pada = new Date().toISOString();

    this.logAudit(
      `identitas:verifikasi:${ident.status_verifikasi}`,
      'identitas_penyewa',
      tenantId,
      undefined,
      { status: ident.status_verifikasi, alasan: alasanTolak }
    );
    this.persistState();
  }

  // --- KONTRAK ACTIONS ---
  public createContract(data: {
    unit_id: string;
    penyewa_id: string;
    tanggal_mulai: string;
    durasi_bulan: 1 | 3 | 6 | 12;
  }): Contract {
    const user = this.requireUser();
    if (user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat membuat kontrak baru');
    }

    const unit = this.state.units.find(u => u.id === data.unit_id);
    if (!unit) throw new Error('Unit tidak ditemukan');

    // BR-04: Kontrak baru hanya bisa dibuat untuk unit berstatus "tersedia"
    if (unit.status !== 'tersedia') {
      throw new Error(`Kontrak tidak dapat dibuat karena unit berstatus ${unit.status}`);
    }

    // BR-02: Tanggal mulai selalu tanggal 1
    const startDate = new Date(data.tanggal_mulai);
    if (startDate.getDate() !== 1) {
      throw new Error('Kontrak harus selalu dimulai pada tanggal 1');
    }

    // Hitung tanggal selesai: hari terakhir bulan ke-(mulai + durasi - 1)
    const endYear = startDate.getFullYear();
    const endMonth = startDate.getMonth() + data.durasi_bulan;
    const lastDayOfMonth = new Date(endYear, endMonth, 0);
    const tanggal_selesai = `${lastDayOfMonth.getFullYear()}-${String(lastDayOfMonth.getMonth() + 1).padStart(2, '0')}-${String(lastDayOfMonth.getDate()).padStart(2, '0')}`;

    // BR-01: Satu unit tidak boleh memiliki 2 kontrak draf/aktif yang periodenya beririsan
    const hasOverlap = this.state.contracts.some(c => {
      if (c.unit_id !== data.unit_id) return false;
      if (c.status !== 'aktif' && c.status !== 'draf') return false;

      // Irisan: startA <= endB && endA >= startB
      return data.tanggal_mulai <= c.tanggal_selesai && tanggal_selesai >= c.tanggal_mulai;
    });

    if (hasOverlap) {
      throw new Error('Unit sudah memiliki kontrak berstatus draf atau aktif yang periodenya beririsan');
    }

    const tahun = String(startDate.getFullYear());
    const nomor = this.getNextNumber('KTR', tahun);

    const newContract: Contract = {
      id: `ktr-${Date.now()}`,
      nomor,
      unit_id: data.unit_id,
      penyewa_id: data.penyewa_id,
      tanggal_mulai: data.tanggal_mulai,
      durasi_bulan: data.durasi_bulan,
      tanggal_selesai,
      harga_sewa_bulanan: unit.harga_sewa_bulanan, // Disalin dari unit, dikunci (BR-04)
      status: 'draf',
      dibuat_oleh: user.id,
      dibuat_pada: new Date().toISOString()
    };

    this.state.contracts.push(newContract);
    this.logAudit('kontrak:buat_draf', 'kontrak', newContract.nomor, undefined, { nomor, unit: unit.kode });
    this.persistState();
    return newContract;
  }

  public activateContract(contractId: string) {
    const user = this.requireUser();
    if (user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat mengaktifkan kontrak');
    }

    const contract = this.state.contracts.find(c => c.id === contractId);
    if (!contract || contract.status !== 'draf') {
      throw new Error('Kontrak tidak ditemukan atau bukan berstatus draf');
    }

    // BR-03: Identitas penyewa harus sudah diverifikasi Pengelola
    const ident = this.state.identities.find(i => i.penyewa_id === contract.penyewa_id);
    if (!ident || ident.status_verifikasi !== 'terverifikasi') {
      throw new Error('Kontrak draf hanya bisa diaktifkan bila identitas penyewa sudah diverifikasi');
    }

    // BR-03: Satu penyewa paling banyak memiliki satu kontrak aktif
    const hasActive = this.state.contracts.some(
      c => c.penyewa_id === contract.penyewa_id && c.status === 'aktif' && c.id !== contractId
    );
    if (hasActive) {
      throw new Error('Penyewa sudah memiliki satu kontrak aktif. Perpanjangan baru bisa diaktifkan setelah kontrak lama selesai.');
    }

    contract.status = 'aktif';
    contract.diaktifkan_pada = new Date().toISOString();

    this.logAudit('status:kontrak:draf->aktif', 'kontrak', contract.nomor, { status: 'draf' }, { status: 'aktif' });
    this.persistState();
  }

  public cancelDraftContract(contractId: string) {
    const user = this.requireUser();
    if (user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat membatalkan draf kontrak');
    }
    const contract = this.state.contracts.find(c => c.id === contractId);
    if (!contract || contract.status !== 'draf') {
      throw new Error('Hanya kontrak draf yang bisa dibatalkan');
    }
    contract.status = 'dibatalkan';
    this.logAudit('status:kontrak:draf->dibatalkan', 'kontrak', contract.nomor);
    this.persistState();
  }

  public completeContract(contractId: string) {
    const user = this.requireUser();
    if (user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat menyelesaikan kontrak');
    }
    const contract = this.state.contracts.find(c => c.id === contractId);
    if (!contract || contract.status !== 'aktif') {
      throw new Error('Hanya kontrak aktif yang dapat diselesaikan');
    }

    // BR-05: Tanggal selesai sudah lewat dan semua tagihannya lunas
    if (contract.tanggal_selesai > REFERENCE_DATE) {
      throw new Error(`Kontrak belum berakhir (selesai: ${contract.tanggal_selesai}). Belum dapat diselesaikan.`);
    }

    const hasUnpaid = this.state.invoices.some(
      inv => inv.kontrak_id === contractId && inv.status !== 'lunas' && inv.status !== 'dibatalkan'
    );
    if (hasUnpaid) {
      throw new Error('Kontrak hanya bisa diselesaikan setelah semua tagihannya lunas');
    }

    contract.status = 'selesai';
    contract.tanggal_berakhir_aktual = REFERENCE_DATE;
    this.logAudit('status:kontrak:aktif->selesai', 'kontrak', contract.nomor);
    this.persistState();
  }

  public terminateContractEarly(contractId: string, alasan: string) {
    const user = this.requireUser();
    // BR-05: Pengakhiran lebih awal hanya oleh Pemilik, wajib dengan alasan
    if (user.peran !== 'pemilik') {
      throw new Error('Pengakhiran kontrak lebih awal hanya dapat dilakukan oleh Pemilik');
    }
    if (!alasan || alasan.trim().length === 0) {
      throw new Error('Alasan pengakhiran wajib diisi');
    }

    const contract = this.state.contracts.find(c => c.id === contractId);
    if (!contract || contract.status !== 'aktif') {
      throw new Error('Kontrak aktif tidak ditemukan');
    }

    contract.status = 'diakhiri';
    contract.tanggal_berakhir_aktual = REFERENCE_DATE;
    contract.alasan_berakhir = alasan;

    this.logAudit('kontrak:diakhiri', 'kontrak', contract.nomor, { status: 'aktif' }, { status: 'diakhiri', alasan });
    this.persistState();
  }

  // --- TAGIHAN ACTIONS ---
  public generateMonthlyInvoices(periodeStr: string = '2026-11-01'): { createdCount: number } {
    const user = this.requireUser();
    if (user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat membuat tagihan bulanan');
    }

    // Periode harus tanggal 1
    const pDate = new Date(periodeStr);
    const periodeFormatted = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-01`;
    const jatuhTempo = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-10`;
    const periodeKey = `${pDate.getFullYear()}${String(pDate.getMonth() + 1).padStart(2, '0')}`;

    // Cari semua kontrak aktif yang mencakup periode ini
    const activeContracts = this.state.contracts.filter(c => {
      if (c.status !== 'aktif') return false;
      return c.tanggal_mulai <= periodeFormatted && c.tanggal_selesai >= periodeFormatted;
    });

    let createdCount = 0;
    for (const contract of activeContracts) {
      // BR-06: Satu kontrak hanya punya satu tagihan per periode (anti kembar / idempotent)
      const exists = this.state.invoices.some(
        inv => inv.kontrak_id === contract.id && inv.periode === periodeFormatted
      );
      if (!exists) {
        const nomor = this.getNextNumber('INV', periodeKey);
        const newInvoice: Invoice = {
          id: `inv-${Date.now()}-${createdCount}`,
          nomor,
          kontrak_id: contract.id,
          periode: periodeFormatted,
          jatuh_tempo: jatuhTempo,
          nominal_sewa: contract.harga_sewa_bulanan,
          denda: 0,
          terbayar: 0,
          status: 'belum_bayar',
          dibuat_oleh: user.id,
          dibuat_pada: new Date().toISOString()
        };
        this.state.invoices.push(newInvoice);
        createdCount++;
      }
    }

    if (createdCount > 0) {
      this.logAudit('tagihan:buat_bulanan', 'tagihan', `periode:${periodeKey}`, undefined, { total_dibuat: createdCount });
      this.persistState();
    }

    return { createdCount };
  }

  public cancelInvoice(invoiceId: string, alasan: string) {
    const user = this.requireUser();
    // BR-09: Tagihan hanya bisa dibatalkan Pemilik bila belum ada pembayaran sama sekali
    if (user.peran !== 'pemilik') {
      throw new Error('Hanya Pemilik yang dapat membatalkan tagihan');
    }
    if (!alasan) throw new Error('Alasan pembatalan tagihan wajib diisi');

    const inv = this.state.invoices.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Tagihan tidak ditemukan');

    if (inv.terbayar > 0) {
      throw new Error('Tagihan yang sudah memiliki riwayat pembayaran tidak dapat dibatalkan');
    }

    inv.status = 'dibatalkan';
    inv.alasan_batal = alasan;
    this.logAudit('tagihan:dibatalkan', 'tagihan', inv.nomor, { status: 'belum_bayar' }, { status: 'dibatalkan', alasan });
    this.persistState();
  }

  // --- PEMBAYARAN ACTIONS ---
  public recordPayment(data: {
    tagihan_id: string;
    jumlah: number;
    metode: 'tunai' | 'transfer' | 'mayar';
    tanggal_bayar?: string;
    bukti_path?: string;
    referensi_mayar?: string;
  }): Payment {
    const user = this.requireUser();
    const isTenant = user.peran === 'penyewa';
    if (isTenant && data.metode !== 'mayar') {
      throw new Error('Penyewa hanya dapat melakukan pembayaran melalui bayar online (Mayar)');
    }
    if (!isTenant && user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat mencatat pembayaran tunai atau transfer');
    }

    const inv = this.state.invoices.find(i => i.id === data.tagihan_id);
    if (!inv) throw new Error('Tagihan tidak ditemukan');
    if (inv.status === 'lunas' || inv.status === 'dibatalkan') {
      throw new Error('Tagihan sudah lunas atau dibatalkan');
    }

    // BR-08: Transfer wajib melampirkan foto bukti
    if (data.metode === 'transfer' && !data.bukti_path) {
      throw new Error('Pembayaran transfer wajib melampirkan foto bukti');
    }

    const payDate = data.tanggal_bayar || REFERENCE_DATE;

    // BR-07: Perhitungan Denda Keterlambatan
    // Setelah jatuh tempo (tgl 10): Rp20.000 / hari, maks Rp200.000
    let updatedDenda = inv.denda;
    if (payDate > inv.jatuh_tempo) {
      const d1 = new Date(payDate).getTime();
      const d2 = new Date(inv.jatuh_tempo).getTime();
      const diffDays = Math.max(0, Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24)));
      updatedDenda = Math.min(200000, Math.max(inv.denda, diffDays * 20000));
    }

    const totalKewajiban = inv.nominal_sewa + updatedDenda;
    const sisaTagihan = totalKewajiban - inv.terbayar;

    // BR-08: Jumlah tidak boleh melebihi sisa tagihan
    if (data.jumlah > sisaTagihan) {
      throw new Error(`Jumlah bayar (Rp${data.jumlah.toLocaleString('id-ID')}) melebihi sisa tagihan (Rp${sisaTagihan.toLocaleString('id-ID')})`);
    }

    // BR-08: Minimal Rp100.000 per cicilan kecuali cicilan terakhir yang melunasi sisa
    if (data.jumlah < 100000 && data.jumlah !== sisaTagihan) {
      throw new Error('Minimal pembayaran adalah Rp100.000 kecuali jika melunasi sisa tagihan');
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      tagihan_id: data.tagihan_id,
      jumlah: data.jumlah,
      metode: data.metode,
      tanggal_bayar: payDate,
      bukti_path: data.bukti_path,
      referensi_mayar: data.referensi_mayar,
      status: 'sah',
      dicatat_oleh: isTenant ? undefined : user.id,
      dibuat_pada: new Date().toISOString()
    };

    this.state.payments.push(newPayment);

    // Update status tagihan otomatis (BR-08)
    inv.denda = updatedDenda;
    inv.terbayar += data.jumlah;
    if (inv.terbayar >= totalKewajiban) {
      inv.status = 'lunas';
    } else {
      inv.status = 'sebagian';
    }

    this.logAudit('pembayaran:catat', 'pembayaran', newPayment.id, undefined, {
      tagihan: inv.nomor,
      jumlah: data.jumlah,
      status_tagihan: inv.status
    });

    this.persistState();
    return newPayment;
  }

  public cancelPayment(paymentId: string, alasan: string) {
    const user = this.requireUser();
    // BR-09: Pembayaran yang sudah dicatat tidak bisa diubah atau dihapus. Koreksi dilakukan Pemilik dengan membatalkan.
    if (user.peran !== 'pemilik') {
      throw new Error('Hanya Pemilik yang berhak membatalkan pembayaran');
    }
    if (!alasan) throw new Error('Alasan pembatalan pembayaran wajib diisi');

    const payment = this.state.payments.find(p => p.id === paymentId);
    if (!payment || payment.status === 'dibatalkan') {
      throw new Error('Pembayaran tidak ditemukan atau sudah dibatalkan');
    }

    const inv = this.state.invoices.find(i => i.id === payment.tagihan_id);
    if (!inv) throw new Error('Tagihan terkait tidak ditemukan');

    payment.status = 'dibatalkan';
    payment.alasan_batal = alasan;
    payment.dibatalkan_oleh = user.id;
    payment.dibatalkan_pada = new Date().toISOString();

    // Hitung ulang saldo tagihan (BR-09)
    inv.terbayar = Math.max(0, inv.terbayar - payment.jumlah);
    const totalKewajiban = inv.nominal_sewa + inv.denda;
    if (inv.terbayar === 0) {
      inv.status = 'belum_bayar';
    } else if (inv.terbayar < totalKewajiban) {
      inv.status = 'sebagian';
    } else {
      inv.status = 'lunas';
    }

    this.logAudit('pembayaran:dibatalkan', 'pembayaran', payment.id, { status: 'sah', jumlah: payment.jumlah }, { status: 'dibatalkan', alasan });
    this.persistState();
  }

  // --- LAPORAN KERUSAKAN ACTIONS ---
  public reportDamage(data: {
    kategori: 'listrik' | 'air' | 'ac' | 'bangunan' | 'perabot' | 'lainnya';
    judul: string;
    deskripsi: string;
    foto_paths: string[];
  }): DamageReport {
    const user = this.requireUser();
    if (user.peran !== 'penyewa') {
      throw new Error('Hanya Penyewa yang dapat membuat laporan kerusakan');
    }

    // BR-11: Hanya bisa dibuat oleh penyewa yang memiliki kontrak aktif
    const activeContract = this.state.contracts.find(
      c => c.penyewa_id === user.id && c.status === 'aktif'
    );
    if (!activeContract) {
      throw new Error('Anda tidak memiliki kontrak aktif untuk mengajukan laporan kerusakan');
    }

    // BR-11: 1 sampai 3 foto
    if (!data.foto_paths || data.foto_paths.length < 1 || data.foto_paths.length > 3) {
      throw new Error('Laporan wajib menyertakan 1 sampai 3 foto kerusakan');
    }

    // Judul 5 sampai 80 karakter
    if (data.judul.trim().length < 5 || data.judul.trim().length > 80) {
      throw new Error('Judul laporan harus antara 5 sampai 80 karakter');
    }

    // BR-11: Satu penyewa paling banyak memiliki 3 laporan terbuka (dilaporkan, diproses, menunggu_persetujuan)
    const openReportsCount = this.state.damageReports.filter(
      r => r.pelapor_id === user.id &&
      ['dilaporkan', 'diproses', 'menunggu_persetujuan'].includes(r.status)
    ).length;

    if (openReportsCount >= 3) {
      throw new Error('Batas maksimal 3 laporan kerusakan terbuka telah tercapai. Harap tunggu laporan sebelumnya diselesaikan.');
    }

    const nomor = this.getNextNumber('LK', '2026');
    const newReport: DamageReport = {
      id: `lk-${Date.now()}`,
      nomor,
      kontrak_id: activeContract.id,
      unit_id: activeContract.unit_id,
      pelapor_id: user.id,
      kategori: data.kategori,
      judul: data.judul,
      deskripsi: data.deskripsi,
      foto_paths: data.foto_paths,
      status: 'dilaporkan',
      estimasi_biaya: 0,
      biaya_aktual: 0,
      dibuat_pada: new Date().toISOString(),
      diperbarui_pada: new Date().toISOString()
    };

    this.state.damageReports.unshift(newReport);
    this.logAudit('kerusakan:buat_laporan', 'laporan_kerusakan', newReport.nomor, undefined, { judul: data.judul });
    this.persistState();
    return newReport;
  }

  public processDamageReport(reportId: string, estimasiBiaya: number, catatan?: string) {
    const user = this.requireUser();
    if (user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat memproses laporan kerusakan');
    }
    const report = this.state.damageReports.find(r => r.id === reportId);
    if (!report || report.status !== 'dilaporkan') {
      throw new Error('Laporan tidak ditemukan atau bukan berstatus dilaporkan');
    }

    // BR-12: Pengelola wajib mengisi estimasi biaya sebelum memproses
    if (estimasiBiaya <= 0) {
      throw new Error('Pengelola wajib mengisi estimasi biaya sebelum memproses');
    }

    report.estimasi_biaya = estimasiBiaya;
    report.catatan = catatan;

    // BR-12: Estimasi di atas Rp1.000.000 wajib disetujui Pemilik sebelum dikerjakan
    if (estimasiBiaya > 1000000) {
      report.status = 'menunggu_persetujuan';
    } else {
      report.status = 'diproses';
    }
    report.diperbarui_pada = new Date().toISOString();

    this.logAudit(
      `status:kerusakan:dilaporkan->${report.status}`,
      'laporan_kerusakan',
      report.nomor,
      { status: 'dilaporkan' },
      { status: report.status, estimasi_biaya: estimasiBiaya }
    );
    this.persistState();
  }

  public approveDamageReport(reportId: string, approved: boolean, alasanTolak?: string) {
    const user = this.requireUser();
    // BR-12: Estimasi atau biaya aktual di atas Rp1.000.000 disetujui/ditolak Pemilik
    if (user.peran !== 'pemilik') {
      throw new Error('Hanya Pemilik yang dapat menyetujui biaya kerusakan di atas Rp1.000.000');
    }
    const report = this.state.damageReports.find(r => r.id === reportId);
    if (!report || report.status !== 'menunggu_persetujuan') {
      throw new Error('Laporan tidak sedang menunggu persetujuan');
    }

    if (!approved && !alasanTolak) {
      throw new Error('Alasan wajib diisi bila persetujuan biaya ditolak');
    }

    report.status = approved ? 'diproses' : 'ditolak';
    report.disetujui_oleh = approved ? user.id : undefined;
    report.disetujui_pada = approved ? new Date().toISOString() : undefined;
    report.alasan_tolak = approved ? undefined : alasanTolak;
    report.diperbarui_pada = new Date().toISOString();

    this.logAudit(
      `status:kerusakan:persetujuan_pemilik:${report.status}`,
      'laporan_kerusakan',
      report.nomor,
      { status: 'menunggu_persetujuan' },
      { status: report.status, alasan: alasanTolak }
    );
    this.persistState();
  }

  public markDamageRepaired(reportId: string, biayaAktual: number) {
    const user = this.requireUser();
    if (user.peran !== 'pengelola') {
      throw new Error('Hanya Pengelola yang dapat menandai laporan selesai diperbaiki');
    }
    const report = this.state.damageReports.find(r => r.id === reportId);
    if (!report || report.status !== 'diproses') {
      throw new Error('Laporan tidak dalam status diproses');
    }
    if (biayaAktual < 0) {
      throw new Error('Biaya aktual tidak boleh negatif');
    }

    report.status = 'selesai';
    report.biaya_aktual = biayaAktual;
    report.selesai_pada = new Date().toISOString();
    report.diperbarui_pada = new Date().toISOString();

    this.logAudit('status:kerusakan:diproses->selesai', 'laporan_kerusakan', report.nomor, undefined, { biaya_aktual: biayaAktual });
    this.persistState();
  }

  public closeDamageReport(reportId: string) {
    const user = this.requireUser();
    const report = this.state.damageReports.find(r => r.id === reportId);
    if (!report || report.status !== 'selesai') {
      throw new Error('Laporan belum berstatus selesai');
    }

    const currentUserId = user.id;
    const isReporter = report.pelapor_id === currentUserId;

    // BR-12: Laporan selesai ditutup oleh penyewa pelapor; bila 3 hari setelah selesai belum ditutup, Pengelola boleh menutupnya
    if (!isReporter) {
      if (user.peran !== 'pengelola') {
        throw new Error('Hanya penyewa pelapor atau Pengelola yang dapat menutup laporan');
      }

      const selesaiDate = report.selesai_pada ? new Date(report.selesai_pada).getTime() : 0;
      const refDate = new Date(REFERENCE_DATE).getTime();
      const diffDays = (refDate - selesaiDate) / (1000 * 60 * 60 * 24);

      if (diffDays < 3) {
        throw new Error('Pengelola baru boleh menutup laporan bila 3 hari setelah selesai belum ditutup oleh penyewa');
      }
    }

    report.status = 'ditutup';
    report.ditutup_pada = new Date().toISOString();
    report.diperbarui_pada = new Date().toISOString();

    this.logAudit('status:kerusakan:selesai->ditutup', 'laporan_kerusakan', report.nomor);
    this.persistState();
  }

  // --- KELOLA PERAN AKUN (BR-10) ---
  public updateUserRole(targetUserId: string, newRole: UserRole) {
    const user = this.requireUser();
    if (user.peran !== 'pemilik') {
      throw new Error('Hanya Pemilik yang dapat mengubah peran akun');
    }
    if (targetUserId === user.id) {
      throw new Error('Pemilik tidak dapat mengubah peran akunnya sendiri');
    }

    const targetUser = this.state.profiles.find(p => p.id === targetUserId);
    if (!targetUser) throw new Error('Pengguna tidak ditemukan');

    const oldRole = targetUser.peran;
    targetUser.peran = newRole;

    this.logAudit('user:ubah_peran', 'profiles', targetUser.email, { peran: oldRole }, { peran: newRole });
    this.persistState();
  }
}
