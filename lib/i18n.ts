export type Language = "ar" | "en";

export interface Translations {
  // Navigation & Tabs
  "nav.chat": string;
  "nav.upload": string;
  "nav.documents": string;
  "nav.admin": string;
  "nav.overview": string;
  "nav.users": string;
  "nav.settings": string;

  // Authentication
  "auth.login": string;
  "auth.register": string;
  "auth.logout": string;
  "auth.email": string;
  "auth.password": string;
  "auth.signIn": string;
  "auth.createAccount": string;
  "auth.noAccount": string;
  "auth.hasAccount": string;
  "auth.forgotPassword": string;

  // Document Management
  "doc.upload": string;
  "doc.title": string;
  "doc.titleOptional": string;
  "doc.emirateScope": string;
  "doc.emirateScopeOptional": string;
  "doc.authorityName": string;
  "doc.authorityNameOptional": string;
  "doc.selectFile": string;
  "doc.uploading": string;
  "doc.uploadSuccess": string;
  "doc.uploadError": string;
  "doc.duplicateFile": string;
  "doc.fileTooLarge": string;
  "doc.unsupportedType": string;
  "doc.delete": string;
  "doc.deleteConfirm": string;
  "doc.deleteSuccess": string;
  "doc.deleteError": string;

  // Chat Interface
  "chat.placeholder": string;
  "chat.send": string;
  "chat.thinking": string;
  "chat.error": string;

  // Admin Dashboard
  "admin.totalDocuments": string;
  "admin.totalUsers": string;
  "admin.recentUploads": string;
  "admin.activeUsers": string;
  "admin.documentsByStatus": string;
  "admin.openaiSettings": string;
  "admin.vectorStoreId": string;
  "admin.apiKeyStatus": string;
  "admin.configured": string;
  "admin.notConfigured": string;
  "admin.supabaseSettings": string;
  "admin.supabaseUrl": string;
  "admin.supabaseAnonKey": string;
  "admin.description": string;

  // Time & Date
  "time.date": string;
  "time.time": string;
  "time.today": string;
  "time.yesterday": string;
  "time.thisWeek": string;
  "time.lastWeek": string;
  "time.thisMonth": string;
  "time.lastMonth": string;

  // Status & Messages
  "status.processing": string;
  "status.ready": string;
  "status.error": string;
  "status.pending": string;
  "status.completed": string;

  // Form Labels
  "form.required": string;
  "form.optional": string;
  "form.submit": string;
  "form.reset": string;
  "form.validation": string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    // Navigation & Tabs
    "nav.chat": "المحادثة",
    "nav.upload": "رفع",
    "nav.documents": "المستندات",
    "nav.admin": "الإدارة",
    "nav.overview": "نظرة عامة",
    "nav.users": "المستخدمين",
    "nav.settings": "الإعدادات",

    // Authentication
    "auth.login": "تسجيل الدخول",
    "auth.register": "إنشاء حساب",
    "auth.logout": "خروج",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.signIn": "دخول",
    "auth.createAccount": "إنشاء حساب جديد",
    "auth.noAccount": "ليس لديك حساب؟",
    "auth.hasAccount": "لديك حساب بالفعل؟",
    "auth.forgotPassword": "نسيت كلمة المرور؟",

    // Document Management
    "doc.upload": "رفع مستند جديد",
    "doc.title": "العنوان",
    "doc.titleOptional": "العنوان (اختياري)",
    "doc.emirateScope": "نطاق الإمارة",
    "doc.emirateScopeOptional": "نطاق الإمارة (اختياري)",
    "doc.authorityName": "اسم الجهة",
    "doc.authorityNameOptional": "اسم الجهة (اختياري)",
    "doc.selectFile": "اسحب وأسقط الملف هنا أو انقر للاختيار",
    "doc.uploading": "جاري الرفع",
    "doc.uploadSuccess": "تم رفع المستند بنجاح",
    "doc.uploadError": "فشل الرفع",
    "doc.duplicateFile": "ملف مكرر",
    "doc.fileTooLarge": "حجم الملف كبير جداً",
    "doc.unsupportedType": "نوع الملف غير مدعوم",
    "doc.delete": "حذف",
    "doc.deleteConfirm": "هل أنت متأكد من حذف هذا المستند؟",
    "doc.deleteSuccess": "تم حذف المستند بنجاح",
    "doc.deleteError": "فشل حذف المستند",

    // Chat Interface
    "chat.placeholder": "اطرح سؤالك هنا",
    "chat.send": "إرسال",
    "chat.thinking": "جاري التفكير",
    "chat.error": "حدث خطأ في الإجابة",

