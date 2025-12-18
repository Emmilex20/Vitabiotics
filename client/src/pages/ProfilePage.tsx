import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [healthGoals, setHealthGoals] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setHealthGoals((user.healthGoals || []).join(', '));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      if (!updateProfile) throw new Error('Update not available');
      await updateProfile({
        firstName,
        lastName,
        healthGoals: healthGoals.split(',').map(s => s.trim()).filter(Boolean),
      });
      setStatus('Profile updated successfully');
      // toast success
      (await import('react-hot-toast')).default.success('Profile updated');
    } catch (err: any) {
      setStatus(err.message || 'Failed to update profile');
      (await import('react-hot-toast')).default.error(err.message || 'Failed to update profile');
    }
  };

  // Upload avatar to Cloudinary and set local avatar preview
  const uploadAvatar = async (file: File) => {
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setStatus('Cloudinary not configured');
      return null;
    }

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', UPLOAD_PRESET as string);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: form,
      });

      const body = await res.json();
      return body.secure_url;
    } catch (err) {
      console.error('Avatar upload failed', err);
      setStatus('Avatar upload failed');
      return null;
    }
  };

  // Crop image to square center using canvas and return a Blob
  const cropImageToSquare = (file: File, size = 800): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const smallest = Math.min(img.width, img.height);
        const sx = (img.width - smallest) / 2;
        const sy = (img.height - smallest) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, sx, sy, smallest, smallest, 0, 0, size, size);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.9);
      };
      img.onerror = (err) => reject(err);
      img.src = URL.createObjectURL(file);
    });
  };

  if (!user) return <div className="p-8">Please login to view your profile.</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-white text-2xl font-bold">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-vita-primary to-vita-secondary text-white font-bold">
                {user.firstName ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}` : 'U'}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Change Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // validations
                if (!file.type.startsWith('image/')) {
                  setStatus('Please select an image file');
                  (await import('react-hot-toast')).default.error('Please select an image file');
                  return;
                }
                const MAX_MB = 2;
                if (file.size > MAX_MB * 1024 * 1024) {
                  setStatus('Image is too large (max 2MB)');
                  (await import('react-hot-toast')).default.error('Image is too large (max 2MB)');
                  return;
                }

                setStatus('Preparing avatar...');
                (await import('react-hot-toast')).default.loading('Preparing avatar...');
                try {
                  const croppedBlob = await cropImageToSquare(file, 800);
                  const croppedFile = new File([croppedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
                  setStatus('Uploading avatar...');
                  const url = await uploadAvatar(croppedFile);
                  if (url) {
                    await updateProfile?.({ avatarUrl: url });
                    setStatus('Avatar updated');
                    (await import('react-hot-toast')).default.success('Avatar updated');
                  }
                } catch (err: any) {
                  console.error(err);
                  setStatus(err?.message || 'Failed to upload avatar');
                  (await import('react-hot-toast')).default.error(err?.message || 'Failed to upload avatar');
                }
              }}
              className="mt-2"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {status && (
          <div className="mb-4 p-3 text-sm text-gray-700 bg-gray-100 rounded">{status}</div>
        )}

        <form onSubmit={handleSave} className="max-w-xl bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 p-2 w-full border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 p-2 w-full border rounded" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input value={user.email} disabled className="mt-1 p-2 w-full border rounded bg-gray-50" />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Health Goals (comma separated)</label>
            <input value={healthGoals} onChange={e => setHealthGoals(e.target.value)} className="mt-1 p-2 w-full border rounded" />
          </div>

          <div className="mt-6 flex items-center justify-end">
            <button type="submit" className="px-5 py-2 bg-vita-primary text-white rounded hover:bg-vita-primary/90">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
