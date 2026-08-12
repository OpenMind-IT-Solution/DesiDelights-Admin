'use client'

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import { Printer, Receipt } from 'mdi-material-ui'

import CustomTextField from '@/@core/components/mui/TextField'
import { RequiredLabel } from '@/components/RequierdLabel'

export interface ReceiptItem {
  name: string
  quantity: number
  total: number
  vatRate?: number
  addons?: { name: string; price: number }[]
}

export interface ReceiptRestaurant {
  name?: string
  tagline?: string
  address?: string
  city?: string
  phoneNumber?: string
  website?: string
  vatNumber?: string
  posId?: string
  rel?: string
  terminal?: string
  pluHash?: string
  ticketTeller?: string
  ticketSignature?: string
  controlModuleId?: string
  vatCardId?: string
}

export interface ReceiptDialogHandle {
  captureReceiptImage: () => Promise<string | null>
}

interface ReceiptDialogProps {
  open: boolean
  onClose: () => void
  orderNumber: number | string | null
  items: ReceiptItem[]
  subtotal: number
  vatByRate?: Record<string, number>
  vatTotal?: number
  total: number
  grandTotal?: number
  discountAmount?: number
  discountType?: string
  discountValue?: number
  readOnly?: boolean
  showPlaceOrder?: boolean
  isPlacing?: boolean
  onPlaceOrder?: () => void
  onBeforePrint?: () => Promise<number | string | null | undefined | void>
  paymentMethod?: string
  onPaymentMethodChange?: (value: string) => void
  orderType?: string
  onOrderTypeChange?: (value: string) => void
  tableNumber?: string | number
  cashierName?: string
  cashReceived?: number | null
  onCashReceivedChange?: (value: number | null) => void
  transactionId?: string
  receiptNumber?: number | string
  terminalId?: number | string
  customerName?: string
  onCustomerNameChange?: (value: string) => void
  customerPhone?: string
  onCustomerPhoneChange?: (value: string) => void
  customerNotes?: string
  onCustomerNotesChange?: (value: string) => void
  restaurant?: ReceiptRestaurant
  createdAt?: string | Date | null
}

type ReceiptTheme = 'screen' | 'print'

interface ReceiptRenderOptions {
  restaurant: ReceiptRestaurant
  orderNumber: number | string | null
  createdAt?: string | Date | null
  items: ReceiptItem[]
  subtotal: number
  vatByRate?: Record<string, number>
  vatTotal?: number
  total: number
  grandTotal?: number
  discountAmount?: number
  discountType?: string
  discountValue?: number
  paymentMethod?: string
  customerName?: string
  customerPhone?: string
  customerNotes?: string
  orderType?: string
  tableNumber?: string | number
  cashierName?: string
  cashReceived?: number | null
  transactionId?: string
  receiptNumber?: number | string
  terminalId?: number | string
}

const THEMES: Record<ReceiptTheme, { width: string; fontSize: number; small: number; qtyW: number; priceW: number; labelW: number; sep: number; star: number }> = {
  screen: { width: '320px', fontSize: 12, small: 10, qtyW: 26, priceW: 70, labelW: 96, sep: 6, star: 44 },
  print: { width: '72mm', fontSize: 11, small: 9, qtyW: 24, priceW: 62, labelW: 92, sep: 5, star: 40 }
}

// Fallbacks so the receipt always shows the store details + Belgian fiscal footer,
// even when the live database hasn't been seeded with these values.
const DEFAULT_RESTAURANT = {
  address: 'Rue de Genève 470D, 1030 Schaerbeek, Belgium',
  phoneNumber: '+32 456 86 34 96',
  posId: 'AQU00045903482',
  rel: 'QT240115BE',
  terminal: '1 - 70:4A:0E:E1:5B:14',
  pluHash: '8934247F',
  ticketTeller: '90411/90838 NS',
  ticketSignature: '5B16097DB3EED508244627831C7A909AAE4F2E99',
  controlModuleId: 'BMC05056482',
  vatCardId: '0889732894-001'
}

