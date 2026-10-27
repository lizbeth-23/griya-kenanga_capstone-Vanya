'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { 
  QrCode, X, Clock, CheckCircle2, ShieldCheck, ArrowRight, 
  Sparkles, RefreshCw, Printer, AlertCircle, Copy, Check, ExternalLink
} from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatRupiah, formatDateIndo } from '@/lib/formatters';
import { REFERENCE_DATE } from '@/lib/store';
import { useGriyaStore } from '@/lib/use-store';

interface MayarQrisModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

interface QrisResponseData {
  reference_mayar: string;
  tagihan_id: string;
  invoice_number: string;
  amount: number;
  merchant_name: string;
  nmid: string;
  payment_method: string;
  qr_image_url: string;
  expired_at: string;
  mode: string;
  gateway: string;
  mayar_invoice_link?: string;
}

export default function MayarQrisModal({
  isOpen,
  invoice,
  onClose,
  onSuccess
}: MayarQrisModalProps) {
  const { store } = useGriyaStore();

  const [step, setStep] = useState<'review' | 'qris' | 'success'>('review');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [loadingQr, setLoadingQr] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [qrisData, setQrisData] = useState<QrisResponseData | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15 menit
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Hitung sisa kewajiban
  const denda = invoice ? invoice.denda : 0;
  const totalKewajiban = invoice ? (invoice.nominal_sewa + denda) : 0;
  const sisaKewajiban = invoice ? (totalKewajiban - invoice.terbayar) : 0;

  useEffect(() => {
    if (isOpen && invoice) {
      setStep('review');
      setPayAmount(sisaKewajiban);
      setQrisData(null);
      setErrorMsg('');
      setSecondsRemaining(900);
      setSimulating(false);
    }
  }, [isOpen, invoice, sisaKewajiban]);

  // Timer hitung mundur 15 menit saat di step QRIS
  useEffect(() => {
    if (step !== 'qris' || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, secondsRemaining]);

  if (!isOpen || !invoice) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Request pembuatan QRIS dari API Mayar
  const handleGenerateQris = async () => {
    if (payAmount < 100000 && payAmount !== sisaKewajiban) {
      setErrorMsg('Minimal pembayaran adalah Rp100.000 kecuali jika melunasi sisa tagihan.');
      return;
    }
    if (payAmount > sisaKewajiban) {
      setErrorMsg(`Jumlah bayar tidak boleh melebihi sisa tagihan (${formatRupiah(sisaKewajiban)}).`);
      return;
    }

    setLoadingQr(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/mayar/qris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagihan_id: invoice.id,
          invoice_number: invoice.nomor,
          amount: payAmount,
          customer_name: 'Penyewa Unit',
          customer_email: 'penyewa@griyakenanga.test',
          unit_name: 'Unit Hunian'
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menghasilkan QRIS');
      }

      setQrisData(json.data);
      setStep('qris');
      setSecondsRemaining(900);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi gangguan jaringan');
    } finally {
      setLoadingQr(false);
    }
  };

  // Simulasi Pembayaran Berhasil (Uji Coba Sandbox)
  const handleSimulatePayment = () => {
    if (!qrisData) return;
    setSimulating(true);

    // Simulasi delay gateway memverifikasi pembayaran (1.5 detik)
    setTimeout(() => {
      try {
        const payment = store.recordPayment({
          tagihan_id: invoice.id,
          jumlah: payAmount,
          metode: 'mayar',
          tanggal_bayar: REFERENCE_DATE,
          referensi_mayar: qrisData.reference_mayar
        });

        setSimulating(false);
        setStep('success');

        // Confetti effect
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        onSuccess(payment.id);
      } catch (err: unknown) {
        setSimulating(false);
        setErrorMsg(err instanceof Error ? err.message : 'Gagal mencatat pembayaran');
      }
    }, 1500);
  };

  const copyRefToClipboard = () => {
    if (qrisData?.reference_mayar) {
      navigator.clipboard.writeText(qrisData.reference_mayar);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171D16]/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[28px] border border-[#DCE5D8] bg-white p-5 sm:p-7 shadow-2xl dark:border-[#2C382A] dark:bg-[#1E261D] max-h-[92vh] flex flex-col overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[#5D6B58] hover:bg-[#E8EFE5] dark:text-[#A7B8A3] dark:hover:bg-[#2A3728] transition-colors"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* ============================================================== */}
        {/* STEP 1: REVIEW TAGIHAN & PILIH NOMINAL                          */}
        {/* ============================================================== */}
        {step === 'review' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EFE5] px-3 py-1 text-[11px] font-bold text-[#2D4129] border border-[#95B08A]/40 mb-2">
                <QrCode className="h-3.5 w-3.5 text-[#3B5336]" />
                Mayar.id · QRIS Otomatis
              </div>
              <h3 className="text-xl font-extrabold text-[#222520] dark:text-[#ECEAE4]">
                Konfirmasi Pembayaran Tagihan
              </h3>
              <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] mt-0.5">
                Tagihan No: <span className="font-mono font-bold text-[#3B5336] dark:text-[#95B08A]">{invoice.nomor}</span>
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-2xl bg-[#FDF0EE] border border-[#F3C5BF] p-3 text-xs text-[#A63A2E] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Rincian Tagihan */}
            <div className="rounded-2xl border border-[#E8EFE5] bg-[#F7F9F5] p-4 text-xs space-y-2.5 dark:border-[#2C382A] dark:bg-[#182317]">
              <div className="flex justify-between items-center text-[#5D6B58] dark:text-[#A7B8A3]">
                <span>Sewa Pokok</span>
                <span className="font-bold text-[#222520] dark:text-[#ECEAE4]">{formatRupiah(invoice.nominal_sewa)}</span>
              </div>
              {invoice.denda > 0 && (
                <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                  <span>Denda Keterlambatan</span>
                  <span className="font-bold">+{formatRupiah(invoice.denda)}</span>
                </div>
              )}
              {invoice.terbayar > 0 && (
                <div className="flex justify-between items-center text-[#3B5336] dark:text-[#95B08A]">
                  <span>Sudah Terbayar Sebelumnya</span>
                  <span className="font-bold">-{formatRupiah(invoice.terbayar)}</span>
                </div>
              )}
              <div className="border-t border-[#E8EFE5] dark:border-[#2C382A] pt-2.5 flex justify-between items-center font-bold text-sm">
                <span className="text-[#222520] dark:text-[#ECEAE4]">Sisa Total Kewajiban</span>
                <span className="text-[#3B5336] dark:text-[#95B08A] text-base">{formatRupiah(sisaKewajiban)}</span>
              </div>
            </div>

            {/* Input Nominal Pembayaran */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#4F604A] dark:text-[#A7B8A3]">
                Jumlah yang Ingin Dibayarkan (Rupiah)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5D6B58]">
                  Rp
                </span>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full rounded-2xl bg-[#E8EFE5]/70 py-3 pl-11 pr-4 text-sm font-bold text-[#222520] border border-transparent focus:border-[#3B5336] focus:bg-white focus:outline-none dark:bg-[#161F15] dark:text-white"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPayAmount(sisaKewajiban)}
                  className="rounded-full bg-[#E8EFE5] px-3 py-1 text-[11px] font-bold text-[#3B5336] hover:bg-[#D5E4D1] transition-colors dark:bg-[#253322] dark:text-[#A7B8A3]"
                >
                  Bayar Lunas ({formatRupiah(sisaKewajiban)})
                </button>
              </div>
            </div>

            {/* Benefit QRIS */}
            <div className="rounded-2xl border border-[#DCE5D8] bg-white p-3 text-xs flex items-center gap-3 dark:border-[#2C382A] dark:bg-[#1E261D]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 font-extrabold text-[11px] border border-red-100">
                QRIS
              </div>
              <div>
                <div className="font-bold text-[#222520] dark:text-[#ECEAE4]">Metode QRIS Mayar (Uji Coba Sandbox)</div>
                <div className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
                  Mendukung GoPay, OVO, ShopeePay, Dana, BCA, Mandiri, BRI, BNI.
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateQris}
              disabled={loadingQr}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#3B5336] py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#2D4129] active:scale-95 transition-all disabled:opacity-50"
            >
              {loadingQr ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Membuat Kode QRIS Mayar...</span>
                </>
              ) : (
                <>
                  <span>Lanjut ke Pembayaran QRIS</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: TAMPILAN KODE QRIS STANDAR NASIONAL (MAYAR SANDBOX)     */}
        {/* ============================================================== */}
        {step === 'qris' && qrisData && (
          <div className="space-y-4 animate-in fade-in duration-200 text-center">
            
            {/* Header Brand QRIS */}
            <div className="border-b border-[#E8EFE5] pb-3 dark:border-[#2C382A]">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="font-black text-lg tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                  QRIS
                </span>
                <span className="text-xs font-bold text-[#5D6B58] dark:text-[#A7B8A3]">
                  PEMBAYARAN DIGITAL
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#222520] dark:text-[#ECEAE4]">
                {qrisData.merchant_name}
              </h4>
              <p className="text-[11px] text-[#5D6B58] dark:text-[#A7B8A3] font-mono">
                NMID: {qrisData.nmid}
              </p>
            </div>

            {/* Total Pembayaran & Timer */}
            <div className="flex items-center justify-between bg-[#F7F9F5] rounded-2xl px-4 py-2.5 border border-[#E8EFE5] text-xs dark:bg-[#182317] dark:border-[#2C382A]">
              <div className="text-left">
                <span className="block text-[10px] text-[#5D6B58] dark:text-[#A7B8A3]">Total Pembayaran</span>
                <span className="text-base font-extrabold text-[#3B5336] dark:text-[#95B08A]">
                  {formatRupiah(qrisData.amount)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-1 text-amber-700 border border-amber-200 font-bold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                <span className="font-mono text-xs">{formattedTimer}</span>
              </div>
            </div>

            {/* Container Gambar QR */}
            <div className="relative mx-auto my-2 w-64 h-64 rounded-2xl border-2 border-[#3B5336] p-2 bg-white shadow-md flex items-center justify-center">
              {qrisData.qr_image_url ? (
                <img
                  src={qrisData.qr_image_url}
                  alt="Kode QRIS Mayar"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="h-48 w-48 bg-stone-100 flex items-center justify-center text-xs text-stone-400">
                  Memuat QR...
                </div>
              )}
            </div>

            {/* Info Referensi Transaksi */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#5D6B58] dark:text-[#A7B8A3]">
              <span>Ref Mayar: <code className="font-mono font-bold text-[#222520] dark:text-[#ECEAE4]">{qrisData.reference_mayar}</code></span>
              <button
                onClick={copyRefToClipboard}
                className="p-1 hover:text-[#3B5336] transition-colors"
                title="Salin referensi"
              >
                {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Panduan Pindai */}
            <div className="rounded-2xl border border-[#E8EFE5] bg-[#F7F9F5] p-3 text-left text-[11px] text-[#5D6B58] space-y-1 dark:border-[#2C382A] dark:bg-[#182317] dark:text-[#A7B8A3]">
              <div className="font-bold text-[#222520] dark:text-[#ECEAE4] flex items-center gap-1 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#3B5336]" />
                Cara Pembayaran:
              </div>
              <p>1. Buka m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, Dana, ShopeePay).</p>
              <p>2. Pilih menu <strong>Scan / Bayar QRIS</strong> dan arahkan kamera ke kode di atas.</p>
              <p>3. Konfirmasi pembayaran atas nama <strong>Griya Kenanga Residence</strong>.</p>
            </div>

            {/* FITUR SIMULASI SUKSES (UJI COBA SANDBOX CAPSTONE) */}
            <div className="pt-2 border-t border-[#E8EFE5] dark:border-[#2C382A] space-y-2.5">
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-800 dark:text-amber-300 text-left">
                <strong>Mode Uji Coba (Sandbox):</strong> Pindai QR di atas atau gunakan opsi berikut untuk menyelesaikan simulasi:
              </div>

              {qrisData.mayar_invoice_link && (
                <a
                  href={qrisData.mayar_invoice_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-[#3B5336] bg-[#F7F9F5] py-2.5 text-xs font-bold text-[#3B5336] hover:bg-[#E8EFE5] dark:bg-[#182317] dark:border-[#95B08A] dark:text-[#95B08A] transition-all shadow-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Buka Checkout Resmi Mayar (capstone-vanya.myr.lat)</span>
                </a>
              )}

              <button
                onClick={handleSimulatePayment}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi Pembayaran ke Gateway Mayar...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>⚡ Simulasikan Pembayaran Berhasil (Tes Sandbox)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('review')}
                className="text-xs text-[#5D6B58] hover:text-[#222520] underline transition-colors"
              >
                &larr; Ubah Nominal / Kembali
              </button>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: STRUK BUKTI PEMBAYARAN SAH                              */}
        {/* ============================================================== */}
        {step === 'success' && qrisData && (
          <div className="space-y-5 animate-in zoom-in-95 duration-200 text-center py-2">
            
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 shadow-md">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                Pembayaran Sah &amp; Berhasil
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#222520] dark:text-[#ECEAE4]">
                Terima Kasih!
              </h3>
              <p className="text-xs text-[#5D6B58] dark:text-[#A7B8A3] mt-1 max-w-sm mx-auto">
                Pembayaran Anda melalui <strong>QRIS Mayar</strong> telah berhasil diproses dan status tagihan telah diperbarui otomatis menjadi <strong>LUNAS</strong>.
              </p>
            </div>

            {/* Struk Rincian */}
            <div className="rounded-2xl border border-[#DCE5D8] bg-[#F7F9F5] p-4 text-xs space-y-2 text-left font-mono dark:border-[#2C382A] dark:bg-[#182317]">
              <div className="flex justify-between border-b border-[#E8EFE5] pb-2 dark:border-[#2C382A]">
                <span className="text-[#5D6B58]">ID Transaksi Mayar</span>
                <span className="font-bold text-[#222520] dark:text-[#ECEAE4]">{qrisData.reference_mayar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D6B58]">Nomor Tagihan</span>
                <span className="font-bold text-[#222520] dark:text-[#ECEAE4]">{invoice.nomor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D6B58]">Waktu Transaksi</span>
                <span className="text-[#222520] dark:text-[#ECEAE4]">{new Date().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D6B58]">Metode</span>
                <span className="text-emerald-700 font-bold dark:text-emerald-400">QRIS Dinamis</span>
              </div>
              <div className="flex justify-between border-t border-[#E8EFE5] pt-2 font-bold text-sm dark:border-[#2C382A]">
                <span>Total Dibayar</span>
                <span className="text-[#3B5336] dark:text-[#95B08A]">{formatRupiah(payAmount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-[#DCE5D8] bg-white py-2.5 text-xs font-bold text-[#3B5336] hover:bg-[#E8EFE5] transition-all dark:border-[#2C382A] dark:bg-[#1E261D] dark:text-[#95B08A]"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak / Simpan Struk</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-full bg-[#3B5336] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#2D4129] active:scale-95 transition-all"
              >
                Selesai (Kembali)
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
