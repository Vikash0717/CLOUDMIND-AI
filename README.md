# CloudMind AI

CloudMind AI is a full-stack SaaS storage dashboard. It revolutionizes file management with AI auto-categorization, semantic search, duplicate file prevention, secure email sharing, and dynamic real-time analytics. Built for performance with React, Node.js, and Prisma ORM.

## 🚀 Key Features

*   **AI Auto-Categorization (Smart Folders):** Intelligently analyzes and automatically sorts uploaded files into contextual categories (Finance, Education, Work, Personal, Code), eliminating the need for manual organization.
*   **AI-Powered Semantic Search:** Goes beyond standard keyword matching. Users can search for files using natural language queries to find exact documents based on their context and content.
*   **Duplicate File Detection:** Maintains storage efficiency and data integrity by automatically detecting and preventing the upload of duplicate files for authenticated users.
*   **Secure File Sharing & Email Delivery:** Allows users to effortlessly share files via secure, downloadable links. Integrated with Nodemailer for direct and professional email sharing functionality.
*   **Real-time Storage Analytics:** Provides an intuitive, interactive dashboard displaying visual metrics on storage usage, file types, and activity trends.

## 🛠️ Technology Stack

### Frontend
*   **Framework:** React 18 with Vite
*   **Styling:** Tailwind CSS & Emotion
*   **UI Components:** Radix UI Primitives, Material UI (MUI), Embla Carousel
*   **Data Visualization:** Recharts
*   **Forms & Validation:** React Hook Form

### Backend
*   **Framework:** Node.js & Express
*   **Database ORM:** Prisma
*   **Authentication:** JSON Web Tokens (JWT) & bcryptjs
*   **File Handling:** Multer
*   **AI Integrations:** OpenAI SDK
*   **Email & Sharing:** Nodemailer

## ⚙️ Local Setup & Installation

Follow these steps to run the project locally on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd "SaaS Dashboard UI Design final(v1)"
```

### 2. Install Dependencies
You need to install dependencies for both the frontend and the backend.

```bash
# Install frontend dependencies in the root directory
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration
You need `.env` files in both your root directory (for the frontend) and inside the `/server` directory (for the backend). 

**In `/server/.env`**:
```env
# Database connection string (adjust depending on your SQL database)
DATABASE_URL="your_database_url_here"

# Authentication Secret
JWT_SECRET="your_jwt_secret_here"

# OpenAI for AI Search & Categorization
OPENAI_API_KEY="your_openai_api_key_here"

# Email Configuration for File Sharing
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_app_password"
```

**In `/.env` (Root Directory)**:
```env
# URL for the backend API
VITE_API_URL="http://localhost:5000/api"
```

### 4. Database Setup
Run the Prisma migrations to set up your database schema.
```bash
cd server
npx prisma generate
npx prisma db push
cd ..
```

### 5. Running the Application
You can start both the React frontend and the Express backend simultaneously using the concurrent script set up in the root `package.json`.

```bash
npm run dev
```

*   The frontend will open at: `http://localhost:5173`
*   The backend runs on: `http://localhost:5000`

---
*Built with ❤️ for Modern Web Development*