import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useClients(filters = {}) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });

      if (filters.gender) query = query.eq('gender', filters.gender);
      if (filters.payment_status) query = query.eq('payment_status', filters.payment_status);
      if (filters.profile_status) query = query.eq('profile_status', filters.profile_status);
      if (filters.match_status) query = query.eq('match_status', filters.match_status);
      if (filters.bureau_type) query = query.eq('bureau_type', filters.bureau_type);
      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,unique_code.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setClients(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.gender, filters.payment_status, filters.profile_status, filters.match_status, filters.bureau_type, filters.search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clients, loading, error, refetch: fetchClients };
}

export function useClient(id) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;
      setClient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return { client, loading, error, refetch: fetchClient };
}

export async function updateClientField(id, field, value) {
  const { data, error } = await supabase
    .from('clients')
    .update({ [field]: value })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function generateUniqueCode(gender, bureauType, sourceBureau) {
  const startNum = bureauType === 'own' ? 100 : 600;
  const bureau = bureauType === 'own' ? 'SVMB' : sourceBureau;
  const genderPrefix = gender === 'Male' ? 'M' : 'F';

  let query = supabase
    .from('clients')
    .select('id_number')
    .eq('gender', gender);

  if (bureauType === 'own') {
    query = query.eq('bureau_type', 'own');
  } else {
    query = query.eq('source_bureau', bureau);
  }

  const { data, error } = await query.order('id_number', { ascending: false }).limit(1);
  if (error) throw error;

  const maxNum = data && data.length > 0 ? data[0].id_number : startNum;
  const nextNum = maxNum + 1;
  const uniqueCode = `${bureau}-${genderPrefix}-${nextNum}`;

  return { uniqueCode, idNumber: nextNum };
}

export async function createClient(clientData) {
  const { uniqueCode, idNumber } = await generateUniqueCode(
    clientData.gender,
    clientData.bureau_type || 'own',
    clientData.source_bureau || 'SVMB'
  );

  const record = {
    ...clientData,
    unique_code: clientData.gender ? uniqueCode : 'PENDING',
    id_number: clientData.gender ? idNumber : 0,
    bureau_type: clientData.bureau_type || 'own',
    source_bureau: clientData.source_bureau || 'SVMB',
    payment_status: clientData.payment_status || 'Not Paid',
    profile_status: clientData.profile_status || 'Active',
    match_status: clientData.match_status || 'Unmatched',
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(record)
    .select()
    .single();
  if (error) throw error;

  // Log the event
  await supabase.from('activity_log').insert({
    event_type: 'profile_created',
    client_id: data.id,
    details: `Profile created: ${data.unique_code} - ${data.first_name} ${data.last_name || ''}`.trim(),
  });

  return data;
}

export async function deleteClient(id) {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

export function getClientStats(clients) {
  const total = clients.length;
  const male = clients.filter(c => c.gender === 'Male').length;
  const female = clients.filter(c => c.gender === 'Female').length;
  const own = clients.filter(c => c.bureau_type === 'own').length;
  const partner = clients.filter(c => c.bureau_type === 'partner').length;
  const paid = clients.filter(c => c.payment_status === 'Paid').length;
  const notPaid = clients.filter(c => c.payment_status === 'Not Paid').length;
  const active = clients.filter(c => c.profile_status === 'Active').length;
  const inactive = clients.filter(c => c.profile_status === 'Inactive').length;
  const married = clients.filter(c => c.profile_status === 'Married').length;
  const unmatched = clients.filter(c => c.match_status === 'Unmatched').length;
  const profilesSent = clients.filter(c => c.match_status === 'Profiles Sent').length;
  const meetingScheduled = clients.filter(c => c.match_status === 'Meeting Scheduled').length;
  const matchMarried = clients.filter(c => c.match_status === 'Married').length;
  const missingPhoto = clients.filter(c => !c.photo_url).length;
  const missingGender = clients.filter(c => !c.gender).length;

  return {
    total, male, female, own, partner,
    paid, notPaid,
    active, inactive, married,
    unmatched, profilesSent, meetingScheduled, matchMarried,
    missingPhoto, missingGender,
  };
}

export function exportClientsCSV(clients) {
  const headers = [
    'Unique Code', 'Name', 'Gender', 'Date of Birth', 'Birth Time',
    'Place of Birth', 'Rashi', 'Height', 'Education', 'Religion', 'Caste',
    'Address', 'Phone', 'Father Name', 'Father Occupation',
    'Mother Name', 'Mother Occupation', 'Siblings',
    'Bureau', 'Bureau Type', 'Payment Status', 'Profile Status',
    'Match Status', 'Photo URL', 'Notes'
  ];

  const rows = clients.map(c => [
    c.unique_code,
    `${c.first_name} ${c.last_name || ''}`.trim(),
    c.gender || '',
    c.dob || '',
    c.birth_time || '',
    c.place_of_birth || '',
    c.rashi || '',
    c.height || '',
    c.education || '',
    c.religion || '',
    c.caste || '',
    `"${(c.address || '').replace(/"/g, '""')}"`,
    c.phone || '',
    c.father_name || '',
    c.father_occupation || '',
    c.mother_name || '',
    c.mother_occupation || '',
    `"${(c.siblings || '').replace(/"/g, '""')}"`,
    c.source_bureau || '',
    c.bureau_type || '',
    c.payment_status || '',
    c.profile_status || '',
    c.match_status || '',
    c.photo_url || '',
    `"${(c.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `svmb-clients-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
