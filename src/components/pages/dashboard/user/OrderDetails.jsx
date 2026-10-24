import React from 'react'
import { useGetOrderByIdQuery } from '../../../store/orderApi';
import { Link, useParams } from '../../../../shell/router';
import TimelineStep from '../../../../components/TimelineStep';

const STEPS = [
    {
        status: 'confirmed',
        label: 'Confirmed',
        description: 'Your order has been received and confirmed.',
        icon: { iconName: 'time-line', bgColor: 'red-500', textColor: 'gray-800' },
    },
    {
        status: 'processing',
        label: 'Processing',
        description: 'Your order is being prepared.',
        icon: { iconName: 'loader-line', bgColor: 'yellow-800', textColor: 'yellow-800' },
    },
    {
        status: 'shipped',
        label: 'Shipped',
        description: 'Your order has been dispatched.',
        icon: { iconName: 'truck-line', bgColor: 'blue-800', textColor: 'blue-800' },
    },
    {
        status: 'delivered',
        label: 'Delivered',
        description: 'Your order has been delivered.',
        icon: { iconName: 'check-line', bgColor: 'green-800', textColor: 'green-900' },
    },
];
const ORDER = STEPS.map((s) => s.status);
const rs = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const OrderDetails = () => {
    const { orderId } = useParams();
    const { data: order, error, isLoading } = useGetOrderByIdQuery(orderId);

    if (isLoading) return <div className='p-6'>Loading...</div>
    if (error || !order) return (
        <div className='p-6'>
            <p className='mb-3'>We could not find this order in your account.</p>
            <Link to='/dashboard/orders' className='text-blue-600 underline'>Back to my orders</Link>
        </div>
    )

    const status = order.orderStatus || order.status || 'confirmed';
    const stopped = !ORDER.includes(status); // cancelled, refunded, payment failed
    const isCompleted = (s) => ORDER.indexOf(s) < ORDER.indexOf(status);
    const isCurrent = (s) => status === s;

    return (
        <section className='section__container rounded p-6'>
            <Link to='/dashboard/orders' className='text-sm text-blue-600 hover:underline'>← My orders</Link>
            <h2 className='text-2xl font-semibold mt-2 mb-1'>Order {order.orderId}</h2>
            <p className='mb-1 text-gray-600'>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className='mb-6 text-gray-600'>Status: <strong className='capitalize'>{status.replace(/_/g, ' ')}</strong> · Payment: <span className='capitalize'>{order.paymentStatus}</span></p>

            {stopped ? (
                <p className='mb-8 rounded-lg bg-red-50 p-3 text-red-700'>This order is {status.replace(/_/g, ' ')}.</p>
            ) : (
                <ol className='sm:flex items-center relative mb-8'>
                    {STEPS.map((step, index) => (
                        <TimelineStep
                            key={step.status}
                            step={step}
                            order={order}
                            isCompleted={isCompleted(step.status)}
                            isCurrent={isCurrent(step.status)}
                            isLastStep={index === STEPS.length - 1}
                            icon={step.icon}
                            description={step.description}
                        />
                    ))}
                </ol>
            )}

            {order.trackingUrl && (
                <p className='mb-6'><a href={order.trackingUrl} target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>Track the shipment</a></p>
            )}

            <h3 className='text-lg font-semibold mb-2'>Items</h3>
            <ul className='divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white'>
                {(order.items || []).map((item, i) => (
                    <li key={`${item.productId}-${i}`} className='flex flex-wrap items-start justify-between gap-2 p-3'>
                        <div>
                            <p className='font-medium text-gray-900'>{item.name}</p>
                            <p className='text-sm text-gray-500'>{item.unit ? `${item.quantity} ${item.unit}` : `Qty ${item.quantity}`} · {rs(item.price)} each</p>
                            {item.serialNumbers?.length > 0 && (
                                <p className='mt-1 text-sm text-gray-700'>Serial number{item.serialNumbers.length > 1 ? 's' : ''}: <span className='font-mono font-semibold'>{item.serialNumbers.join(', ')}</span></p>
                            )}
                        </div>
                        <p className='font-semibold text-gray-900'>{rs(item.price * item.quantity)}</p>
                    </li>
                ))}
            </ul>
            <p className='mt-3 text-right font-semibold'>Total: {rs(order.totalAmount)}</p>
            <p className='mt-4 text-sm text-gray-600'>Need service or spare parts for your machine? <Link to='/service-request' className='text-blue-600 underline'>Raise a service request</Link> and quote the serial number.</p>
        </section>
    )
}

export default OrderDetails
