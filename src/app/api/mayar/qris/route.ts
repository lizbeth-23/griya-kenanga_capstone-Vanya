import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      tagihan_id, 
      invoice_number, 
      amount, 
      customer_name = 'Dimas Saputra', 
      customer_email = 'dimas@griyakenanga.test', 
      customer_mobile = '081234567890',
      unit_name = 'Unit A-104'
    } = body;

    if (!tagihan_id || !amount) {
      return NextResponse.json({ error: 'Data tagihan atau nominal tidak valid' }, { status: 400 });
    }

    const mayarApiKey = process.env.MAYAR_API_KEY;
    const mayarApiUrl = process.env.MAYAR_API_URL || 'https://api.mayar.io/hl/v2';
    const referenceMayar = `MYR-QR-${Date.now().toString().slice(-8)}`;

    let mayarInvoiceLink = `https://mayar.to/capstone-vanya`;
    let mayarInvoiceId = null;

    // Panggil API Mayar Resmi untuk mendaftarkan transaksi ke Dashboard Mayar
    if (mayarApiKey) {
      try {
        const mayarRes = await fetch(`${mayarApiUrl}/invoices/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mayarApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: customer_name,
            email: customer_email,
            mobile: customer_mobile,
            description: `Tagihan Sewa ${unit_name} (${invoice_number || 'INV-202610'})`,
            items: [
              {
                description: `Sewa ${unit_name}`,
                quantity: 1,
                rate: amount
              }
            ]
          })
        });

        if (mayarRes.ok) {
          const mayarJson = await mayarRes.json();
          if (mayarJson.data) {
            mayarInvoiceId = mayarJson.data.id;
            mayarInvoiceLink = mayarJson.data.link || mayarJson.data.paymentUrl || mayarInvoiceLink;
          }
        } else {
          console.warn('Mayar API non-ok status:', mayarRes.status, await mayarRes.text());
        }
      } catch (err) {
        console.warn('Gagal menghubungi API Mayar:', err);
      }
    }

    // Standar format string QRIS Nasional (EMVCo QR Payload untuk Merchant Griya Kenanga Residence)
    const emvcoPayload = [
      '000201',                               // Format Indicator
      '010212',                               // Point of Initiation Method: 12 (Dynamic QR)
      '26580011ID.MAYAR.WWW01189360091100223344550215ID102026889901', // Merchant Account Info (Mayar)
      '51440014ID.LINKAJA.WWW0118936009110022334455',                // Domestic Central Repository
      '52047011',                             // Merchant Category Code: Lodging & Boarding
      '5303360',                              // Transaction Currency: 360 (IDR)
      `54${String(amount).length.toString().padStart(2, '0')}${amount}`, // Transaction Amount
      '5802ID',                               // Country Code: ID
      '5923Griya Kenanga Residence',          // Merchant Name: Griya Kenanga Residence
      '6006Sleman',                           // Merchant City: Sleman
      '610555281',                            // Postal Code
      `62320115${referenceMayar}0709KENANGA01`,// Additional Data: Ref Mayar & Tagihan
      '63046B2A'                              // CRC Checksum
    ].join('');

    // Generate base64 Data URL untuk QR Image
    const qrDataUrl = await QRCode.toDataURL(emvcoPayload, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#162315',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        reference_mayar: referenceMayar,
        tagihan_id,
        invoice_number: invoice_number || 'INV-202610-004',
        amount,
        merchant_name: 'Griya Kenanga Residence (capstone-vanya)',
        nmid: 'ID102026889901',
        payment_method: 'QRIS Dinamis (Mayar Sandbox)',
        qr_string: emvcoPayload,
        qr_image_url: qrDataUrl,
        mayar_invoice_id: mayarInvoiceId,
        mayar_invoice_link: mayarInvoiceLink,
        expired_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        mode: 'sandbox_test',
        gateway: 'Mayar.id API V2'
      }
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
