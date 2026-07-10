'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

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
  discountAmount?: number
  readOnly?: boolean
  showPlaceOrder?: boolean
  isPlacing?: boolean
  onPlaceOrder?: () => void
  onBeforePrint?: () => Promise<void>
  paymentMethod?: string
  onPaymentMethodChange?: (value: string) => void
  customerName?: string
  onCustomerNameChange?: (value: string) => void
  customerPhone?: string
  onCustomerPhoneChange?: (value: string) => void
  customerNotes?: string
  onCustomerNotesChange?: (value: string) => void
}

const ReceiptDialog = forwardRef<ReceiptDialogHandle, ReceiptDialogProps>(({
  open,
  onClose,
  orderNumber,
  items,
  subtotal,
  vatByRate,
  vatTotal,
  total,
  discountAmount,
  readOnly = false,
  showPlaceOrder = false,
  isPlacing = false,
  onPlaceOrder,
  onBeforePrint,
  paymentMethod = 'cash',
  onPaymentMethodChange,
  customerName = '',
  onCustomerNameChange,
  customerPhone = '',
  onCustomerPhoneChange,
  customerNotes = '',
  onCustomerNotesChange
}, ref) => {
  const receiptCaptureRef = useRef<HTMLDivElement>(null)
  const [printing, setPrinting] = useState(false)

  const captureReceiptImage = async (): Promise<string | null> => {
    const el = receiptCaptureRef.current

    if (!el) return null

    let origLeft: string | null = null

    try {
      await new Promise(r => setTimeout(r, 500))

      const logoImg = new Image()

      logoImg.src = '/logo.png'

      if (!logoImg.complete)
        await new Promise(r => {
          logoImg.onload = r
          logoImg.onerror = r
        })

      origLeft = el.style.left
      el.style.left = '0'

      await new Promise(r => requestAnimationFrame(r))

      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      return canvas.toDataURL('image/png')
    } catch {
      return null
    } finally {
      if (origLeft !== null) el.style.left = origLeft
    }
  }

  useImperativeHandle(ref, () => ({
    captureReceiptImage
  }))

  const handlePrint = async () => {
    setPrinting(true)

    try {
      if (onBeforePrint) {
        await onBeforePrint()
      }

      const imgData = await captureReceiptImage()

      if (imgData) {
        const w = window.open('', '_blank')

        if (w) {
          w.document.write(`<!DOCTYPE html><html><head><style>
            @page { size: 80mm 297mm; margin: 0; }
            *{margin:0;padding:0;box-sizing:border-box}
            body{font-family:Arial,sans-serif;background:#f5f5f5}
            .receipt-wrapper{padding-top:30px;display:flex;flex-direction:column;align-items:center}
            .receipt-img{width:80mm;height:auto;display:block;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
            .actions{margin-top:20px;display:flex;gap:12px;padding-bottom:40px}
            .actions button,.actions a{padding:10px 24px;border:none;border-radius:6px;font-size:14px;cursor:pointer;text-decoration:none;font-weight:600}
            .btn-print{background:#1976d2;color:#fff}
            .btn-download{background:#fff;color:#1976d2;border:2px solid #1976d2}
            @media print{.actions{display:none!important}}
          </style></head><body>
          <div class="receipt-wrapper">
            <img class="receipt-img" src="${imgData}" />
            <div class="actions">
              <button class="btn-print" onclick="window.print()">Print</button>
              <a class="btn-download" href="${imgData}" download="receipt.png">Download</a>
            </div>
          </div>
          </body></html>`)
          w.document.close()
        }
      }
    } finally {
      setPrinting(false)
    }
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
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
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
                Customer Details (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
                <TextField
                  label='Customer Name'
                  value={customerName}
                  onChange={e => onCustomerNameChange?.(e.target.value)}
                  fullWidth
                  size='small'
                />
                <TextField
                  label='Phone Number'
                  value={customerPhone}
                  onChange={e => onCustomerPhoneChange?.(e.target.value)}
                  fullWidth
                  size='small'
                />
              </Box>
              <TextField
                label='Notes'
                value={customerNotes}
                onChange={e => onCustomerNotesChange?.(e.target.value)}
                fullWidth
                size='small'
                sx={{ mb: 1 }}
              />
            </>
          )}
          {readOnly && customerName && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='caption' display='block'>Customer: {customerName}</Typography>
              {customerPhone && <Typography variant='caption' display='block'>Phone: {customerPhone}</Typography>}
              {customerNotes && <Typography variant='caption' display='block'>Notes: {customerNotes}</Typography>}
            </Box>
          )}
          <Box sx={{ width: '100%', fontSize: 13 }}>
            <Box sx={{ display: 'flex', fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', pb: 0.5, mb: 0.5 }}>
              <Typography sx={{ width: 24 }}>#</Typography>
              <Typography sx={{ flex: 1 }}>Item</Typography>
              <Typography sx={{ width: 65, textAlign: 'right' }}>Net</Typography>
              <Typography sx={{ width: 45, textAlign: 'right' }}>VAT%</Typography>
            </Box>
            {items.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', py: 0.5 }}>
                <Typography sx={{ width: 24 }}>{i + 1}</Typography>
                <Typography sx={{ flex: 1 }}>{item.name} x{item.quantity}</Typography>
                <Typography sx={{ width: 65, textAlign: 'right' }}>€{item.total.toFixed(2)}</Typography>
                <Typography sx={{ width: 45, textAlign: 'right' }}>{item.vatRate ?? 12}%</Typography>
              </Box>
            ))}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Subtotal:</Typography>
            <Typography>€{subtotal.toFixed(2)}</Typography>
          </Box>
          {vatByRate && Object.entries(vatByRate).length > 0
            ? Object.entries(vatByRate).map(([rate, vat]) => (
                <Box key={rate} sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant='body2' color='text.secondary'>
                    VAT {rate}%{rate === '12' ? ' (Food)' : rate === '0' ? '' : ' (Drinks)'}:
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>€{vat.toFixed(2)}</Typography>
                </Box>
              ))
            : (vatTotal ?? 0) > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant='body2' color='text.secondary'>VAT:</Typography>
                  <Typography variant='body2' color='text.secondary'>€{(vatTotal ?? 0).toFixed(2)}</Typography>
                </Box>
              )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant='h6'>Total:</Typography>
            <Typography variant='h6'>€{total.toFixed(2)}</Typography>
          </Box>
          {(discountAmount ?? 0) > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography color='success.main'>Discount:</Typography>
                <Typography color='success.main'>-€{(discountAmount ?? 0).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant='h6'>Grand Total:</Typography>
                <Typography variant='h6' color='primary'>
                  €{Math.max(0, total - (discountAmount ?? 0)).toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
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

      {/* Hidden receipt template for image capture */}
      <div
        ref={receiptCaptureRef}
        style={{
          position: 'fixed',
          left: -9999,
          top: 0,
          background: '#fff',
          color: '#000',
          padding: 30,
          fontFamily: 'monospace',
          fontSize: 13,
          textAlign: 'center',
          width: 320
        }}
      >
        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: 18, letterSpacing: 2 }}>DESI DELIGHTS</p>
        <p style={{ margin: '0 0 8px 0', fontSize: 11 }}>Quick Bites, Happy Vibes</p>
        <p style={{ margin: '2px 0' }}>admin@desidelights.be</p>
        <hr style={{ border: 'none', borderTop: '1px dashed #999', margin: '10px 0' }} />
        <p style={{ textAlign: 'left', margin: '4px 0' }}>Order #{orderNumber || 'N/A'}</p>
        <p style={{ textAlign: 'left', margin: '4px 0' }} suppressHydrationWarning>
          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
        {customerName && <p style={{ textAlign: 'left', margin: '4px 0' }}>Customer: {customerName}</p>}
        {customerPhone && <p style={{ textAlign: 'left', margin: '4px 0' }}>Phone: {customerPhone}</p>}
        {customerNotes && <p style={{ textAlign: 'left', margin: '4px 0' }}>Notes: {customerNotes}</p>}
        <hr style={{ border: 'none', borderTop: '1px dashed #999', margin: '10px 0' }} />
        <div style={{ width: '100%', fontSize: 10, margin: '4px 0' }}>
          <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px dashed #999', padding: '2px 0' }}>
            <span style={{ width: 20 }}>#</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Item</span>
            <span style={{ width: 55, textAlign: 'right' }}>Net</span>
            <span style={{ width: 35, textAlign: 'right' }}>VAT%</span>
          </div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', padding: '2px 0' }}>
              <span style={{ width: 20 }}>{i + 1}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.name} x{item.quantity}</span>
              <span style={{ width: 55, textAlign: 'right' }}>€{item.total.toFixed(2)}</span>
              <span style={{ width: 35, textAlign: 'right' }}>{item.vatRate ?? 12}%</span>
            </div>
          ))}
        </div>
        <hr style={{ border: 'none', borderTop: '1px dashed #999', margin: '10px 0' }} />
        <div style={{ textAlign: 'right', fontSize: 11 }}>
          <p style={{ margin: '2px 0' }}>
            Net total: <strong>€{subtotal.toFixed(2)}</strong>
          </p>
          {vatByRate && Object.entries(vatByRate).length > 0
            ? Object.entries(vatByRate).map(([rate, vat]) => (
                <p key={rate} style={{ margin: '2px 0', fontSize: 11 }}>
                  VAT {rate}%{rate === '12' ? ' (Food)' : rate === '0' ? '' : ' (Drinks)'}: €{vat.toFixed(2)}
                </p>
              ))
            : (vatTotal ?? 0) > 0 && (
                <p style={{ margin: '2px 0', fontSize: 11 }}>VAT: €{(vatTotal ?? 0).toFixed(2)}</p>
              )}
          <p style={{ margin: '2px 0', fontSize: 15 }}>
            Total: <strong>€{total.toFixed(2)}</strong>
          </p>
          {(discountAmount ?? 0) > 0 && (
            <>
              <p style={{ margin: '2px 0', fontSize: 11, color: 'green' }}>
                Discount: -€{(discountAmount ?? 0).toFixed(2)}
              </p>
              <p style={{ margin: '2px 0', fontSize: 15 }}>
                Grand Total: <strong>€{Math.max(0, total - (discountAmount ?? 0)).toFixed(2)}</strong>
              </p>
            </>
          )}
        </div>
        <hr style={{ border: 'none', borderTop: '1px dashed #999', margin: '10px 0' }} />
        <p style={{ margin: '8px 0' }}>Thank you for your order!</p>
      </div>
    </>
  )
})

ReceiptDialog.displayName = 'ReceiptDialog'

export default ReceiptDialog
