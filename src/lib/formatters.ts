export function formatRupiah(amount: number): string {
  if (amount === 0) return 'Rp 0';
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateTimeStr: string): string {
  if (!dateTimeStr) return '-';
  try {
    const d = new Date(dateTimeStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateTimeStr;
  }
}

export function maskNIK(nik: string): string {
  if (!nik) return 'Belum terisi';
  if (nik.length < 4) return nik;
  return '*'.repeat(nik.length - 4) + nik.slice(-4);
}
