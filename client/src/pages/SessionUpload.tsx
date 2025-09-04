import { useState } from 'react';
import { api } from '../services/api';

const SessionUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.uploadSession(file);
      setSuccess('Session uploaded successfully!');
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Session Management</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Puppeteer Session</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="sessionFile"
            >
              Session File (ZIP format)
            </label>
            <input
              id="sessionFile"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected file: {file.name} (
                {(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Session'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">
            Session Information
          </h3>
          <p className="text-sm text-blue-700">
            Upload a ZIP file containing your Puppeteer browser profile. This
            will be used for all automated operations.
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm text-blue-700">
            <li>The ZIP should contain the entire user profile directory</li>
            <li>Include cookies, local storage, and other session data</li>
            <li>
              Ensure the profile is from a compatible browser version of chrome
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SessionUpload;
