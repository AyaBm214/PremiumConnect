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
                                            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div>ID: {u.documents?.identity_proof ? <a href={u.documents.identity_proof} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 500 }}>Download</a> : <span style={{ color: 'red', fontWeight: 'bold' }}>✗</span>}</div>
                                                <div>Void: {u.documents?.void_cheque ? <a href={u.documents.void_cheque} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 500 }}>Download</a> : <span style={{ color: 'red', fontWeight: 'bold' }}>✗</span>}</div>
                                                <div>Ins: {u.documents?.insurance_proof ? <a href={u.documents.insurance_proof} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 500 }}>Download</a> : <span style={{ color: 'red', fontWeight: 'bold' }}>✗</span>}</div>
                                                <div>CITQ: {u.documents?.citq_certificate ? <a href={u.documents.citq_certificate} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline', fontWeight: 500 }}>Download</a> : <span style={{ color: 'red', fontWeight: 'bold' }}>✗</span>}</div>
                                                <div style={{ color: u.documents?.tax_confirmation ? 'green' : 'red', marginTop: '2px' }}>Tax: {u.documents?.tax_confirmation ? '✓' : '✗'}</div>
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
