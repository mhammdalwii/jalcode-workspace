interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: (data: any) => void;
  isEditMode: boolean;
}

export default function TeamModal({ isOpen, onClose, onSubmit, isSubmitting, formData, setFormData, isEditMode }: TeamModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900">{isEditMode ? "Edit Anggota" : "Tambah Anggota Baru"}</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" required className="w-full px-3 py-2 border rounded-lg text-black" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Divisi / Role</label>
            <select className="w-full px-3 py-2 border rounded-lg text-black" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="Founder">Founder</option>
              <option value="Admin">Admin & Social Media Manager</option>
              <option value="Mobile Application Engineer">Mobile Application Engineer</option>
              <option value="Visual Designer">Visual Designer</option>
              <option value="Product Designer">Product Designer</option>
              <option value="Web Engineer Backend">Backend</option>
              <option value="Web Engineer Frontend">Frontend</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-3 py-2 border rounded-lg text-black" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password {isEditMode && "(Kosongkan jika tidak diganti)"}</label>
            <input type="password" required={!isEditMode} minLength={6} className="w-full px-3 py-2 border rounded-lg text-black" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg hover:bg-gray-50 text-gray-800">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
