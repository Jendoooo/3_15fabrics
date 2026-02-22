'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase';
import type { Contact } from '@/lib/types';
import { format } from 'date-fns';

export default function AdminContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterSource, setFilterSource] = useState('all');

    // WhatsApp Broadcast state
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
    const [sending, setSending] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const load = async () => {
        setLoading(true);
        const { data } = await supabaseBrowser
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });
        setContacts((data ?? []) as Contact[]);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const filteredContacts = contacts.filter((c) =>
        filterSource === 'all' ? true : c.source === filterSource
    );

    const contactsWithWhatsapp = filteredContacts.filter(c => !!c.whatsapp_number);

    const toggleSelect = (id: string) => {
        setSelectedContacts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedContacts.size === contactsWithWhatsapp.length) {
            setSelectedContacts(new Set());
        } else {
            setSelectedContacts(new Set(contactsWithWhatsapp.map(c => c.id)));
        }
    };

    const exportCSV = () => {
        const headers = ['First Name', 'Last Name', 'Email', 'WhatsApp', 'Source', 'Subscribed', 'Date'];
        const rows = filteredContacts.map(c => [
            c.first_name ?? '',
            c.last_name ?? '',
            c.email ?? '',
            c.whatsapp_number ?? '',
            c.source ?? 'unknown',
            c.subscribed ? 'Yes' : 'No',
            new Date(c.created_at).toISOString()
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `iby_contacts_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const sendBroadcast = async () => {
        if (selectedContacts.size === 0) return setStatusMsg('Select at least one contact.');
        if (!broadcastMessage.trim()) return setStatusMsg('Enter a message to send.');

        setSending(true);
        setStatusMsg('');

        const token = process.env.NEXT_PUBLIC_FONNTE_TOKEN;
        if (!token) {
            setStatusMsg('Error: Fonnte token not configured');
            setSending(false);
            return;
        }

        const targets = contactsWithWhatsapp
            .filter(c => selectedContacts.has(c.id))
            .map(c => c.whatsapp_number)
            .join(',');

        try {
            const resp = await fetch('https://api.fonnte.com/send', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    target: targets,
                    message: broadcastMessage,
                    delay: 3,
                    countryCode: '234'
                })
            });

            const data = await resp.json();
            if (data.status) {
                setStatusMsg('Broadcast sent successfully!');
                setBroadcastMessage('');
                setSelectedContacts(new Set());
            } else {
                setStatusMsg(`Failed to send: ${data.reason}`);
            }
        } catch (err: unknown) {
            setStatusMsg(`Error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setSending(false);
        }
    };

    const sources = ['all', 'waitlist', 'newsletter', 'checkout', 'footer', 'walk_in'];

    return (
        <div className="p-5 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-light uppercase tracking-widest">Contacts</h1>
                <button
                    onClick={exportCSV}
                    className="bg-neutral-100 px-4 py-2 text-xs uppercase tracking-widest text-black hover:bg-neutral-200"
                >
                    Export CSV
                </button>
            </div>

            <section className="bg-white border border-neutral-200 p-5 space-y-4">
                <h2 className="text-xs uppercase tracking-widest text-neutral-500">WhatsApp Broadcast</h2>
                <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Type your broadcast message here..."
                    rows={3}
                    className="w-full border border-neutral-300 p-2.5 text-sm focus:border-black focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        {selectedContacts.size} contacts selected for broadcast
                    </p>
                    <div className="flex items-center gap-4">
                        {statusMsg && (
                            <span className={`text-xs ${statusMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                                {statusMsg}
                            </span>
                        )}
                        <button
                            onClick={sendBroadcast}
                            disabled={sending || selectedContacts.size === 0 || !broadcastMessage}
                            className="bg-green-600 px-6 py-2 text-xs uppercase tracking-widest text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-center gap-4">
                    <span className="text-xs uppercase tracking-widest text-neutral-500">Filter by Source:</span>
                    <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="border border-neutral-300 bg-white p-2 text-sm focus:border-black focus:outline-none"
                    >
                        {sources.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto border border-neutral-200">
                    <table className="w-full text-left text-sm bg-white">
                        <thead className="bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4"
                                        checked={contactsWithWhatsapp.length > 0 && selectedContacts.size === contactsWithWhatsapp.length}
                                        onChange={selectAll}
                                        disabled={contactsWithWhatsapp.length === 0}
                                    />
                                </th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">WhatsApp</th>
                                <th className="p-4">Source</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {loading ? (
                                <tr><td colSpan={6} className="p-4 text-center text-neutral-400">Loading...</td></tr>
                            ) : filteredContacts.length === 0 ? (
                                <tr><td colSpan={6} className="p-4 text-center text-neutral-400">No contacts found</td></tr>
                            ) : (
                                filteredContacts.map(c => (
                                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="p-4 text-center">
                                            {c.whatsapp_number ? (
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={selectedContacts.has(c.id)}
                                                    onChange={() => toggleSelect(c.id)}
                                                />
                                            ) : (
                                                <span title="No WhatsApp number" className="text-neutral-300">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}` : '-'}
                                        </td>
                                        <td className="p-4 text-neutral-600">{c.email ?? '-'}</td>
                                        <td className="p-4 font-mono">{c.whatsapp_number ?? '-'}</td>
                                        <td className="p-4">
                                            <span className="bg-neutral-100 px-2 py-1 text-[10px] uppercase tracking-widest rounded-sm">
                                                {c.source?.replace('_', ' ') ?? 'unknown'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-neutral-500">
                                            {format(new Date(c.created_at), 'MMM d, yyyy')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
