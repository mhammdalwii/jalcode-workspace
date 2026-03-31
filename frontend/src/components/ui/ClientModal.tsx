import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Client } from "@/types";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: Client | null;
}

export default function ClientModal({ isOpen, onClose, onSuccess, editData }: ClientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Isi form otomatis jika dalam mode Edit
  useEffect(() => {
    if (editData) {
      setFormData({
        company: editData.company,
        name: editData.name,
        email: editData.email || "",
        phone: editData.phone || "",
        address: editData.address || "",
      });
    } else {
      setFormData({ company: "", name: "", email: "", phone: "", address: "" });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editData ? `http://localhost:8080/api/clients/${editData.id}` : "http://localhost:8080/api/clients/";
      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data klien");

      toast.success(`Klien berhasil ${editData ? "diperbarui" : "ditambahkan"}!`);
      onSuccess();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-gray-900">{editData ? "Edit Data Klien" : "Tambah Klien Baru"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan / Instansi *</label>
            <input type="text" required className="w-full px-3 py-2 border rounded-lg text-black" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama PIC (Kontak Utama) *</label>
            <input type="text" required className="w-full px-3 py-2 border rounded-lg text-black" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full px-3 py-2 border rounded-lg text-black" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp/Telepon</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg text-black" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea className="w-full px-3 py-2 border rounded-lg text-black h-20" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}></textarea>
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
