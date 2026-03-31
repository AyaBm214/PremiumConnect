"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './HostawayHeaderItem.module.css';

interface HostawayRequest {
  id: string;
  status: 'requested' | 'in_progress' | 'completed';
  hostaway_password?: string;
}

export default function HostawayHeaderItem() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [request, setRequest] = useState<HostawayRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    fetchRequest();

    // Subscribe to real-time updates for this user's Hostaway request
    const channel = supabase
      .channel(`hostaway-request-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hostaway_requests',
          filter: `client_id=eq.${user.id}`
        },
        () => {
          // Re-fetch on any change to get the latest sorted result
          fetchRequest();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchRequest = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('hostaway_requests')
      .select('id, status, hostaway_password')
      .eq('client_id', user.id)
      .order('request_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) {
      setRequest(data);
    } else {
      console.error('Error fetching Hostaway request:', error);
    }
  };

  const handleRequest = async () => {
    if (!user) return;
    setSubmitting(true);

    const clientName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown';
    const clientEmail = user.email || '';
    
    const { data, error } = await supabase
      .from('hostaway_requests')
      .insert({
        client_id: user.id,
        client_name: clientName,
        client_email: clientEmail,
        property_name: 'Main Account',
        status: 'requested'
      })
      .select()
      .single();

    if (!error && data) {
      setRequest(data);
      setShowModal(false);
      
      // Notify admin
      fetch('/api/hostaway-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: user.id,
          client_name: clientName,
          client_email: clientEmail,
          property_name: 'Main Account'
        }),
      }).catch(console.error);
    }
    setSubmitting(false);
  };

  const renderButton = () => {
    if (!request) {
      return (
        <Button variant="outline" onClick={() => setShowModal(true)}>
          🔑 {t('hostaway.request_btn')}
        </Button>
      );
    }

    if (request.status === 'requested') {
      return (
        <div className={styles.statusBadge}>
          <span className={styles.icon}>⏳</span>
          {t('hostaway.pending')}
        </div>
      );
    }

    if (request.status === 'in_progress') {
      return (
        <div className={styles.statusBadge}>
          <span className={styles.icon}>⚙️</span>
          {t('hostaway.in_progress')}
        </div>
      );
    }

    if (request.status === 'completed') {
      return (
        <div className={styles.completedGroup}>
          <div className={`${styles.statusBadge} ${styles.success}`}>
            <span className={styles.icon}>✅</span>
            {t('hostaway.completed')}
          </div>
          {request.hostaway_password && (
            <div className={styles.passwordPop}>
              <code>{request.hostaway_password}</code>
              <button 
                className={styles.copyTiny} 
                onClick={() => {
                  navigator.clipboard.writeText(request.hostaway_password!);
                  alert(t('hostaway.copied'));
                }}
              >
                {t('hostaway.copy')}
              </button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderButton()}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{t('hostaway.modal.title')}</h3>
            <p className={styles.modalText}>{t('hostaway.modal.text')}</p>
            <div className={styles.modalActions}>
              <Button onClick={() => setShowModal(false)} variant="outline" disabled={submitting}>
                {t('hostaway.modal.cancel')}
              </Button>
              <Button onClick={handleRequest} variant="primary" disabled={submitting}>
                {submitting ? '...' : t('hostaway.modal.yes')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
