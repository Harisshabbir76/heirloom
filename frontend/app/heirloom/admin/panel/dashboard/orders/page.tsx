'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../../../../styles/Dashboard.css';
import { hasDashboardAccess } from '../../../../../lib/dashboardAuth';
import DashboardSidebar from '../../../../../components/DashboardSidebar';

type OrderStatus = 'new' | 'in-process' | 'delivered';

type Order = {
    _id?: string;
    status?: OrderStatus;
    paymentStatus?: 'pending' | 'paid' | 'failed';
    subtotal?: number;
    shipping?: number;
    total?: number;
    currency?: string;
    createdAt?: string;
    contact?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        address?: string;
        apartment?: string;
        city?: string;
        emirate?: string;
    };
    items?: {
        productName?: string;
        imageUrl?: string;
        unitPrice?: number;
        quantity?: number;
        currency?: string;
        variantSelections?: { groupName?: string; optionName?: string }[];
    }[];
};

const statuses: OrderStatus[] = ['new', 'in-process', 'delivered'];

function toDateInput(date: Date) {
    return date.toISOString().slice(0, 10);
}

function formatStatus(status?: OrderStatus) {
    if (!status) return 'Unknown';
    return status === 'in-process'
        ? 'In Process'
        : status.charAt(0).toUpperCase() + status.slice(1);
}

function formatMoney(value?: number, currency = 'AED') {
    return `${currency} ${Number(value || 0).toFixed(2)}`;
}

function formatDisplayDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function CalendarDropdown({
    from,
    to,
    onApply,
    onClear,
}: {
    from: string;
    to: string;
    onApply: (from: string, to: string) => void;
    onClear: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [hoverDate, setHoverDate] = useState<string | null>(null);
    const [selecting, setSelecting] = useState<'start' | 'end'>('start');
    const [tempFrom, setTempFrom] = useState(from);
    const [tempTo, setTempTo] = useState(to);
    const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');

    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const dropdownWidth = 280;
            const spaceRight = window.innerWidth - rect.right;
            
            if (spaceRight < dropdownWidth) {
                setDropdownPosition('right');
            } else {
                setDropdownPosition('left');
            }
        }
    }, [open]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    useEffect(() => {
        setTempFrom(from);
        setTempTo(to);
    }, [from, to]);

    function getDaysInMonth(year: number, month: number) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(year: number, month: number) {
        return new Date(year, month, 1).getDay();
    }

    function buildCells() {
        const daysInMonth = getDaysInMonth(viewYear, viewMonth);
        const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
        const cells: (string | null)[] = [];

        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const mm = String(viewMonth + 1).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            cells.push(`${viewYear}-${mm}-${dd}`);
        }
        return cells;
    }

    function isInRange(dateStr: string) {
        const start = tempFrom || '';
        const end = tempTo || hoverDate || '';
        if (!start) return false;
        const s = start < end ? start : end;
        const e = start < end ? end : start;
        return dateStr > s && dateStr < e;
    }

    function isRangeStart(dateStr: string) {
        return dateStr === tempFrom || dateStr === tempTo;
    }

    function isRangeEnd(dateStr: string) {
        return dateStr === tempTo || (selecting === 'end' && dateStr === hoverDate);
    }

    function handleDayClick(dateStr: string) {
        if (selecting === 'start') {
            setTempFrom(dateStr);
            setTempTo('');
            setSelecting('end');
        } else {
            if (dateStr < tempFrom) {
                setTempTo(tempFrom);
                setTempFrom(dateStr);
            } else {
                setTempTo(dateStr);
            }
            setSelecting('start');
        }
    }

    function prevMonth() {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    }

    function nextMonth() {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    }

    function handleApply() {
        if (tempFrom && tempTo) {
            onApply(tempFrom, tempTo);
            setOpen(false);
        }
    }

    function handleClear() {
        setTempFrom('');
        setTempTo('');
        setSelecting('start');
        setHoverDate(null);
        onClear();
        setOpen(false);
    }

    const hasRange = from && to;
    const label = hasRange
        ? `${formatDisplayDate(from)} – ${formatDisplayDate(to)}`
        : 'Date Range';

    const cells = buildCells();

    return (
        <div className="cal-wrapper" ref={dropdownRef}>
            <button
                type="button"
                ref={triggerRef}
                className={`cal-trigger${hasRange ? ' cal-trigger--active' : ''}`}
                onClick={() => setOpen((v) => !v)}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ flexShrink: 0 }}
                >
                    <rect
                        x="1"
                        y="2"
                        width="14"
                        height="13"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M1 6h14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M5 1v2M11 1v2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
                {label}
                {hasRange && (
                    <span
                        className="cal-clear-x"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                    >
                        ×
                    </span>
                )}
            </button>

            {open && (
                <div 
                    className="cal-dropdown"
                    style={{
                        [dropdownPosition === 'left' ? 'left' : 'right']: '0',
                        [dropdownPosition === 'left' ? 'right' : 'left']: 'auto',
                    }}
                >
                    <div className="cal-header">
                        <button
                            type="button"
                            className="cal-nav"
                            onClick={prevMonth}
                        >
                            ‹
                        </button>
                        <span className="cal-month-label">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            className="cal-nav"
                            onClick={nextMonth}
                        >
                            ›
                        </button>
                    </div>

                    <div className="cal-hint">
                        {selecting === 'start'
                            ? 'Select start date'
                            : 'Select end date'}
                    </div>

                    <div className="cal-grid">
                        {DAYS.map((d) => (
                            <div key={d} className="cal-day-name">
                                {d}
                            </div>
                        ))}

                        {cells.map((dateStr, idx) => {
                            if (!dateStr) {
                                return (
                                    <div
                                        key={`empty-${idx}`}
                                        className="cal-day cal-day--empty"
                                    />
                                );
                            }

                            const isStart = dateStr === tempFrom;
                            const isEnd =
                                dateStr === tempTo ||
                                (selecting === 'end' &&
                                    !tempTo &&
                                    dateStr === hoverDate &&
                                    hoverDate >= tempFrom);
                            const inRange = isInRange(dateStr);
                            const isToday =
                                dateStr === toDateInput(new Date());

                            let cls = 'cal-day';
                            if (isStart || isEnd) cls += ' cal-day--selected';
                            if (inRange) cls += ' cal-day--in-range';
                            if (isToday && !isStart && !isEnd)
                                cls += ' cal-day--today';

                            return (
                                <button
                                    key={dateStr}
                                    type="button"
                                    className={cls}
                                    onClick={() =>
                                        handleDayClick(dateStr)
                                    }
                                    onMouseEnter={() =>
                                        setHoverDate(dateStr)
                                    }
                                    onMouseLeave={() =>
                                        setHoverDate(null)
                                    }
                                >
                                    {parseInt(dateStr.slice(8), 10)}
                                </button>
                            );
                        })}
                    </div>

                    <div className="cal-footer">
                        {tempFrom && tempTo ? (
                            <span className="cal-selected-range">
                                {formatDisplayDate(tempFrom)} –{' '}
                                {formatDisplayDate(tempTo)}
                            </span>
                        ) : (
                            <span className="cal-selected-range cal-selected-range--muted">
                                {tempFrom
                                    ? `From ${formatDisplayDate(tempFrom)}`
                                    : 'No range selected'}
                            </span>
                        )}

                        <div className="cal-footer-actions">
                            <button
                                type="button"
                                className="cal-btn cal-btn--ghost"
                                onClick={handleClear}
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                className="cal-btn cal-btn--apply"
                                disabled={!tempFrom || !tempTo}
                                onClick={handleApply}
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .cal-wrapper {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                }

                .cal-trigger {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border, #e2e8f0);
                    background: var(--surface, #fff);
                    color: var(--text-muted, #64748b);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: border-color 0.15s, background 0.15s;
                    height: 34px;
                }

                .cal-trigger:hover {
                    border-color: var(--accent, #3b82f6);
                    color: var(--text, #1e293b);
                }

                .cal-trigger--active {
                    border-color: var(--accent, #3b82f6);
                    background: var(--accent-soft, #eff6ff);
                    color: var(--accent, #3b82f6);
                }

                .cal-clear-x {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 2px;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    font-size: 14px;
                    line-height: 1;
                    color: var(--accent, #3b82f6);
                    background: transparent;
                    cursor: pointer;
                    transition: background 0.1s;
                }

                .cal-clear-x:hover {
                    background: var(--accent, #3b82f6);
                    color: #fff;
                }

                .cal-dropdown {
                    position: absolute;
                    top: calc(100% + 6px);
                    z-index: 9999;
                    background: var(--surface, #fff);
                    border: 1px solid var(--border, #e2e8f0);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                    padding: 16px;
                    width: 280px;
                    animation: calFadeIn 0.15s ease;
                }

                @keyframes calFadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .cal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                .cal-month-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text, #1e293b);
                }

                .cal-nav {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                    color: var(--text-muted, #64748b);
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.1s, color 0.1s;
                    padding: 0;
                    line-height: 1;
                }

                .cal-nav:hover {
                    background: var(--hover, #f1f5f9);
                    color: var(--text, #1e293b);
                }

                .cal-hint {
                    font-size: 11px;
                    color: var(--text-muted, #94a3b8);
                    text-align: center;
                    margin-bottom: 8px;
                    font-style: italic;
                }

                .cal-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 2px;
                    margin-bottom: 12px;
                }

                .cal-day-name {
                    text-align: center;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted, #94a3b8);
                    padding: 4px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }

                .cal-day {
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 6px;
                    height: 32px;
                    width: 100%;
                    font-size: 12px;
                    color: var(--text, #1e293b);
                    transition: background 0.1s, color 0.1s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .cal-day--empty {
                    pointer-events: none;
                }

                .cal-day:not(.cal-day--empty):hover {
                    background: var(--hover, #f1f5f9);
                }

                .cal-day--today::after {
                    content: '';
                    position: absolute;
                    bottom: 4px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: var(--accent, #3b82f6);
                }

                .cal-day--selected {
                    background: var(--accent, #3b82f6) !important;
                    color: #fff !important;
                    font-weight: 600;
                    border-radius: 6px;
                }

                .cal-day--in-range {
                    background: var(--accent-soft, #eff6ff);
                    color: var(--accent, #3b82f6);
                    border-radius: 0;
                }

                .cal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    border-top: 1px solid var(--border, #e2e8f0);
                    padding-top: 12px;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .cal-selected-range {
                    font-size: 11px;
                    color: var(--accent, #3b82f6);
                    font-weight: 500;
                    flex: 1;
                    min-width: 0;
                }

                .cal-selected-range--muted {
                    color: var(--text-muted, #94a3b8);
                    font-weight: 400;
                }

                .cal-footer-actions {
                    display: flex;
                    gap: 6px;
                    flex-shrink: 0;
                }

                .cal-btn {
                    padding: 5px 12px;
                    border-radius: 6px;
                    border: 1px solid var(--border, #e2e8f0);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.1s, border-color 0.1s;
                    height: 30px;
                    display: inline-flex;
                    align-items: center;
                }

                .cal-btn--ghost {
                    background: none;
                    color: var(--text-muted, #64748b);
                }

                .cal-btn--ghost:hover {
                    background: var(--hover, #f1f5f9);
                    border-color: var(--text-muted, #94a3b8);
                }

                .cal-btn--apply {
                    background: var(--accent, #3b82f6);
                    color: #fff;
                    border-color: var(--accent, #3b82f6);
                }

                .cal-btn--apply:hover:not(:disabled) {
                    background: #2563eb;
                    border-color: #2563eb;
                }

                .cal-btn--apply:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
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

    const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
        show: boolean;
        orderId: string | null;
        orderNumber: string;
    }>({
        show: false,
        orderId: null,
        orderNumber: '',
    });

    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

    const normalizedBase = apiBase
        .replace(/\/+$/u, '')
        .replace(/\/api$/u, '');

    useEffect(() => {
        hasDashboardAccess()
            .then((allowed) => {
                if (!allowed) {
                    router.replace('/404');
                    return;
                }

                setIsAuthorized(true);
            })
            .catch((error) => {
                console.error('Authorization Error:', error);
                setIsAuthorized(false);
            });
    }, [router]);

    useEffect(() => {
        if (isAuthorized !== true) return;

        const fetchOrders = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams({
                    status: 'all',
                });

                if (from) params.set('from', from);
                if (to) params.set('to', to);

                const url = `${normalizedBase}/api/orders?${params.toString()}`;

                const response = await fetch(url, {
                    credentials: 'include',
                });

                const rawText = await response.text();

                let data: any;

                try {
                    data = JSON.parse(rawText);
                } catch (jsonError) {
                    console.error('JSON PARSE ERROR:', jsonError);
                    setOrders([]);
                    return;
                }

                if (data?.success && Array.isArray(data?.data)) {
                    const safeOrders = data.data.filter(Boolean);
                    setOrders(safeOrders);
                } else {
                    console.error('Invalid API Response Structure');
                    setOrders([]);
                }
            } catch (error) {
                console.error('FETCH ERROR:', error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [from, to, isAuthorized, normalizedBase]);

    const statusCounts = useMemo(() => {
        return statuses.reduce<Record<OrderStatus, number>>(
            (acc, current) => {
                acc[current] = orders.filter(
                    (order) => order?.status === current
                ).length;

                return acc;
            },
            {
                new: 0,
                'in-process': 0,
                delivered: 0,
            }
        );
    }, [orders]);

    const visibleOrders = useMemo(() => {
        return orders.filter((order) => order?.status === status);
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

    async function updateStatus(
        orderId: string,
        nextStatus: OrderStatus
    ) {
        try {
            const response = await fetch(
                `${normalizedBase}/api/orders/${orderId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        status: nextStatus,
                    }),
                }
            );

            const rawText = await response.text();

            let data;

            try {
                data = JSON.parse(rawText);
            } catch {
                console.error('Invalid JSON while updating status');
                return;
            }

            if (data?.success) {
                setOrders((current) =>
                    current.map((order) =>
                        order?._id === orderId ? data.data : order
                    )
                );

                setSelectedOrder((current) =>
                    current?._id === orderId ? data.data : current
                );
            }
        } catch (error) {
            console.error('Update Status Error:', error);
        }
    }

    const confirmDeleteOrder = (
        orderId: string,
        orderNumber: string
    ) => {
        setDeleteConfirmModal({
            show: true,
            orderId,
            orderNumber,
        });
    };

    async function handleDeleteOrder() {
        if (!deleteConfirmModal.orderId) return;

        try {
            const response = await fetch(
                `${normalizedBase}/api/orders/${deleteConfirmModal.orderId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            );

            const rawText = await response.text();

            let data;

            try {
                data = JSON.parse(rawText);
            } catch {
                alert('Invalid delete response');
                return;
            }

            if (data?.success) {
                setOrders((current) =>
                    current.filter(
                        (order) =>
                            order?._id !== deleteConfirmModal.orderId
                    )
                );

                setSelectedOrder((current) =>
                    current?._id === deleteConfirmModal.orderId
                        ? null
                        : current
                );

                setDeleteConfirmModal({
                    show: false,
                    orderId: null,
                    orderNumber: '',
                });
            } else {
                alert('Failed to delete order.');
            }
        } catch (error) {
            console.error('Delete Error:', error);
            alert('Failed to delete order.');
        }
    }

    function cancelDeleteOrder() {
        setDeleteConfirmModal({
            show: false,
            orderId: null,
            orderNumber: '',
        });
    }

    if (isAuthorized === null) {
        return (
            <div className="dashboard-container">
                <div className="no-products">
                    Checking authorization...
                </div>
            </div>
        );
    }

    if (isAuthorized !== true) {
        return (
            <div className="dashboard-container">
                <div className="no-products">
                    Unauthorized
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <DashboardSidebar />

            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">ORDERS</h1>

                    <p className="dashboard-kicker">
                        Manage checkout orders by status and date.
                    </p>
                </div>
            </header>

            <section className="dashboard-panel">
                <div className="orders-toolbar">
                    <div className="orders-tabs">
                        {statuses.map((item) => (
                            <button
                                type="button"
                                key={item}
                                className={
                                    status === item ? 'is-active' : ''
                                }
                                onClick={() => setStatus(item)}
                            >
                                {formatStatus(item)}

                                <span>{statusCounts[item]}</span>
                            </button>
                        ))}
                    </div>

                    <div className="orders-filters">
                        <button
                            type="button"
                            onClick={() => setQuickFilter('today')}
                        >
                            Today
                        </button>

                        <button
                            type="button"
                            onClick={() => setQuickFilter('yesterday')}
                        >
                            Yesterday
                        </button>

                        <button
                            type="button"
                            onClick={() => setQuickFilter('last3')}
                        >
                            Last 3 Days
                        </button>

                        <CalendarDropdown
                            from={from}
                            to={to}
                            onApply={(f, t) => {
                                setFrom(f);
                                setTo(t);
                            }}
                            onClear={() => {
                                setFrom('');
                                setTo('');
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="no-products">
                        Loading orders...
                    </div>
                ) : visibleOrders.length === 0 ? (
                    <div className="no-products">
                        No orders found.
                    </div>
                ) : (
                    <div className="orders-list">
                        {visibleOrders.map((order, index) => {
                            const orderId =
                                order?._id || `fallback-${index}`;

                            return (
                                <article
                                    className="order-card"
                                    key={orderId}
                                >
                                    <div className="order-info">
                                        <p className="order-card__id">
                                            #
                                            {order?._id
                                                ?.slice(-6)
                                                ?.toUpperCase() ||
                                                'UNKNOWN'}
                                        </p>

                                        <h3>
                                            {order?.contact
                                                ?.firstName ||
                                                'Customer'}{' '}
                                            {order?.contact
                                                ?.lastName || ''}
                                        </h3>

                                        <p>
                                            {order?.contact?.email ||
                                                'No Email'}
                                        </p>
                                    </div>

                                    <div className="order-details">
                                        <span className="order-card__date">
                                            {order?.createdAt
                                                ? new Date(
                                                      order.createdAt
                                                  ).toLocaleDateString()
                                                : 'No Date'}
                                        </span>

                                        <strong className="order-total">
                                            {formatMoney(
                                                order?.total,
                                                order?.currency
                                            )}
                                        </strong>
                                        <span className="order-payment-status">
                                            Payment: {order?.paymentStatus || 'paid'}
                                        </span>
                                    </div>

                                    <div className="order-card__actions">
                                        <select
                                            value={
                                                order?.status || 'new'
                                            }
                                            onChange={(event) =>
                                                updateStatus(
                                                    order?._id || '',
                                                    event.target
                                                        .value as OrderStatus
                                                )
                                            }
                                        >
                                            {statuses.map((item) => (
                                                <option
                                                    key={item}
                                                    value={item}
                                                >
                                                    {formatStatus(item)}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedOrder(order)
                                            }
                                        >
                                            Detail
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-action-btn"
                                            onClick={() =>
                                                confirmDeleteOrder(
                                                    order?._id || '',
                                                    `#${order?._id
                                                        ?.slice(-6)
                                                        ?.toUpperCase()}`
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {selectedOrder && (
                <div
                    className="order-modal"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="order-modal__card">
                        <button
                            type="button"
                            className="order-modal__close"
                            onClick={() => setSelectedOrder(null)}
                        >
                            Close
                        </button>

                        <h2>
                            Order #
                            {selectedOrder?._id
                                ?.slice(-6)
                                ?.toUpperCase() || 'UNKNOWN'}
                        </h2>

                        <p className="dashboard-kicker">
                            {formatStatus(selectedOrder?.status)} ·{' '}
                            Payment: {selectedOrder?.paymentStatus || 'paid'} ·{' '}
                            {selectedOrder?.createdAt
                                ? new Date(
                                      selectedOrder.createdAt
                                  ).toLocaleString()
                                : 'No Date'}
                        </p>

                        <div className="order-modal__grid">
                            <section>
                                <h3>Customer</h3>

                                <p>
                                    {selectedOrder?.contact?.firstName || ''}{' '}
                                    {selectedOrder?.contact?.lastName || ''}
                                </p>

                                <p>
                                    <strong>Email:</strong> {selectedOrder?.contact?.email || 'N/A'}
                                </p>

                                <p>
                                    <strong>Phone:</strong> {selectedOrder?.contact?.phone || 'Not provided'}
                                </p>

                                <p>
                                    <strong>Address:</strong><br />
                                    {selectedOrder?.contact?.address || 'N/A'}
                                    <br />
                                    {selectedOrder?.contact?.apartment ? (
                                        <>
                                            {selectedOrder?.contact?.apartment}
                                            <br />
                                        </>
                                    ) : null}
                                    {selectedOrder?.contact?.city || ''}, {selectedOrder?.contact?.emirate || ''}
                                    <br />
                                    United Arab Emirates
                                </p>
                            </section>

                            <section>
                                <h3>Totals</h3>

                                <p>
                                    Subtotal:{' '}
                                    {formatMoney(
                                        selectedOrder?.subtotal,
                                        selectedOrder?.currency
                                    )}
                                </p>

                                <p>
                                    Shipping:{' '}
                                    {formatMoney(
                                        selectedOrder?.shipping,
                                        selectedOrder?.currency
                                    )}
                                </p>

                                <p>
                                    <strong>Total:</strong>{' '}
                                    {formatMoney(
                                        selectedOrder?.total,
                                        selectedOrder?.currency
                                    )}
                                </p>
                            </section>
                        </div>

                        <section className="order-modal__items">
                            <h3>Items</h3>

                            {selectedOrder?.items?.map(
                                (item, index) => (
                                    <div
                                        className="order-modal__item"
                                        key={`${selectedOrder?._id}-${index}`}
                                    >
                                        {item?.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={
                                                    item?.productName ||
                                                    'Product'
                                                }
                                            />
                                        ) : (
                                            <span />
                                        )}

                                        <div>
                                            <strong>
                                                {item?.productName ||
                                                    'Unnamed Product'}
                                            </strong>

                                            <p>
                                                Qty{' '}
                                                {item?.quantity || 0}{' '}
                                                ·{' '}
                                                {formatMoney(
                                                    (item?.unitPrice ||
                                                        0) *
                                                        (item?.quantity ||
                                                            0),
                                                    item?.currency
                                                )}
                                            </p>

                                            {item?.variantSelections?.map(
                                                (
                                                    variant,
                                                    variantIndex
                                                ) => (
                                                    <small
                                                        key={`${variant?.groupName}-${variant?.optionName}-${variantIndex}`}
                                                    >
                                                        {
                                                            variant?.groupName
                                                        }
                                                        :{' '}
                                                        {
                                                            variant?.optionName
                                                        }
                                                    </small>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </section>
                    </div>
                </div>
            )}

            {deleteConfirmModal.show && (
                <div
                    className="modal-overlay"
                    onClick={cancelDeleteOrder}
                >
                    <div
                        className="modal-container"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: 'calc(100vw - 32px)',
                            padding: '24px 20px',
                        }}
                    >
                        <div className="modal-icon modal-icon-warning">
                            ?
                        </div>

                        <h3 className="modal-title">
                            Confirm Deletion
                        </h3>

                        <p className="modal-message">
                            Are you sure you want to delete order{' '}
                            {deleteConfirmModal.orderNumber}?
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'center',
                                marginTop: '20px',
                                flexWrap: 'wrap',
                            }}
                        >
                            <button
                                className="modal-button modal-button-cancel"
                                onClick={cancelDeleteOrder}
                                style={{
                                    background: '#888',
                                    minWidth: '100px',
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="modal-button modal-button-confirm"
                                onClick={handleDeleteOrder}
                                style={{
                                    background: '#d9383a',
                                    minWidth: '100px',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .orders-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .orders-filters {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .orders-tabs {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    flex-shrink: 0;
                }
            `}</style>
        </div>
    );
}