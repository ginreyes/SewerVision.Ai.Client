# 🔍 SewerVision.AI Client (Frontend)

The modern, role-based frontend application for **SewerVision.AI**, a comprehensive pipeline inspection and defect detection platform. Built with **Next.js 15**, **React 19**, and **Tailwind CSS**.

## 🚀 Features

*   **Role-Based Access Control (RBAC):** Distinct dashboards and workflows for:
    *   **Admin:** Full system oversight, user management, and analytics.
    *   **Operator:** Field operations, equipment tracking, and video upload.
    *   **QC Technician:** AI defect verification and PACP coding.
    *   **Customer:** Project tracking and report access.
*   **AI Visualization:** Interactive display of AI-detected defects (cracks, roots, etc.) with confidence scores and timeline views.
*   **PACP Reporting:** Generation of compliant inspection reports.
*   **Modern UI:** Responsive design using **Radix UI** primitives and **Tailwind CSS v4**.
*   **Data Visualization:** Interactive charts and graphs using **Chart.js**.

## 🛠️ Tech Stack

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Library:** [React 19](https://react.dev/)
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Forms:** React Hook Form + Zod
*   **Data:** TanStack Table

## 🏁 Getting Started

### Prerequisites

*   Node.js 18.17 or later
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ginreyes/SewerVision.Ai.Client.git
    cd concertina_front_end
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api  # Your Backend API URL
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_super_secret_key
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin dashboard routes
│   ├── operator/           # Operator dashboard routes
│   ├── qc-technician/      # QC dashboard routes
│   ├── customer/           # Customer portal routes
│   ├── login/              # Authentication pages
│   └── api/                # Next.js API routes (if any)
├── components/             # Reusable UI components
│   ├── ui/                 # Base UI elements (Buttons, Cards, etc.)
│   ├── tasks/              # Unified Task System components
│   └── notes/              # Unified Notes System components
├── lib/                    # Utility functions and helpers
├── data/                   # API service helpers (reportsApi.js, notesApi.js)
└── styles/                 # Global styles
```

## 📜 Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Runs the built production application.
*   `npm run lint`: Runs ESLint to check for code quality issues.

## 🤝 Contributing

1.  Create a feature branch (`git checkout -b feature/amazing-feature`).
2.  Commit your changes (`git commit -m 'feat: Add amazing feature'`).
3.  Push to the branch (`git push origin feature/amazing-feature`).
4.  Open a Pull Request.

## 📄 License

This project is proprietary and confidential. Unauthorized copying or distribution is strictly prohibited.
