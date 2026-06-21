import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select(`
          *,
          male_client:male_client_id (id, unique_code, first_name, last_name, photo_url, education, dob, height),
          female_client:female_client_id (id, unique_code, first_name, last_name, photo_url, education, dob, height)
        `)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setMatches(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const createMatch = async (maleClientId, femaleClientId) => {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        male_client_id: maleClientId,
        female_client_id: femaleClientId,
        suggested_date: new Date().toISOString().split('T')[0],
        male_response: 'Pending',
        female_response: 'Pending',
        outcome: 'Pending',
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from('activity_log').insert({
      event_type: 'match_created',
      details: `Match created between male client ${maleClientId} and female client ${femaleClientId}`,
    });

    fetchMatches();
    return data;
  };

  const updateMatch = async (id, updates) => {
    const { data, error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    fetchMatches();
    return data;
  };

  const deleteMatch = async (id) => {
    const { error } = await supabase.from('matches').delete().eq('id', id);
    if (error) throw error;
    fetchMatches();
  };

  return { matches, loading, error, createMatch, updateMatch, deleteMatch, refetch: fetchMatches };
}
