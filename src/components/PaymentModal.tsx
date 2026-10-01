import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Copy,
  DollarSign,
  FileCheck,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Phone,
  ShieldAlert,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ReunionEvent, SiteSettings } from '../types/index.ts';
import { safeFetchJson } from '../lib/api.ts';

interface PaymentModalProps {
  isOpen: boolean;
  event: ReunionEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  event,
  onClose,
  onSuccess,
}) => {
  const { token, refreshProfile } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Other'>('bKash');
  const [amount, setAmount] = useState<number>(event?.registrationFee || 1500);
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedNumber, setCopiedNumber] = useState('');

  useEffect(() => {
    if (event) {
      setAmount(event.registrationFee || 1500);
    }
    // Fetch live settings for payment numbers
    safeFetchJson<SiteSettings>('/api/settings')
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch((err) => console.warn('Payment settings notice:', err?.message));
  }, [event]);

  if (!isOpen || !event) return null;

  // Validation rules strictly as specified
  const hasTrxId = transactionId.trim().length > 0;
  const hasScreenshot = screenshotUrl.trim().length > 0;
  const isFormValid = hasTrxId && hasScreenshot && senderNumber.trim().length > 0;

  const handleCopyNumber = (num: string) => {
    const rawNumber = num.split(' ')[0];
    navigator.clipboard.writeText(rawNumber);
    setCopiedNumber(rawNumber);
    setTimeout(() => setCopiedNumber(''), 2500);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Screenshot file size exceeds 5 MB. Please select an optimized image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotUrl(reader.result as string);
      setValidationError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verification check per specifications:
    if (!hasTrxId && !hasScreenshot) {
      setValidationError('Please enter the Transaction ID and upload the payment screenshot before submitting your payment.');
      return;
    }
    if (!hasTrxId) {
      setValidationError('Transaction ID is required.');
      return;
    }
    if (!hasScreenshot) {
      setValidationError('Transaction screenshot is required. Please upload a screenshot of your successful payment.');
      return;
    }
    if (!senderNumber.trim()) {
      setValidationError('Sender mobile number is required.');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      await safeFetchJson('/api/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          paymentMethod,
          amount,
          senderNumber,
          transactionId: transactionId.trim(),
          screenshotUrl,
          paymentDate,
          note,
        }),
      });

      setIsSubmitting(false);
      setSuccessMessage('Payment submitted successfully! Your payment is waiting for verification.');
      await refreshProfile();
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setIsSubmitting(false);
      setValidationError(err.message || 'Payment submission failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002147] to-[#001733] px-6 py-5 text-white flex items-center justify-between border-b border-[#C5A059]/30">
          <div>
            <span className="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider block">
              Official Reunion Fee Submission
            </span>
            <h3 className="font-bold text-lg text-white font-serif">{event.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {successMessage ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[#002147] font-serif">Payment Submitted!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                {successMessage}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-semibold">
                Status: 🟡 Pending Verification
              </div>
            </div>
          ) : (
            <>
              {/* Payment Account Details Box */}
              <div className="bg-[#F7F8FA] border border-[#C5A059]/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#002147] border-b border-slate-200 pb-2">
                  <span>Send Reunion Fee to Official Accounts:</span>
                  <span className="text-[#C5A059] font-mono text-sm">{amount} BDT</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* bKash */}
                  <div className="p-2.5 bg-white rounded-xl border border-pink-100 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-pink-600 uppercase block">bKash (Send Money)</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {settings?.bkashNumber || '01819-876543'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(settings?.bkashNumber || '01819-876543')}
                      className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-pink-50"
                      title="Copy Number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Nagad */}
                  <div className="p-2.5 bg-white rounded-xl border border-orange-100 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 uppercase block">Nagad (Personal)</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {settings?.nagadNumber || '01711-234567'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(settings?.nagadNumber || '01711-234567')}
                      className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-orange-50"
                      title="Copy Number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Rocket */}
                  <div className="p-2.5 bg-white rounded-xl border border-purple-100 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 uppercase block">Rocket DBBL</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {settings?.rocketNumber || '01819-876543-2'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(settings?.rocketNumber || '01819-876543-2')}
                      className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50"
                      title="Copy Number"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bank */}
                  <div className="p-2.5 bg-white rounded-xl border border-blue-100 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase block">Bank Account</span>
                      <span className="font-mono text-[11px] text-slate-800 line-clamp-1">
                        {settings?.bankInfo ? settings.bankInfo.split(',')[0] : 'Islami Bank Bangladesh'}
                      </span>
                    </div>
                  </div>
                </div>

                {copiedNumber && (
                  <div className="text-[11px] text-emerald-600 font-semibold text-center animate-pulse">
                    ✓ Copied {copiedNumber} to clipboard!
                  </div>
                )}
              </div>

              {validationError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Method Used *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    >
                      <option value="bKash">bKash (Send Money)</option>
                      <option value="Nagad">Nagad (Send Money)</option>
                      <option value="Rocket">Rocket DBBL</option>
                      <option value="Bank Transfer">Bank Transfer / Deposit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Amount Paid (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sender Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sender Mobile / Account Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 018XXXXXXXX"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#002147]"
                    />
                  </div>
                </div>

                {/* MANDATORY TRANSACTION ID */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold text-[#002147] uppercase tracking-wide flex items-center gap-1.5">
                      <span>Transaction ID (TrxID)</span>
                      <span className="text-red-500 font-bold">* MANDATORY</span>
                    </label>
                    <span className="text-[10px] text-amber-700 font-semibold">e.g. BL95X8P2K1</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter the exact TrxID received from bKash/Nagad/Rocket SMS"
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      setValidationError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white font-mono text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                  {!hasTrxId && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      * Transaction ID is required to submit payment.
                    </p>
                  )}
                </div>

                {/* MANDATORY TRANSACTION SCREENSHOT */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold text-[#002147] uppercase tracking-wide flex items-center gap-1.5">
                      <span>Transaction Screenshot</span>
                      <span className="text-red-500 font-bold">* MANDATORY</span>
                    </label>
                    <span className="text-[10px] text-amber-700 font-semibold">Max 5MB (JPG/PNG)</span>
                  </div>

                  {screenshotUrl ? (
                    <div className="space-y-2 mt-2">
                      <div className="relative border-2 border-emerald-400 rounded-xl overflow-hidden max-h-48 bg-black/5 flex items-center justify-center p-1">
                        <img
                          src={screenshotUrl}
                          alt="Transaction Screenshot Preview"
                          className="max-h-44 w-auto object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setScreenshotUrl('')}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
                          title="Remove Screenshot"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold px-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Screenshot verified and ready for review
                        </span>
                        <label className="text-[#002147] underline cursor-pointer hover:text-black">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center bg-white space-y-2.5">
                      <ImageIcon className="w-8 h-8 text-amber-500 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        Upload screenshot of the successful transaction screen
                      </p>
                      <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                        Make sure the screenshot shows the TrxID, amount paid, and recipient number clearly.
                      </p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#002147] text-[#C5A059] font-bold text-xs rounded-xl cursor-pointer hover:bg-[#001733] shadow transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Choose Screenshot Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {!hasScreenshot && (
                    <p className="text-[11px] text-red-600 mt-2 font-medium">
                      * Transaction screenshot is required. Please upload a screenshot of your successful payment.
                    </p>
                  )}
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Optional Note (e.g. t-shirt size, attendee name)
                  </label>
                  <input
                    type="text"
                    placeholder="Any specific note for organizers"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#002147]"
                  />
                </div>

                {/* Privacy Warning */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Screenshot Privacy Protected:</strong> Your transaction screenshot will only be reviewed by authorized reunion administrators and will never be shown on public profiles or the web. Manual admin verification is required.
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isFormValid && !isSubmitting
                        ? 'bg-gradient-to-r from-[#C5A059] to-[#DFBF7D] text-[#002147] hover:brightness-105 cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Verifying & Submitting...</span>
                    ) : !isFormValid ? (
                      <span>Fill TrxID & Screenshot to Enable Submit</span>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Submit Payment for Verification</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
