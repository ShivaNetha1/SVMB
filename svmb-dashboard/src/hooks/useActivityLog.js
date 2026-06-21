import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useActivityLog(filters = {}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('activity_log')
        .select(`
          *,
          client:client_id (id, unique_code, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setLogs(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.eventType, filters.clientId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const logEvent = async ({ eventType, clientId, telegramMessage, details }) => {
    const { error } = await supabase.from('activity_log').insert({
      event_type: eventType,
      client_id: clientId || null,
      telegram_message: telegramMessage || null,
      details,
    });
    if (error) throw error;
    fetchLogs();
  };

  return { logs, loading, error, logEvent, refetch: fetchLogs };
}
