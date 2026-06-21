import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          client:client_id (id, unique_code, first_name, last_name, payment_status)
        `)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setPayments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const recordPayment = async ({ clientId, amount, paidDate, paymentMode, receiptNote, newStatus }) => {
    // Insert payment record
    const { error: payError } = await supabase.from('payments').insert({
      client_id: clientId,
      amount,
      paid_date: paidDate,
      payment_mode: paymentMode,
      receipt_note: receiptNote,
    });
    if (payError) throw payError;

    // Update client payment status
    const status = newStatus || 'Paid';
    const { error: updateError } = await supabase
      .from('clients')
      .update({ payment_status: status })
      .eq('id', clientId);
    if (updateError) throw updateError;

    // Log event
    await supabase.from('activity_log').insert({
      event_type: 'payment_recorded',
      client_id: clientId,
      details: `Payment of ₹${amount} recorded via ${paymentMode}. Status: ${status}`,
    });

    fetchPayments();
  };

  return { payments, loading, error, recordPayment, refetch: fetchPayments };
}
