import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Upload, X } from 'lucide-react';

export default function PhotoUpload({ currentUrl, clientId, onUpdate, size = 'lg' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const isLarge = size === 'lg';
  const dimension = isLarge ? '120px' : '40px';
  const borderRadius = isLarge ? 'var(--radius-lg)' : 'var(--radius-md)';

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      if (clientId) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({ photo_url: publicUrl })
          .eq('id', clientId);
        if (updateError) throw updateError;

        await supabase.from('activity_log').insert({
          event_type: 'photo_uploaded',
          client_id: clientId,
          details: `Photo uploaded: ${fileName}`,
        });
      }

      if (onUpdate) onUpdate(publicUrl);
    } catch (err) {
      alert('Upload failed: ' + err.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || currentUrl;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width: dimension,
          height: dimension,
          borderRadius,
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
          border: '2px solid var(--border-light)',
          background: 'var(--bg-input)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Camera size={isLarge ? 32 : 16} style={{ color: 'var(--text-muted)' }} />
        )}

        {/* Overlay on hover */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
        >
          {uploading ? (
            <div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
          ) : (
            <Upload size={isLarge ? 24 : 14} style={{ color: 'white' }} />
          )}
        </div>
      </div>
    </div>
  );
}
