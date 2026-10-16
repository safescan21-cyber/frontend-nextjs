import React, { useState, useRef } from 'react';
import { useDeleteOrderMutation, useGetAllOrdersQuery } from '../../../../store/orderApi';
import { formatDate } from '../../../../../utlis/formatDate';
import UpdateOrderModal from './UpdateOrderModal';
import jsPDF from 'jspdf';

// ─── Helpers ───────────────────────────────────────────────────────
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':     return 'bg-yellow-500';
    case 'processing':  return 'bg-blue-500';
    case 'shipped':     return 'bg-green-500';
    case 'completed':   return 'bg-gray-500';
    case 'confirmed':   return 'bg-indigo-500';
    default:            return 'bg-gray-300';
  }
};

// ─── Order Details Modal ─────────────────────────────────────────
const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  const {
    customerInfo,
    shippingAddress,
    items,
    paymentMethod,
    paymentStatus,
    orderStatus,
    totalAmount,
    orderId,
    createdAt,
  } = order;

  const contentRef = useRef();

  // ── Generate PDF (manual table, single line per row) ──────────
  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const margin = 15;
    let y = 20;

    doc.setFontSize(18);
    doc.text('Order Dispatch Slip', margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Order ID: ${orderId}`, margin, y);
    y += 7;
    doc.text(`Date: ${formatDate(createdAt)}`, margin, y);
    y += 7;
    doc.text(`Status: ${orderStatus || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Payment: ${paymentMethod} – ${paymentStatus}`, margin, y);
    y += 7;
    doc.text(`Total: ₹${totalAmount}`, margin, y);
    y += 10;

    doc.setFontSize(14);
    doc.text('Customer', margin, y);
    y += 6;
    doc.setFontSize(11);
    doc.text(`Name:  ${customerInfo?.firstName} ${customerInfo?.lastName}`, margin, y);
    y += 6;
    doc.text(`Email: ${customerInfo?.email}`, margin, y);
    y += 6;
    doc.text(`Phone: ${customerInfo?.phone}`, margin, y);
    y += 8;

    doc.setFontSize(14);
    doc.text('Shipping Address', margin, y);
    y += 6;
    doc.setFontSize(11);
    const addr = shippingAddress;
    if (addr) {
      doc.text(addr.addressLine1, margin, y);
      y += 6;
      if (addr.addressLine2) {
        doc.text(addr.addressLine2, margin, y);
        y += 6;
      }
      doc.text(`${addr.city}, ${addr.state} – ${addr.pincode}`, margin, y);
      y += 6;
      doc.text(addr.country, margin, y);
      y += 6;
      if (addr.deliveryInstructions) {
        doc.text(`Instructions: ${addr.deliveryInstructions}`, margin, y);
        y += 6;
      }
    }
    y += 6;

    // ── Items Table (manual) ──
    doc.setFontSize(14);
    doc.text('Items', margin, y);
    y += 6;

    // Column widths
    const col1 = margin;          // Product Name (80mm)
    const col2 = col1 + 80;
    const col3 = col2 + 20;       // Qty
    const col4 = col3 + 30;       // Price
    const col5 = col4 + 30;       // Total

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Product Name', col1, y);
    doc.text('Qty', col2 + 5, y, { align: 'right' });
    doc.text('Price', col3 + 5, y, { align: 'right' });
    doc.text('Total', col4 + 5, y, { align: 'right' });
    doc.setFont(undefined, 'normal');

    const lineY = y + 2;
    doc.line(col1, lineY, col5, lineY);
    y += 7;

    items?.forEach((item) => {
      let productName = item.name;
      if (productName.length > 25) {
        productName = productName.substring(0, 22) + '...';
      }
      doc.text(productName, col1, y, { maxWidth: 78 });
      doc.text(String(item.quantity), col2 + 5, y, { align: 'right', maxWidth: 18 });
      doc.text(`₹${item.price}`, col3 + 5, y, { align: 'right', maxWidth: 28 });
      doc.text(`₹${item.price * item.quantity}`, col4 + 5, y, { align: 'right', maxWidth: 28 });
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    const firstProductName = items?.[0]?.name?.replace(/\s+/g, '_') || 'order';
    doc.save(`order_${orderId}_${firstProductName}.pdf`);
  };

  // ── Modal JSX ──────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-xl">
        <div ref={contentRef}>
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold">Order Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Customer</h3>
              <p className="text-sm"><span className="font-medium">Name:</span> {customerInfo?.firstName} {customerInfo?.lastName}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {customerInfo?.email}</p>
              <p className="text-sm"><span className="font-medium">Phone:</span> {customerInfo?.phone}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Order</h3>
              <p className="text-sm"><span className="font-medium">Order ID:</span> {orderId}</p>
              <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(createdAt)}</p>
              <p className="text-sm"><span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs text-white rounded-full ${getStatusColor(orderStatus)}`}>
                  {orderStatus || 'N/A'}
                </span>
              </p>
              <p className="text-sm"><span className="font-medium">Payment:</span> {paymentMethod} – {paymentStatus}</p>
              <p className="text-sm"><span className="font-medium">Total:</span> ₹{totalAmount}</p>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
            <p className="text-sm">{shippingAddress?.addressLine1}</p>
            {shippingAddress?.addressLine2 && <p className="text-sm">{shippingAddress.addressLine2}</p>}
            <p className="text-sm">{shippingAddress?.city}, {shippingAddress?.state} – {shippingAddress?.pincode}</p>
            <p className="text-sm">{shippingAddress?.country}</p>
            {shippingAddress?.deliveryInstructions && (
              <p className="mt-1 text-sm text-gray-500">📝 {shippingAddress.deliveryInstructions}</p>
            )}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Items ({items?.length || 0})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left">Product Name</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items?.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="py-2 px-3 whitespace-nowrap">{item.name}</td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">{item.quantity}</td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">₹{item.price}</td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ManageOrders ────────────────────────────────────────────
const ManageOrders = () => {
  const { data: orders, error, isLoading, refetch } = useGetAllOrdersQuery();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteOrder] = useDeleteOrderMutation();

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    setDeletingId(orderId);
    try {
      await deleteOrder(orderId).unwrap();
      alert('Order deleted successfully');
      refetch();
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <div className="section__container p-6">Loading orders...</div>;
  if (error) return <div className="section__container p-6 text-red-500">Failed to load orders.</div>;

  const getProductNames = (items) => {
    if (!items || items.length === 0) return '—';
    const names = items.map(item => item.name);
    if (names.length <= 3) return names.join(', ');
    return names.slice(0, 3).join(', ') + ` +${names.length - 3} more`;
  };

  return (
    <div className="section__container p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Orders</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 border-b text-left text-sm">Order ID</th>
              <th className="py-3 px-4 border-b text-left text-sm">Customer</th>
              <th className="py-3 px-4 border-b text-left text-sm">Products</th>
              <th className="py-3 px-4 border-b text-left text-sm">Status</th>
              <th className="py-3 px-4 border-b text-left text-sm">Date</th>
              <th className="py-3 px-4 border-b text-left text-sm">Total</th>
              <th className="py-3 px-4 border-b text-left text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order?._id}>
                  <td className="py-3 px-4 border-b text-sm">{order?.orderId}</td>
                  <td className="py-3 px-4 border-b text-sm">
                    {order?.customerInfo?.firstName} {order?.customerInfo?.lastName}
                    <span className="block text-xs text-gray-500">{order?.customerInfo?.email}</span>
                  </td>
                  <td className="py-3 px-4 border-b text-sm text-gray-600">
                    {getProductNames(order?.items)}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`inline-block px-3 py-1 text-xs text-white rounded-full ${getStatusColor(order?.orderStatus || order?.status)}`}>
                      {order?.orderStatus || order?.status || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b text-sm">{formatDate(order?.createdAt)}</td>
                  <td className="py-3 px-4 border-b text-sm font-semibold">₹{order?.totalAmount || 0}</td>
                  <td className="py-3 px-4 border-b flex items-center gap-2 whitespace-nowrap">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order?._id)}
                      disabled={deletingId === order?._id}
                      className="text-red-600 hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === order?._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-6 px-4 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={handleCloseViewModal} />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedOrder && (
        <UpdateOrderModal
          order={selectedOrder}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default ManageOrders;