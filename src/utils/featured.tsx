import { FiCloud, FiMail, FiLock, FiCode, FiDatabase, FiCpu, FiZap } from "react-icons/fi";

export const featuredUtils = [
  {
    title: "Cloud Storage",
    description: "S3, R2, and GCS integrations with drag-and-drop UI",
    icon: <FiCloud className="w-8 h-8" />,
    gradient: "from-blue-600 to-indigo-600",
    link:  "/utils/cloud-storage"
  },
  {
    title: "Email API",
    description: "Send transactional emails with built-in templates",
    icon: <FiMail className="w-8 h-8" />,
    gradient: "from-rose-600 to-pink-600",
    link: "/utils/email-api"
  },
  {
    title: "Auth Toolkit",
    description: "OTP, JWT, and session management",
    icon: <FiLock className="w-8 h-8" />,
    gradient: "from-emerald-600 to-teal-600",
    link: "/utils/auth-toolkit"
  },
  {
    title: "Code Gen AI",
    description: "AI-powered code snippets and transformations",
    icon: <FiCode className="w-8 h-8" />,
    gradient: "from-purple-600 to-violet-600",
    link: "/utils/code-gen-ai"
  },
  {
    title: "Data Utilities",
    description: "CSV/JSON transformers and validators",
    icon: <FiDatabase className="w-8 h-8" />,
    gradient: "from-amber-600 to-orange-600",
    link: "/utils/data-utilities"
  },
  {
    title: "System Tools",
    description: "Process management and automation",
    icon: <FiCpu className="w-8 h-8" />,
    gradient: "from-cyan-600 to-sky-600",
    link: "/utils/system-tools"
  }
];