import React, { useState } from 'react'
import { useUpdateOrderStatusMutation } from '../../../../store/orderApi';

// Must match the orderStatus values allowed by the backend Order model
const STATUS_OPTIONS = [
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped (dispatched)' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
];

const UpdateOrderModal = ({order, isOpen, onClose}) => {
    const [status, setStatus] = useState(order?.orderStatus || order?.status || 'confirmed');
    const [trackingUrl, setTrackingUrl] = useState(order?.trackingUrl || '');
    const [errorMessage, setErrorMessage] = useState('');
    const [notice, setNotice] = useState(null);

    const [updateOrderStatus, {isLoading}] = useUpdateOrderStatusMutation();

    const dispatchAlreadySent = Boolean(order?.whatsapp?.dispatchSentAt);

    const handleUpdateOrderStatus = async ()=> {
        setErrorMessage('');
        setNotice(null);
        const link = trackingUrl.trim();
        if (link && !/^https?:\/\/\S+$/i.test(link)) {
            setErrorMessage('Tracking link must start with http:// or https://');
            return;
        }
        try {
            const res = await updateOrderStatus({id: order?._id, status, trackingUrl: link}).unwrap();
            // Keep the modal open so the admin sees how the customer was notified
            const parts = [];
            if (res?.emailQueued) parts.push('Customer notified by email.');
            if (res?.whatsapp) {
                parts.push(res.whatsapp.sent
                    ? 'Dispatch message sent on WhatsApp.'
                    : `WhatsApp not sent: ${res.whatsapp.reason}`);
            }
            if (parts.length) {
                setNotice({ ok: !res?.whatsapp || res.whatsapp.sent, text: `Status saved. ${parts.join(' ')}` });
                return;
            }
            onClose();
        } catch (err) {
            console.error("Failed to update order status:", err);
            setErrorMessage(err?.data?.message || 'Failed to update status.');
        }
    }

    if(!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 px-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border border-gray-300 p-2 rounded w-full"
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {(status === 'shipped' || trackingUrl) && (
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2" htmlFor="trackingUrl">Tracking link</label>
                        <input
                            id="trackingUrl"
                            type="url"
                            inputMode="url"
                            placeholder="https://courier.com/track/AWB123"
                            value={trackingUrl}
                            onChange={(e) => setTrackingUrl(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {dispatchAlreadySent
                                ? 'Dispatch WhatsApp was already sent for this order.'
                                : 'When saved as Shipped, the customer gets this link on WhatsApp.'}
                        </p>
                    </div>
                )}

                {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
                {notice && (
                    <p className={`mb-4 text-sm ${notice.ok ? 'text-green-600' : 'text-amber-600'}`}>{notice.text}</p>
                )}

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                    >
                        {notice ? 'Close' : 'Cancel'}
                    </button>
                    {!notice && (
                        <button
                            onClick={handleUpdateOrderStatus}
                            disabled={isLoading}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>
                    )}
                </div>
            </div>
        </div>
  )
}

export default UpdateOrderModal
