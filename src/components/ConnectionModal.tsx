import { S3ConnectionData } from "@/lib/api/cloudStorage";
import { useState } from "react";
import { FiX, FiCloud, FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast";

interface ConnectionModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: S3ConnectionData) => Promise<void>;
}

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-west-1", "eu-west-2", "eu-central-1",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1",
  "sa-east-1"
];

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  show,
  onClose,
  onSubmit
}) => {
  const [form, setForm] = useState<S3ConnectionData>({
    name: "",
    accessKey: "",
    secretKey: "",
    bucket: "",
    region: "us-east-1",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (error) {
      toast.error("Failed to create connection");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto bg-gray-900/90 border-2 border-transparent bg-clip-padding rounded-2xl shadow-2xl p-8 flex flex-col gap-5 animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
          onClick={onClose}
          aria-label="Close"
          disabled={loading}
        >
          <FiX className="w-6 h-6" />
        </button>
        
        <h3 className="text-2xl font-semibold mb-2 text-white flex items-center gap-2">
          <FiCloud className="w-6 h-6 text-cyan-400" />
          Add New S3 Connection
        </h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Connection Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Production Storage"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
              required
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Access Key</label>
              <input
                type="text"
                name="accessKey"
                placeholder="AKIA..."
                value={form.accessKey}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Secret Key</label>
              <input
                type="password"
                name="secretKey"
                placeholder="••••••••"
                value={form.secretKey}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Bucket Name</label>
              <input
                type="text"
                name="bucket"
                placeholder="my-bucket"
                value={form.bucket}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Region</label>
              <select
                name="region"
                value={form.region}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                required
                disabled={loading}
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white mt-4 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Connection"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConnectionModal;