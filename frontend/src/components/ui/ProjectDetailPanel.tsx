/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { useState, useRef } from "react";
import { X, CheckCircle2, Circle, Trash2, Plus, Briefcase, Paperclip, FileText, Loader2, Eye } from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Project, Task, Attachment } from "@/types";

interface ProjectDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onRefresh: () => void;
}

export default function ProjectDetailPanel({ isOpen, onClose, project, onRefresh }: ProjectDetailPanelProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !project) return null;

  // FUNGSI TASK (TO-DO LIST)
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsLoadingTask(true);
    try {
      const res = await fetch("http://localhost:8080/api/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify({ project_id: project.id, title: newTaskTitle }),
      });
      if (!res.ok) throw new Error("Gagal menambah tugas");
      setNewTaskTitle("");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoadingTask(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      await fetch(`http://localhost:8080/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify({ is_done: !task.is_done }),
      });
      onRefresh();
    } catch (err) {
      toast.error("Gagal mengubah status tugas");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      onRefresh();
    } catch (err) {
      toast.error("Gagal menghapus tugas");
    }
  };

  // --- FUNGSI ATTACHMENT (UPLOAD FILE) ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Gunakan FormData untuk mengirim file fisik
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:8080/api/projects/${project.id}/attachments`, {
        method: "POST",
        headers: {
          // Jangan set Content-Type untuk FormData, biarkan browser yang atur boundary-nya!
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mengunggah file");
      toast.success("File berhasil dilampirkan!");
      onRefresh(); // Tarik ulang data agar file muncul di UI
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  const handleDeleteAttachment = async (id: number) => {
    if (!confirm("Hapus lampiran ini?")) return;
    try {
      await fetch(`http://localhost:8080/api/attachments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      toast.success("Lampiran dihapus");
      onRefresh();
    } catch (err) {
      toast.error("Gagal menghapus lampiran");
    }
  };

  // Kalkulasi Progres Task
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t) => t.is_done).length || 0;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full md:w-112.5 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
        {/* HEADER PANEL */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 rounded">{project.category}</span>
              <span className="text-xs font-medium text-gray-500">• {project.status}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{project.title}</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Briefcase size={14} /> {project.client?.company || "Proyek Internal"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 bg-white rounded-full shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* AREA KONTEN (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* --- BAGIAN 1: TO-DO LIST --- */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Daftar Pekerjaan (To-Do)</h3>
              <span className="text-xs font-medium text-blue-600">{progressPercent}% Selesai</span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Tugas baru..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button type="submit" disabled={isLoadingTask || !newTaskTitle} className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-2">
              {project.tasks?.map((task) => (
                <div key={task.id} className="group flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleToggleStatus(task)}>
                    {task.is_done ? <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : <Circle size={18} className="text-gray-300 shrink-0" />}
                    <span className={`text-sm ${task.is_done ? "line-through text-gray-400" : "text-gray-700"}`}>{task.title}</span>
                  </div>
                  <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {(!project.tasks || project.tasks.length === 0) && <p className="text-center text-sm text-gray-400 py-4 border-2 border-dashed rounded-lg">Belum ada tugas.</p>}
            </div>
          </div>

          {/* --- BAGIAN 2: LAMPIRAN FILE --- */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Lampiran & Dokumen</h3>

              {/* Tombol Upload Tersembunyi (Trigger lewat onClick) */}
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 disabled:opacity-50">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                {isUploading ? "Mengunggah..." : "Upload File"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {project.attachments?.map((file: Attachment) => {
                // Tentukan ikon berdasarkan ekstensi file
                const isImage = file.file_type.match(/\.(jpeg|jpg|gif|png|webp)$/i);

                return (
                  <div key={file.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-all group bg-white">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* PREVIEW GAMBAR ATAU IKON DOKUMEN */}
                      {isImage ? (
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="shrink-0 block" title="Lihat Gambar Penuh">
                          <img src={file.file_url} alt={file.file_name} className="w-10 h-10 object-cover rounded-md border border-gray-200 hover:opacity-80 transition" />
                        </a>
                      ) : (
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                          <FileText size={20} />
                        </div>
                      )}

                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-800 truncate" title={file.file_name}>
                          {file.file_name}
                        </p>
                        <p className="text-xs text-gray-400">{file.file_type.toUpperCase().replace(".", "")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* TOMBOL REVIEW/LIHAT (Buka di Tab Baru) */}
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title={isImage ? "Lihat Penuh" : "Baca Dokumen"}>
                        <Eye size={16} />
                      </a>

                      <button onClick={() => handleDeleteAttachment(file.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!project.attachments || project.attachments.length === 0) && (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                  <Paperclip size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Belum ada file yang diunggah.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