const esc = (value: unknown) =>
  String(value ?? '').replace(/[&<>"']/g, char => {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

    return map[char] ?? char
  })

// Two-decimal euro format (decimal point), always with the euro sign
const money = (value: number) => `€${value.toFixed(2)}`

const cap = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value)

const orderTypeLabel = (value?: string) => {
  if (!value) return ''
  const map: Record<string, string> = { 'dine-in': 'Dine-In', takeaway: 'Takeaway', delivery: 'Delivery', online: 'Online', pos: 'POS' }

  return map[value.toLowerCase()] || cap(value)
}

const buildReceiptHtml = (opts: ReceiptRenderOptions, theme: ReceiptTheme): string => {
  const T = THEMES[theme]

  const {
    restaurant,
    orderNumber,
    createdAt,
    items,
    subtotal,
    vatByRate,
    vatTotal,
    total,
    grandTotal,
    discountAmount,
    discountType,
    discountValue,
    paymentMethod,
    customerName,
    customerPhone,
    customerNotes,
    orderType,
    cashReceived,
    transactionId,
    receiptNumber,
    terminalId
  } = opts

  const payable = grandTotal ?? Math.max(0, total - (discountAmount ?? 0))
  const change = cashReceived != null ? Math.max(0, cashReceived - payable) : null
  const dateObj = createdAt ? new Date(createdAt) : new Date()

  // Merge restaurant data over the defaults, but only non-empty values win —
  // empty strings from an unseeded live DB must not hide the fallback details
  const source: Record<string, string | undefined> = {
    ...DEFAULT_RESTAURANT,
    ...Object.fromEntries(Object.entries(restaurant ?? {}).filter(([, v]) => v != null && String(v).trim() !== ''))
  }

  const restaurantName = esc((source.name ?? '').trim() || 'Desi Delights')
  const tagline = esc((source.tagline ?? '').trim() || 'Quick Bites, Happy Vibes')
  const phone = (source.phoneNumber ?? '').trim()
  const website = (source.website ?? '').trim()
  const vatNumber = (source.vatNumber ?? '').trim()

  // Split the address into street + city/postal lines like the reference receipt
  const rawAddress = (source.address ?? '').trim()
  let street = rawAddress
  let city = (source.city ?? '').trim()
  const lastComma = rawAddress.lastIndexOf(',')

  if (lastComma > 0) {
    street = rawAddress.slice(0, lastComma).trim()
    city = rawAddress.slice(lastComma + 1).trim()
  }

  // Belgian (Europe/Brussels) local time — matches the fiscal clock and the reference receipt
  const brussels = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Brussels',
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(dateObj)

  const bGet = (type: string) => brussels.find(part => part.type === type)?.value ?? ''
  const dateLine = `${bGet('weekday')} ${bGet('day')}-${bGet('month').replace(/^0/, '')}-${bGet('year')} ${bGet('hour')}:${bGet('minute')}:${bGet('second')}`

  const center = (content: string, size?: number) =>
    `<div style="text-align:center;${size ? `font-size:${size}px;` : ''}">${content}</div>`

  const starSep = () => `<div style="text-align:center;">${'*'.repeat(T.star)}</div>`

  const dashSep = () => `<div style="text-align:center;">${'-'.repeat(T.star)}</div>`

  const kv = (label: string, value: string) =>
    `<div style="display:flex;"><span style="width:${T.labelW}px;flex:none;">${label}</span><span style="flex:1;word-wrap:break-word;">${value}</span></div>`

  const totalRow = (label: string, value: string, bold = false) =>
    `<div style="display:flex;justify-content:space-between;${bold ? 'font-weight:bold;' : ''}"><span>${label}</span><span style="white-space:nowrap;">${value}</span></div>`

  const subRow = (label: string, value: string) =>
    `<div style="display:flex;justify-content:space-between;padding-left:${T.labelW}px;"><span>${label}</span><span style="white-space:nowrap;">${value}</span></div>`

  // 1. Restaurant header
  const header = [
    `<div style="text-align:center;font-weight:bold;font-size:${T.fontSize + 5}px;letter-spacing:1px;">${restaurantName}</div>`,
    center(tagline, T.small),
    ...(street ? [center(esc(street), T.small)] : []),
    ...(city ? [center(esc(city), T.small)] : []),
    ...(vatNumber ? [center(`BTW/VAT: ${esc(vatNumber)}`, T.small)] : []),
    ...(phone ? [center(`Tel: ${esc(phone)}`, T.small)] : []),
    ...(website ? [center(esc(website), T.small)] : [])
  ].join('')

  // 2. Order items (reference style: no column header, price with VAT-category suffix)
  const itemRows = items
    .map(item => {
      const row = `<div style="display:flex;padding:1px 0;">
        <span style="width:${T.qtyW}px;flex:none;">${item.quantity}</span>
        <span style="flex:1;padding-right:${T.small}px;word-wrap:break-word;">${esc(item.name)}</span>
        <span style="width:${T.priceW}px;flex:none;text-align:right;white-space:nowrap;">${money(item.total)} B</span>
      </div>`

      const addonLines = (item.addons ?? [])
        .map(
          addon => `<div style="display:flex;padding:0 0 1px ${T.qtyW}px;">
            <span style="flex:1;padding-right:${T.small}px;word-wrap:break-word;">+ ${esc(addon.name)}</span>
            <span style="width:${T.priceW}px;flex:none;text-align:right;white-space:nowrap;">${money(addon.price)}</span>
          </div>`
        )
        .join('')

      return row + addonLines
    })
    .join('')

  // 3. Totals (reference: "N Totaal" + "Belastbaar B-Middel" + rate lines)
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  const vatRateRows =
    vatByRate && Object.keys(vatByRate).length > 0
      ? Object.entries(vatByRate)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([rate, vat]) => subRow(`${rate}% B-Middel`, money(vat)))
          .join('')
      : (vatTotal ?? 0) > 0
        ? subRow('Btw', money(vatTotal ?? 0))
        : ''

  const discountLabel =
    discountType === 'percentage' && discountValue != null ? `Korting ${discountValue}%` : 'Korting'

  const totals = [
    totalRow(`${totalQty} Total`, money(payable), true),
    ...(subtotal > 0 ? [subRow('Belastbaar B-Middel', money(subtotal))] : []),
    vatRateRows,
    ...((discountAmount ?? 0) > 0 ? [subRow(discountLabel, `-${money(discountAmount ?? 0)}`)] : [])
  ].join('')

  // 4. Payment
  const payment = [
    totalRow(esc((paymentMethod || 'cash').toUpperCase()), money(payable)),
    ...(cashReceived != null ? [totalRow('Amount Paid', money(cashReceived))] : []),
    ...(change != null ? [totalRow('Change', money(change))] : []),
    ...(paymentMethod === 'card' && transactionId ? [totalRow('Transaction ID', esc(transactionId))] : [])
  ].join('')

  // 5. Date / receipt number (reference: shown after payment)
  const bottomInfo = [
    center(dateLine),
    ...(orderNumber != null ? [center(`#${String(orderNumber).padStart(6, '0')}`)] : []),
    ...(orderType ? [kv('Order Type:', orderTypeLabel(orderType))] : []),
    ...(customerName ? [kv('Customer:', esc(customerName))] : []),
    ...(customerPhone ? [kv('Phone:', esc(customerPhone))] : []),
    ...(customerNotes ? [kv('Notes:', esc(customerNotes))] : []),
    ...(receiptNumber != null && orderNumber == null ? [kv('Receipt No:', esc(receiptNumber))] : []),
    ...(terminalId != null ? [kv('Terminal:', esc(terminalId))] : [])
  ].join('')

  const sidePadding = theme === 'screen' ? '0 12px' : '0 4mm'

  return `<div style="width:${T.width};box-sizing:border-box;padding:${sidePadding};margin:0 auto;background:#fff;color:#000;font-family:'Courier New',Courier,monospace;font-size:${T.fontSize}px;line-height:1.4;word-wrap:break-word;overflow-wrap:anywhere;">
    ${header}
    ${starSep()}
    ${itemRows}
    ${dashSep()}
    ${totals}
    ${payment}
    ${bottomInfo}
  </div>`
}

