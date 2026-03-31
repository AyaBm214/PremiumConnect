"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './HostawayRequests.module.css';

interface HostawayRequest {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  property_name: string;
  request_date: string;
  status: 'requested' | 'in_progress' | 'completed';
  hostaway_password?: string;
}

export default function AdminHostawayRequests() {
  const [requests, setRequests] = useState<HostawayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'requested' | 'in_progress' | 'completed'>('all');
  
  // Modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const supabase = createClient();
  const { t } = useLanguage();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hostaway_requests')
        .select('*')
        .order('request_date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching Hostaway requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string, extraData: any = {}) => {
    try {
      const { error } = await supabase
        .from('hostaway_requests')
        .update({ status: newStatus, ...extraData })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: newStatus as any, ...extraData } : req
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status. Please try again.');
    }
  };

  const handleComplete = async () => {
    if (!selectedRequestId || !password.trim()) {
      alert("Please provide the credentials.");
      return;
    }
    setSubmitting(true);
    
    const request = requests.find(r => r.id === selectedRequestId);

    await updateStatus(selectedRequestId, 'completed', { hostaway_password: password });

    // Trigger completion notification API
    try {
      await fetch('/api/hostaway-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: request?.client_name,
          client_email: request?.client_email,
          password: password
        }),
      });
    } catch (err) {
      console.error('Error sending completion notification:', err);
    }

    setSubmitting(false);
    setShowCompleteModal(false);
    setPassword('');
    setSelectedRequestId(null);
  };

  const handleResend = async (request: HostawayRequest) => {
    if (!request.hostaway_password) return;
    
    try {
      await fetch('/api/hostaway-completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: request.client_name,
          client_email: request.client_email,
          password: request.hostaway_password
        }),
      });
      alert('Email resent successfully!');
    } catch (err) {
      console.error('Error resending email:', err);
      alert('Failed to resend email.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(t('admin.details.delete_confirm'));
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('hostaway_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.filter(req => req.id !== id));
      alert(t('admin.details.delete_success'));
    } catch (err) {
      console.error('Error deleting request:', err);
      alert(t('admin.details.delete_error'));
    }
  };

  const filteredRequests = requests.filter(req => 
    activeTab === 'all' ? true : req.status === activeTab
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested': return <span className={`${styles.badge} ${styles.requested}`}>Requested</span>;
      case 'in_progress': return <span className={`${styles.badge} ${styles.inProgress}`}>In Progress</span>;
      case 'completed': return <span className={`${styles.badge} ${styles.completed}`}>Completed</span>;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Hostaway Access Requests</h1>
        <p className={styles.subtitle}>Manage client requests for Hostaway dashboard access.</p>
      </header>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`} onClick={() => setActiveTab('all')}>All ({requests.length})</button>
        <button className={`${styles.tab} ${activeTab === 'requested' ? styles.activeTab : ''}`} onClick={() => setActiveTab('requested')}>Requested ({requests.filter(r => r.status === 'requested').length})</button>
        <button className={`${styles.tab} ${activeTab === 'in_progress' ? styles.activeTab : ''}`} onClick={() => setActiveTab('in_progress')}>In Progress ({requests.filter(r => r.status === 'in_progress').length})</button>
        <button className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`} onClick={() => setActiveTab('completed')}>Completed ({requests.filter(r => r.status === 'completed').length})</button>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loading}>Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className={styles.empty}>No requests found for this status.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Property</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id}>
                  <td className={styles.clientName}>{req.client_name}</td>
                  <td className={styles.clientEmail}>{req.client_email}</td>
                  <td className={styles.propertyName}>{req.property_name}</td>
                  <td className={styles.date}>{new Date(req.request_date).toLocaleDateString()}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>
                    <div className={styles.actions}>
                      {req.status === 'requested' && (
                        <Button size="sm" onClick={() => updateStatus(req.id, 'in_progress')}>
                          {t('admin.hostaway.start')}
                        </Button>
                      )}
                      {(req.status === 'requested' || req.status === 'in_progress') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setSelectedRequestId(req.id);
                            setShowCompleteModal(true);
                          }}
                        >
                          {t('admin.hostaway.complete')}
                        </Button>
                      )}
                      {req.status === 'completed' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span className={styles.doneLabel}>Process Finished</span>
                          {req.hostaway_password ? (
                            <>
                              <code className={styles.passwordPeek}>PWD: {req.hostaway_password}</code>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <Button size="sm" variant="outline" onClick={() => handleResend(req)}>
                                  {t('admin.hostaway.resend')}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setSelectedRequestId(req.id);
                                    setPassword(req.hostaway_password || '');
                                    setShowCompleteModal(true);
                                  }}
                                >
                                  {t('admin.details.edit')}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="primary" 
                              onClick={() => {
                                setSelectedRequestId(req.id);
                                setShowCompleteModal(true);
                              }}
                            >
                              + {t('hostaway.copy').replace('Copy', 'Add Password').replace('Copier', 'Ajouter MDP')}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDelete(req.id)}
                        style={{ marginTop: 'auto' }}
                      >
                        {t('admin.details.delete_prop').replace('Property', 'Request').replace('la propriété', 'la demande')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCompleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Provide Credentials</h3>
            <p className={styles.modalText}>
              Please enter the Hostaway password for this client. 
              It will be displayed on their dashboard and sent via email.
            </p>
            <input 
              type="text" 
              className={styles.modalInput}
              placeholder="Enter Hostaway Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <div className={styles.modalActions}>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCompleteModal(false);
                  setPassword('');
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={submitting || !password.trim()}
              >
                {submitting ? 'Updating...' : 'Complete & Notify'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