    // Admin Dashboard
    "admin.totalDocuments": "إجمالي المستندات",
    "admin.totalUsers": "إجمالي المستخدمين",
    "admin.recentUploads": "الرفعات الأخيرة",
    "admin.activeUsers": "المستخدمين النشطين",
    "admin.documentsByStatus": "المستندات حسب الحالة",
    "admin.openaiSettings": "إعدادات OpenAI",
    "admin.vectorStoreId": "معرف متجر المتجهات",
    "admin.apiKeyStatus": "حالة مفتاح API",
    "admin.configured": "مُكوَّن",
    "admin.notConfigured": "غير مُكوَّن",
    "admin.supabaseSettings": "إعدادات Supabase",
    "admin.supabaseUrl": "رابط Supabase",
    "admin.supabaseAnonKey": "مفتاح Supabase العام",
    "admin.description": "إدارة نظام DiwanGPT والتحكم في المستندات والمستخدمين",

    // Time & Date
    "time.date": "التاريخ",
    "time.time": "الوقت",
    "time.today": "اليوم",
    "time.yesterday": "أمس",
    "time.thisWeek": "هذا الأسبوع",
    "time.lastWeek": "الأسبوع الماضي",
    "time.thisMonth": "هذا الشهر",
    "time.lastMonth": "الشهر الماضي",

    // Status & Messages
    "status.processing": "جاري المعالجة",
    "status.ready": "جاهز",
    "status.error": "خطأ",
    "status.pending": "في الانتظار",
    "status.completed": "مكتمل",

    // Form Labels
    "form.required": "مطلوب",
    "form.optional": "اختياري",
    "form.submit": "إرسال",
    "form.reset": "إعادة تعيين",
    "form.validation": "التحقق من صحة البيانات",
  },
  en: {
    // Navigation & Tabs
    "nav.chat": "Chat",
    "nav.upload": "Upload",
    "nav.documents": "Documents",
    "nav.admin": "Admin",
    "nav.overview": "Overview",
    "nav.users": "Users",
    "nav.settings": "Settings",

    // Authentication
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.signIn": "Sign In",
    "auth.createAccount": "Create Account",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.forgotPassword": "Forgot password?",

    // Document Management
    "doc.upload": "Upload New Document",
    "doc.title": "Title",
    "doc.titleOptional": "Title (Optional)",
    "doc.emirateScope": "Emirate Scope",
    "doc.emirateScopeOptional": "Emirate Scope (Optional)",
    "doc.authorityName": "Authority Name",
    "doc.authorityNameOptional": "Authority Name (Optional)",
    "doc.selectFile": "Drag and drop file here or click to select",
    "doc.uploading": "Uploading",
    "doc.uploadSuccess": "Document uploaded successfully",
    "doc.uploadError": "Upload failed",
    "doc.duplicateFile": "Duplicate file",
    "doc.fileTooLarge": "File size too large",
    "doc.unsupportedType": "Unsupported file type",
    "doc.delete": "Delete",
    "doc.deleteConfirm": "Are you sure you want to delete this document?",
    "doc.deleteSuccess": "Document deleted successfully",
    "doc.deleteError": "Failed to delete document",

    // Chat Interface
    "chat.placeholder": "Ask your question...",
    "chat.send": "Send",
    "chat.thinking": "Thinking...",
    "chat.error": "An error occurred",

    // Admin Dashboard
    "admin.totalDocuments": "Total Documents",
    "admin.totalUsers": "Total Users",
    "admin.recentUploads": "Recent Uploads",
    "admin.activeUsers": "Active Users",
    "admin.documentsByStatus": "Documents by Status",
    "admin.openaiSettings": "OpenAI Settings",
    "admin.vectorStoreId": "Vector Store ID",
    "admin.apiKeyStatus": "API Key Status",
    "admin.configured": "Configured",
    "admin.notConfigured": "Not configured",
    "admin.supabaseSettings": "Supabase Settings",
    "admin.supabaseUrl": "Supabase URL",
    "admin.supabaseAnonKey": "Supabase Anon Key",
    "admin.description": "Manage DiwanGPT system, documents, and users",

    // Time & Date
    "time.date": "Date",
    "time.time": "Time",
    "time.today": "Today",
    "time.yesterday": "Yesterday",
    "time.thisWeek": "This Week",
    "time.lastWeek": "Last Week",
    "time.thisMonth": "This Month",
    "time.lastMonth": "Last Month",

    // Status & Messages
    "status.processing": "Processing",
    "status.ready": "Ready",
    "status.error": "Error",
    "status.pending": "Pending",
    "status.completed": "Completed",

    // Form Labels
    "form.required": "Required",
    "form.optional": "Optional",
    "form.submit": "Submit",
    "form.reset": "Reset",
    "form.validation": "Validation",
  },
};

// Helper function to get translation
export function t(key: keyof Translations, language: Language): string {
  return translations[language][key] || key;
}

// Helper function to get current language from localStorage or default
export function getCurrentLanguage(): Language {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("diwangpt-language") as Language;
    return saved || "ar"; // Default to Arabic
  }
  return "ar";
}

// Helper function to save language preference
export function setCurrentLanguage(language: Language): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("diwangpt-language", language);
  }
}
