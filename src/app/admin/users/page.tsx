'use client';
import React, { useEffect, useState } from 'react';
import styles from '../properties/properties.module.css'; // Reuse table styles
import { createClient } from '@/lib/supabase/client';

export default function UsersPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            if (data) {
                setUsers(data);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    return (
        <div>
            <h1 className={styles.title} style={{ marginBottom: '2rem' }}>User Management</h1>

            <div className={styles.tableCard}>
                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Business (NEQ)</th>
                                <th>Documents</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan={6} className={styles.empty}>No users found</td></tr>
                            ) : (
                                users.map(u => (
                                    <tr key={u.id}>
                                        <td><div className={styles.propName}>{u.full_name || 'N/A'}</div></td>
                                        <td>{u.email}</td>
                                        <td>{u.phone_number || '-'}</td>
                                        <td>{u.business_number || '-'}</td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ color: u.documents?.identity_proof ? 'green' : 'red' }}>ID: {u.documents?.identity_proof ? '✓' : '✗'}</span>
                                                <span style={{ color: u.documents?.void_cheque ? 'green' : 'red' }}>Void: {u.documents?.void_cheque ? '✓' : '✗'}</span>
                                                <span style={{ color: u.documents?.insurance_proof ? 'green' : 'red' }}>Ins: {u.documents?.insurance_proof ? '✓' : '✗'}</span>
                                                <span style={{ color: u.documents?.citq_certificate ? 'green' : 'red' }}>CITQ: {u.documents?.citq_certificate ? '✓' : '✗'}</span>
                                                <span style={{ color: u.documents?.tax_confirmation ? 'green' : 'red' }}>Tax: {u.documents?.tax_confirmation ? '✓' : '✗'}</span>
                                            </div>
                                        </td>
                                        <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
