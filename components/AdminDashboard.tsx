"use client";

import { useState, useEffect } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Document {
  id: string;
  title: string;
  file_path: string;
  status: string;
  uploaded_at: string;
  emirate_scope?: string;
  authority_name?: string;
  openai_file_id?: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface Analytics {
  totalDocuments: number;
  totalUsers: number;
  documentsByStatus: Record<string, number>;
  recentUploads: Document[];
  activeUsers: User[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load documents
      const { data: docs } = await supabaseAdmin
        .from("documents")
        .select("*")
        .order("uploaded_at", { ascending: false });

      // Load users (simplified - in real app you'd have a users table)
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      
      const docsByStatus = docs.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setAnalytics({
        totalDocuments: docs.length,
        totalUsers: authUsers.users.length,
        documentsByStatus: docsByStatus,
        recentUploads: docs.slice(0, 5),
        activeUsers: authUsers.users.slice(0, 5),
      });

      setDocuments(docs);
      setUsers(authUsers.users);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      const { error } = await supabaseAdmin
        .from("documents")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Reload data
      loadAnalytics();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const tabs = [
    { id: "overview", label: "نظرة عامة / Overview", icon: "📊" },
    { id: "documents", label: "إدارة المستندات / Documents", icon: "📄" },
    { id: "users", label: "إدارة المستخدمين / Users", icon: "👥" },
    { id: "analytics", label: "التحليلات / Analytics", icon: "📈" },
    { id: "settings", label: "الإعدادات / Settings", icon: "⚙️" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">جاري التحميل... / Loading...</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          لوحة الإدارة / Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إدارة نظام DiwanGPT والتحكم في المستندات والمستخدمين / Manage DiwanGPT system, documents, and users
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="ml-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activeTab === "overview" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">نظرة عامة / Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics?.totalDocuments || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  إجمالي المستندات / Total Documents
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analytics?.documentsByStatus.ready || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  مستندات جاهزة / Ready Documents
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analytics?.documentsByStatus.processing || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  قيد المعالجة / Processing
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics?.totalUsers || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  إجمالي المستخدمين / Total Users
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">آخر المستندات المرفوعة / Recent Uploads</h3>
                <div className="space-y-3">
                  {analytics?.recentUploads.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <div className="font-medium">{doc.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        doc.status === 'ready' ? 'bg-green-100 text-green-800' :
                        doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">المستخدمون النشطون / Active Users</h3>
                <div className="space-y-3">
                  {analytics?.activeUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          {user.last_sign_in_at ? 
                            new Date(user.last_sign_in_at).toLocaleDateString('ar-SA') :
                            'لم يسجل دخول / Never signed in'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">إدارة المستندات / Document Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                رفع مستند جديد / Upload New Document
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      العنوان / Title
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الحالة / Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الإمارة / Emirate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تاريخ الرفع / Upload Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الإجراءات / Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {doc.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          doc.status === 'ready' ? 'bg-green-100 text-green-800' :
                          doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {doc.emirate_scope || 'غير محدد / Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(doc.uploaded_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف / Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">إدارة المستخدمين / User Management</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      البريد الإلكتروني / Email
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تاريخ التسجيل / Registration Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      آخر تسجيل دخول / Last Sign In
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الحالة / Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(user.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.last_sign_in_at ? 
                          new Date(user.last_sign_in_at).toLocaleDateString('ar-SA') :
                          'لم يسجل دخول / Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                          نشط / Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">التحليلات / Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">توزيع المستندات / Document Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analytics?.documentsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">إحصائيات النظام / System Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>إجمالي المستندات / Total Documents:</span>
                    <span className="font-bold">{analytics?.totalDocuments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>إجمالي المستخدمين / Total Users:</span>
                    <span className="font-bold">{analytics?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>معدل النجاح / Success Rate:</span>
                    <span className="font-bold">
                      {analytics?.totalDocuments ? 
                        Math.round(((analytics.documentsByStatus.ready || 0) / analytics.totalDocuments) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">إعدادات النظام / System Settings</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">إعدادات OpenAI / OpenAI Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vector Store ID</label>
                    <input 
                      type="text" 
                      value={process.env.NEXT_PUBLIC_OPENAI_VECTOR_STORE_ID || 'Not configured'}
                      disabled
                      className="w-full p-2 border rounded bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key Status</label>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      {process.env.OPENAI_API_KEY ? 'مُكوَّن / Configured' : 'غير مُكوَّن / Not configured'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">إعدادات قاعدة البيانات / Database Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Supabase Status</label>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      متصل / Connected
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">إجمالي السجلات / Total Records</label>
                    <span className="font-bold">{analytics?.totalDocuments || 0} مستندات / documents</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">إجراءات النظام / System Actions</h3>
                <div className="space-y-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    تصدير البيانات / Export Data
                  </button>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 ml-3">
                    تنظيف البيانات / Cleanup Data
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-3">
                    إعادة تشغيل النظام / Restart System
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
