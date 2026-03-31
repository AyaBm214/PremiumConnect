"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import styles from './HostawayRequest.module.css';

interface HostawayRequest {
  id: string;
  status: 'requested' | 'in_progress' | 'completed';
  client_name: string;
  client_email: string;
  property_name: string;
  hostaway_password?: string;
}

export default function HostawayRequestSection() {
  const { user } = useAuth();
  const [request, setRequest] = useState<HostawayRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchRequest();
    }
  }, [user]);

  const fetchRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('hostaway_requests')
        .select('*')
        .eq('client_id', user?.id)
        .maybeSingle();

      if (!error && data) {
        setRequest(data);
      }
    } catch (err) {
      console.error('Error fetching Hostaway request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // Get property name from context or use a default
      // In a real app, you might let the user choose which property/account
      const clientName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown';
      const clientEmail = user.email || '';
      
      const { data, error } = await supabase
        .from('hostaway_requests')
        .insert({
          client_id: user.id,
          client_name: clientName,
          client_email: clientEmail,
          property_name: 'Main Account', // Default
          status: 'requested'
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setRequest(data);
        setShowModal(false);
        
        // Trigger email notification
        try {
          await fetch('/api/hostaway-request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: user.id,
              client_name: clientName,
              client_email: clientEmail,
              property_name: 'Main Account'
            }),
          });
        } catch (emailErr) {
          console.error('Error sending notification email:', emailErr);
          // Don't block the UI if email fails
        }
      }
    } catch (err) {
      console.error('Error creating Hostaway request:', err);
      alert('Error creating request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loader}>Loading Hostaway status...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.textSection}>
          <h3 className={styles.title}>Hostaway Access</h3>
          <p className={styles.description}>
            Request your professional dashboard access to manage your properties on Hostaway.
          </p>
        </div>

        <div className={styles.actionSection}>
          {!request && (
            <Button onClick={() => setShowModal(true)} variant="primary">
              Request Hostaway Access
            </Button>
          )}

          {request?.status === 'requested' && (
            <div className={styles.statusBox}>
              <span className={styles.statusIcon}>⏳</span>
              <span className={styles.statusText}>Hostaway access is being prepared</span>
            </div>
          )}

          {request?.status === 'in_progress' && (
            <div className={styles.statusBox}>
              <span className={styles.statusIcon}>⚙️</span>
              <span className={styles.statusText}>Our team is creating your access...</span>
            </div>
          )}

          {request?.status === 'completed' && (
            <div className={styles.completedContainer}>
              <div className={`${styles.statusBox} ${styles.completed}`}>
                <span className={styles.statusIcon}>✅</span>
                <span className={styles.statusText}>Hostaway access sent to your email</span>
              </div>
              
              {request.hostaway_password && (
                <div className={styles.credentialsBox}>
                  <div className={styles.credentialItem}>
                    <span className={styles.credentialLabel}>Password:</span>
                    <code className={styles.credentialValue}>{request.hostaway_password}</code>
                  </div>
                  <button 
                    className={styles.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText(request.hostaway_password || '');
                      alert('Password copied to clipboard!');
                    }}
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Hostaway Access Request</h3>
            <p>Do you want us to create your Hostaway access? This will allow you to sync with platforms and manage bookings.</p>
            <div className={styles.modalActions}>
              <Button onClick={() => setShowModal(false)} variant="outline" disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={handleRequest} variant="primary" disabled={submitting}>
                {submitting ? 'Requesting...' : 'Yes, Request Access'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