// Prints the receipt as a raster image (matches the thermal-roll look)
const buildImagePrintDocument = (imageData: string, fileName: string): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Desi Delights - Receipt</title>
<style>
  @page { size: 80mm 297mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #f4f4f4; }
  .dd-page { display: flex; flex-direction: column; align-items: center; }
  .dd-receipt-image { width: 80mm; max-width: 96vw; height: auto; display: block; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
  .dd-print-actions { display: flex; justify-content: center; gap: 10px; padding: 18px 0 28px; }
  .dd-print-actions button { padding: 10px 28px; border-radius: 6px; border: 1px solid #ccc; background: #fff; font-size: 14px; font-family: system-ui, -apple-system, sans-serif; cursor: pointer; }
  .dd-print-actions .primary { background: #1976d2; color: #fff; border-color: #1976d2; }
  @media print {
    body { background: #fff; }
    .dd-print-actions { display: none !important; }
    .dd-receipt-image { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="dd-page">
    <img id="dd-receipt-image" class="dd-receipt-image" src="${imageData}" />
    <div class="dd-print-actions">
      <button class="primary" type="button" onclick="window.print()">Print</button>
      <button type="button" onclick="ddDownload()">Download</button>
      <button type="button" onclick="window.close()">Close</button>
    </div>
  </div>
  <script>
    function ddDownload() {
      var img = document.getElementById('dd-receipt-image')
      if (!img) return
      var a = document.createElement('a')
      a.href = img.src
      a.download = '${fileName}'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    // Fit the page height to the receipt image so Print produces one page
    window.addEventListener('load', function () {
      var img = document.getElementById('dd-receipt-image')
      if (!img || !img.naturalWidth) return
      var heightMm = Math.ceil((img.naturalHeight / img.naturalWidth) * 80 + 1)
      var style = document.createElement('style')
      style.innerHTML = '@page { size: 80mm ' + heightMm + 'mm; margin: 0; }'
      document.head.appendChild(style)
    })
  </script>
</body>
</html>`

// Fallback when image capture fails: print the receipt as styled HTML
const buildPrintDocument = (receiptHtml: string): string => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Desi Delights - Receipt</title>
<style>
  @page { size: 80mm 297mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #f4f4f4; }
  .dd-page { display: flex; flex-direction: column; align-items: center; }
  .dd-receipt { background: #fff; width: 80mm; max-width: 96vw; padding: 2mm 4mm; }
  .dd-print-actions { display: flex; justify-content: center; gap: 10px; padding: 18px 0 28px; }
  .dd-print-actions button { padding: 10px 28px; border-radius: 6px; border: 1px solid #ccc; background: #fff; font-size: 14px; font-family: system-ui, -apple-system, sans-serif; cursor: pointer; }
  .dd-print-actions .primary { background: #1976d2; color: #fff; border-color: #1976d2; }
  @media print {
    body { background: #fff; }
    .dd-print-actions { display: none !important; }
  }
</style>
</head>
<body>
  <div class="dd-page">
    <div id="dd-receipt" class="dd-receipt">${receiptHtml}</div>
    <div class="dd-print-actions">
      <button class="primary" type="button" onclick="window.print()">Print</button>
      <button type="button" onclick="window.close()">Close</button>
    </div>
  </div>
  <script>
    // Fit the page height to the receipt so Print produces one page
    window.addEventListener('load', function () {
      var el = document.getElementById('dd-receipt')
      if (!el) return
      var heightMm = Math.ceil((el.getBoundingClientRect().height / 96) * 25.4 + 1)
      var style = document.createElement('style')
      style.innerHTML = '@page { size: 80mm ' + heightMm + 'mm; margin: 0; }'
      document.head.appendChild(style)
    })
  </script>
</body>
</html>`

// Shown instantly in the new tab while the order is created and the receipt image is generated
const ReceiptDialog = forwardRef<ReceiptDialogHandle, ReceiptDialogProps>(
  (
    {
      open,
      onClose,
      orderNumber,
      items,
      subtotal,
      vatByRate,
      vatTotal,
      total,
      grandTotal,
      discountAmount,
      discountType,
      discountValue,
      readOnly = false,
      showPlaceOrder = false,
      isPlacing = false,
      onPlaceOrder,
      onBeforePrint,
      paymentMethod = 'cash',
      onPaymentMethodChange,
      orderType,
      onOrderTypeChange,
      tableNumber,
      cashierName,
      cashReceived,
      onCashReceivedChange,
      transactionId,
      receiptNumber,
      terminalId,
      customerName = '',
      onCustomerNameChange,
      customerPhone = '',
      onCustomerPhoneChange,
      customerNotes = '',
      onCustomerNotesChange,
      restaurant = {},
      createdAt
    },
    ref
  ) => {
    const receiptPreviewRef = useRef<HTMLDivElement>(null)
    const receiptCaptureRef = useRef<HTMLDivElement>(null)
    const [printing, setPrinting] = useState(false)
    const [fallbackReceipt, setFallbackReceipt] = useState<string | null>(null)

    // Preload html2canvas while the user is looking at the preview so first print is instant
    useEffect(() => {
      import('html2canvas').catch(() => {
        // ignored
      })
    }, [])

    const payable = grandTotal ?? Math.max(0, total - (discountAmount ?? 0))
    const change = cashReceived != null ? Math.max(0, cashReceived - payable) : null

    const renderOptions = useMemo<ReceiptRenderOptions>(
      () => ({
        restaurant,
        orderNumber,
        createdAt,
        items,
        subtotal,
        vatByRate,
        vatTotal,
        total,
        grandTotal,
        discountAmount,
        discountType,
        discountValue,
        paymentMethod,
        customerName,
        customerPhone,
        customerNotes,
        orderType,
        tableNumber,
        cashierName,
        cashReceived,
        transactionId,
        receiptNumber,
        terminalId
      }),
      [
        restaurant,
        orderNumber,
        createdAt,
        items,
        subtotal,
        vatByRate,
        vatTotal,
        total,
        grandTotal,
        discountAmount,
        discountType,
        discountValue,
        paymentMethod,
        customerName,
        customerPhone,
        customerNotes,
        orderType,
        tableNumber,
        cashierName,
        cashReceived,
        transactionId,
        receiptNumber,
        terminalId
      ]
    )

    const receiptHtml = useMemo(() => buildReceiptHtml(renderOptions, 'screen'), [renderOptions])

    const captureReceiptImage = async (): Promise<string | null> => {
      // Use the hidden full-height template so tall receipts are never clipped by the
      // dialog's scrollable viewport (which used to cut off the address and footer);
      // fall back to the visible preview if the template isn't mounted.
      const el = receiptCaptureRef.current ?? receiptPreviewRef.current

      if (!el) return null

      let origLeft: string | null = null
      let origShadow: string | null = null

      try {
        // Let the layout settle (short timer — also works if this tab is ever backgrounded)
        await new Promise(r => setTimeout(r, 50))

        if (receiptCaptureRef.current) {
          origLeft = el.style.left
          el.style.left = '0'
          await new Promise(r => setTimeout(r, 30))
        } else {
          origShadow = el.style.boxShadow
          el.style.boxShadow = 'none'
          await new Promise(r => setTimeout(r, 30))
        }

        const mod = await import('html2canvas')
        const html2canvas: any = (mod as any).default ?? mod

        // Explicit window/canvas dimensions ensure the FULL receipt is rendered,
        // not just the part visible inside the dialog
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          scrollY: 0,
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
          width: el.scrollWidth,
          height: el.scrollHeight
        })

        return canvas.toDataURL('image/png')
      } catch (error) {
        console.error('Receipt image capture failed:', error)

        return null
      } finally {
        if (origLeft !== null && el.style) el.style.left = origLeft
        if (origShadow !== null && el.style) el.style.boxShadow = origShadow
      }
    }

    useImperativeHandle(ref, () => ({
      captureReceiptImage
    }))

    const handlePrint = async () => {
      setPrinting(true)
      setFallbackReceipt(null)

      try {
        let resolvedOrderNumber = orderNumber

        if (onBeforePrint) {
          const returned = await onBeforePrint()

          if (returned != null) resolvedOrderNumber = returned
        }

        // Capture the rendered receipt as an image (same look as the preview/thermal roll).
        // This runs BEFORE opening the tab so this page stays foregrounded the whole time —
        // a background tab would freeze the capture and make the receipt "buffer".
        const imageData = await captureReceiptImage()

        const documentHtml = imageData
          ? buildImagePrintDocument(imageData, `receipt-${resolvedOrderNumber ?? Date.now()}.png`)
          : buildPrintDocument(buildReceiptHtml({ ...renderOptions, orderNumber: resolvedOrderNumber }, 'print'))

        // Open the tab only once the receipt is ready — it appears fully rendered, never buffering
        const printWindow = window.open('', '_blank')

        if (printWindow) {
          printWindow.document.open()
          printWindow.document.write(documentHtml)
          printWindow.document.close()

          try {
            printWindow.focus()
          } catch {
            // ignored
          }
        } else {
          // Popup blocked: show the same print document in an in-page iframe instead
          setFallbackReceipt(documentHtml)
        }
      } finally {
        setPrinting(false)
        onClose()
      }
    }

    const handleOrderTypeChange = (value: string) => {
      onOrderTypeChange?.(value)
    }

    const handleCashReceivedChange = (value: string) => {
      onCashReceivedChange?.(value === '' ? null : Number(value))
    }

    return (
      <>
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', pb: 3 }}>
            <Receipt sx={{ mr: 1 }} />
            {orderNumber ? `Order Receipt #${orderNumber}` : 'Receipt'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Date:{' '}
                <span suppressHydrationWarning>
                  {(() => {
                    const d = createdAt ? new Date(createdAt) : new Date()

                    return (
                      d.toLocaleDateString('en-GB', { timeZone: 'Europe/Brussels' }) +
                      ' ' +
                      d.toLocaleTimeString('en-GB', { timeZone: 'Europe/Brussels', hour: '2-digit', minute: '2-digit' })
                    )
                  })()}
                </span>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {readOnly ? (
                  <Typography variant='body2' color='text.secondary' sx={{ textTransform: 'capitalize' }}>
                    {paymentMethod}
                  </Typography>
                ) : (
                  <CustomTextField
                    select
                    fullWidth
                    name='paymentMethod'
                    label={<RequiredLabel label='Payment Method' isRequired={true} />}
                    value={paymentMethod}
                    onChange={e => onPaymentMethodChange?.(e.target.value)}
                  >
                    <MenuItem value='cash'>Cash</MenuItem>
                    <MenuItem value='card'>Card</MenuItem>
                  </CustomTextField>
                )}
              </Box>
            </Box>
            {!readOnly && (
              <>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant='subtitle2' gutterBottom color='text.secondary' sx={{ mb: 1 }}>
                  Order Details
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
                  <CustomTextField
                    select
                    size='small'
                    label='Order Type'
                    value={orderType || 'dine-in'}
                    onChange={e => handleOrderTypeChange(e.target.value)}
                    sx={{ minWidth: 160 }}
                  >
                    <MenuItem value='dine-in'>Dine-In</MenuItem>
                    <MenuItem value='takeaway'>Takeaway</MenuItem>
                    <MenuItem value='delivery'>Delivery</MenuItem>
                  </CustomTextField>
                  {/* <TextField
                    label='Table Number'
                    value={tableNumber ?? ''}
                    onChange={e => handleTableNumberChange(e.target.value)}
                    size='small'
                    sx={{ width: 130 }}
                  /> */}
                  {/* {cashierName && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        Cashier: {cashierName}
                      </Typography>
                    </Box>
                  )} */}
                </Box>
                {paymentMethod === 'cash' && (
                  <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', mb: 3 }}>
                    <TextField
                      type='number'
                      label='Cash Received'
                      value={cashReceived ?? ''}
                      onChange={e => handleCashReceivedChange(e.target.value)}
                      size='small'
                      sx={{ width: 160 }}
                    />
                    <Typography variant='body2' color='text.secondary'>
                      Change: €{(change ?? 0).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant='subtitle2' gutterBottom color='text.secondary' sx={{ mb: 1 }}>
                  Customer Details (Optional)
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                  <TextField
                    label='Customer Name'
                    value={customerName}
                    onChange={e => onCustomerNameChange?.(e.target.value)}
                    size='small'
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <TextField
                    label='Phone Number'
                    value={customerPhone}
                    onChange={e => onCustomerPhoneChange?.(e.target.value)}
                    size='small'
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                </Box>
                <TextField
                  label='Notes'
                  value={customerNotes}
                  onChange={e => onCustomerNotesChange?.(e.target.value)}
                  size='small'
                  fullWidth
                  sx={{ mb: 1 }}
                />
              </>
            )}
            {readOnly && customerName && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='caption' display='block'>
                  Customer: {customerName}
                </Typography>
                {customerPhone && (
                  <Typography variant='caption' display='block'>
                    Phone: {customerPhone}
                  </Typography>
                )}
                {customerNotes && (
                  <Typography variant='caption' display='block'>
                    Notes: {customerNotes}
                  </Typography>
                )}
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <div
                ref={receiptPreviewRef}
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
                dangerouslySetInnerHTML={{ __html: receiptHtml }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Close</Button>
            <Button variant='contained' onClick={handlePrint} startIcon={<Printer />} disabled={printing}>
              {printing ? 'Printing...' : 'Print Receipt'}
            </Button>
            {showPlaceOrder && (
              <Button variant='outlined' onClick={onPlaceOrder} disabled={isPlacing}>
                {isPlacing ? 'Placing...' : 'Place Order'}
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Hidden receipt template for image capture (kept for receipt image saved to the backend) */}
        <div
          ref={receiptCaptureRef}
          style={{ position: 'fixed', left: -9999, top: 0, background: '#fff', color: '#000', zIndex: -1 }}
          dangerouslySetInnerHTML={{ __html: receiptHtml }}
        />

        {/* Fallback when the browser blocks the print tab (rare): show the same document in-page */}
        {fallbackReceipt && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 2100,
              bgcolor: 'rgba(0, 0, 0, 0.55)',
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              gap: 2
            }}
          >
            <iframe title='Receipt' srcDoc={fallbackReceipt} style={{ flex: 1, width: '100%', border: 0, background: '#fff' }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant='contained'
                startIcon={<Printer />}
                onClick={() => {
                  const iframe = document.querySelector<HTMLIFrameElement>('iframe[title="Receipt"]')

                  iframe?.contentWindow?.print()
                }}
              >
                Print
              </Button>
              <Button variant='tonal' onClick={() => setFallbackReceipt(null)}>
                Close
              </Button>
            </Box>
          </Box>
        )}
      </>
    )
  }
)

ReceiptDialog.displayName = 'ReceiptDialog'

export default ReceiptDialog
