'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../../../../styles/Dashboard.css';
import { hasDashboardAccess } from '../../../../../lib/dashboardAuth';
import DashboardSidebar from '../../../../../components/DashboardSidebar';

type OrderStatus = 'new' | 'in-process' | 'delivered';

type Order = {
    _id: string;
    status: OrderStatus;
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
    createdAt: string;
    contact: {
        firstName?: string;
        lastName?: string;
        email: string;
        address?: string;
        apartment?: string;
        city?: string;
        emirate?: string;
    };
    items: {
        productName: string;
        imageUrl?: string;
        unitPrice: number;
        quantity: number;
        currency?: string;
        variantSelections?: { groupName: string; optionName: string }[];
    }[];
};

const statuses: OrderStatus[] = ['new', 'in-process', 'delivered'];

function toDateInput(date: Date) {
    return date.toISOString().slice(0, 10);
}

function formatStatus(status: OrderStatus) {
    return status === 'in-process' ? 'In Process' : status.charAt(0).toUpperCase() + status.slice(1);
}

function formatMoney(value: number, currency = 'AED') {
    return `${currency} ${Number(value || 0).toFixed(2)}`;
}

export default function DashboardOrdersPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<OrderStatus>('new');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    const normalizedBase = apiBase.replace(/\/+$/u, '').replace(/\/api$/u, '');

    useEffect(() => {
        hasDashboardAccess().then((allowed) => {
            if (!allowed) router.replace('/404');
            setIsAuthorized(allowed);
        });
    }, [router]);

    useEffect(() => {
        if (isAuthorized !== true) return;

        const fetchOrders = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ status: 'all' });
                if (from) params.set('from', from);
                if (to) params.set('to', to);

                const response = await fetch(`${normalizedBase}/api/orders?${params.toString()}`, {
                    credentials: 'include',
                });
                const data = await response.json();
                if (data.success) setOrders(data.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [from, isAuthorized, normalizedBase, to]);

    const statusCounts = useMemo(() => {
        return statuses.reduce<Record<OrderStatus, number>>((acc, current) => {
            acc[current] = orders.filter((order) => order.status === current).length;
            return acc;
        }, { new: 0, 'in-process': 0, delivered: 0 });
    }, [orders]);

    const visibleOrders = useMemo(() => {
        return orders.filter((order) => order.status === status);
    }, [orders, status]);

    function setQuickFilter(kind: 'today' | 'yesterday' | 'last3') {
        const now = new Date();
        if (kind === 'today') {
            const today = toDateInput(now);
            setFrom(today);
            setTo(today);
            return;
        }
        if (kind === 'yesterday') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const day = toDateInput(yesterday);
            setFrom(day);
            setTo(day);
            return;
        }
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 2);
        setFrom(toDateInput(threeDaysAgo));
        setTo(toDateInput(now));
    }

    async function updateStatus(orderId: string, nextStatus: OrderStatus) {
        const response = await fetch(`${normalizedBase}/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: nextStatus }),
        });

        const data = await response.json();
        if (data.success) {
            setOrders((current) => current.map((order) => order._id === orderId ? data.data : order));
            setSelectedOrder((current) => current?._id === orderId ? data.data : current);
        }
    }

    if (isAuthorized !== true) {
        return <div className="dashboard-container" />;
    }

    return (
        <div className="dashboard-container">
            <DashboardSidebar />
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Orders</h1>
                    <p className="dashboard-kicker">Manage checkout orders by status and date.</p>
                </div>
            </header>

            <section className="dashboard-panel">
                <div className="orders-toolbar">
                    <div className="orders-tabs">
                        {statuses.map((item) => (
                            <button
                                type="button"
                                key={item}
                                className={status === item ? 'is-active' : ''}
                                onClick={() => setStatus(item)}
                            >
                                {formatStatus(item)}
                                <span>{statusCounts[item]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="orders-filters">
                        <button type="button" onClick={() => setQuickFilter('today')}>Today</button>
                        <button type="button" onClick={() => setQuickFilter('yesterday')}>Yesterday</button>
                        <button type="button" onClick={() => setQuickFilter('last3')}>Last 3 Days</button>
                        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                        <button type="button" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>
                    </div>
                </div>

                {loading ? (
                    <div className="no-products">Loading orders…</div>
                ) : visibleOrders.length === 0 ? (
                    <div className="no-products">No orders found for this view.</div>
                ) : (
                    <div className="orders-list">
                        {visibleOrders.map((order) => (
                            <article className="order-card" key={order._id}>
                                <div className="order-info">
                                    <p className="order-card__id">#{order._id.slice(-6).toUpperCase()}</p>
                                    <h3>{order.contact.firstName || 'Customer'} {order.contact.lastName || ''}</h3>
                                    <p>{order.contact.email}</p>
                                </div>
                                <div className="order-details">
                                    <span className="order-card__date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                    <strong className="order-total">{formatMoney(order.total, order.currency)}</strong>
                                </div>
                                <div className="order-card__actions">
                                    <select value={order.status} onChange={(event) => updateStatus(order._id, event.target.value as OrderStatus)}>
                                        {statuses.map((item) => (
                                            <option key={item} value={item}>{formatStatus(item)}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => setSelectedOrder(order)}>Detail</button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {selectedOrder && (
                <div className="order-modal" role="dialog" aria-modal="true">
                    <div className="order-modal__card">
                        <button type="button" className="order-modal__close" onClick={() => setSelectedOrder(null)}>Close</button>
                        <h2>Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                        <p className="dashboard-kicker">{formatStatus(selectedOrder.status)} · {new Date(selectedOrder.createdAt).toLocaleString()}</p>

                        <div className="order-modal__grid">
                            <section>
                                <h3>Customer</h3>
                                <p>{selectedOrder.contact.firstName} {selectedOrder.contact.lastName}</p>
                                <p>{selectedOrder.contact.email}</p>
                                <p>
                                    {selectedOrder.contact.address}<br />
                                    {selectedOrder.contact.apartment ? <>{selectedOrder.contact.apartment}<br /></> : null}
                                    {selectedOrder.contact.city}, {selectedOrder.contact.emirate}
                                </p>
                            </section>
                            <section>
                                <h3>Totals</h3>
                                <p>Subtotal: {formatMoney(selectedOrder.subtotal, selectedOrder.currency)}</p>
                                <p>Shipping: {formatMoney(selectedOrder.shipping, selectedOrder.currency)}</p>
                                <p>Total: {formatMoney(selectedOrder.total, selectedOrder.currency)}</p>
                            </section>
                        </div>

                        <section className="order-modal__items">
                            <h3>Items</h3>
                            {selectedOrder.items.map((item) => (
                                <div className="order-modal__item" key={`${selectedOrder._id}-${item.productName}`}>
                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span />}
                                    <div>
                                        <strong>{item.productName}</strong>
                                        <p>Qty {item.quantity} · {formatMoney(item.unitPrice * item.quantity, item.currency)}</p>
                                        {item.variantSelections?.map((variant) => (
                                            <small key={`${variant.groupName}-${variant.optionName}`}>{variant.groupName}: {variant.optionName}</small>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
}