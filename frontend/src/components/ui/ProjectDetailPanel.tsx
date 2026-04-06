import { useState } from "react";
import { X, CheckCircle2, Circle, Trash2, Plus, Briefcase } from "lucide-react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Project, Task } from "@/types";

interface ProjectDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onRefresh: () => void; // Untuk me-refresh data di background
}

export default function ProjectDetailPanel({ isOpen, onClose, project, onRefresh }: ProjectDetailPanelProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !project) return null;

  //  Fungsi Tambah Tugas
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify({ project_id: project.id, title: newTaskTitle }),
      });
      if (!res.ok) throw new Error("Gagal menambah tugas");

      setNewTaskTitle("");
      onRefresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  //  Fungsi Centang (Ubah Status Tugas)
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

  // Fungsi Hapus Tugas
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

  // Hitung progres (persentase)
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t) => t.is_done).length || 0;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />

      {/* Slide-Over Panel */}
      <div className="fixed inset-y-0 right-0 w-full md:w-112.5 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0">
        {/* Header Panel */}
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

        {/* Konten To-Do List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Daftar Pekerjaan (To-Do)</h3>
              <span className="text-xs font-medium text-blue-600">{progressPercent}% Selesai</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>

            {/* Form Tambah Tugas */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Tugas baru..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button type="submit" disabled={isLoading || !newTaskTitle} className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">
                <Plus size={18} />
              </button>
            </form>

            {/* List Tugas */}
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

              {(!project.tasks || project.tasks.length === 0) && <p className="text-center text-sm text-gray-400 py-6 border-2 border-dashed rounded-lg">Belum ada tugas. Tambahkan satu!</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
