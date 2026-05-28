import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-3 rounded-xl px-5 py-4 shadow-lg animate-slide-up ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-slate-900 text-white"
          }`}
          role="alert"
        >
          <span className="text-lg">{toast.type === "error" ? "✕" : "✓"}</span>
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

