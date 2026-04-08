# Mozhi Aruvi - Premium Tamil Learning Platform

Mozhi Aruvi (மொழி அருவி) is an advanced, AI-powered language learning platform dedicated to mastering Tamil. It combines structured curriculum, community engagement, and AI-driven linguistic assistance to provide an unparalleled educational journey.

---

## 🚀 Key Features
- **AI Linguistic Expert**: 24/7 doubt solving powered by Google Gemini.
- **Dynamic Curriculum**: Leveled lessons (Basic to Advanced) with interactive tracking.
- **Tutor Marketplace**: Book 1:1 sessions or 8-class mastery bundles with native experts.
- **Community Events**: Join live cultural workshops and webinars.
- **Gamified Progress**: Earn XP, Power, and Credits as you learn.
- **Multi-Tenant Portals**: Dedicated dashboards for Admins, Teachers, and Students.

---

## 🛠 Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB/Mongoose.
- **Integrations**: 
  - **Stripe Connect**: Marketplace payments & subscriptions.
  - **Google Gemini**: AI educational engine.
  - **Cloudinary**: Media asset management.
  - **Nodemailer**: Automated Gmail communications.

---

## 🏗 Project Structure
```text
mozhi-aruvi/
├── Backend/           # Express API, Mongoose Models, Cron Jobs
├── Frontend/          # Next.js 15 App, Tailwind Components
├── .git/              # Version Control
└── project_overview.md # Detailed Technical Report
```

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Stripe Account (for payments)
- Cloudinary Account (for media)

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd mozhi-aruvi
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   # Create a .env file based on the provided sample
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   # Create a .env.local file
   npm run dev
   ```

---

## 🤖 AI & Automation
The platform uses **node-cron** to automate:
- Monthly reset of tutor support limits.
- Daily retention nudges for inactive users.
- Automated payment verification pulse.

---

## 📄 License
This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 🤝 Contributing
Contributions are welcome! Please follow the standard fork-and-pull-request workflow.

*Built with ❤️ for the Tamil Learning Community.*
**Owner & Lead Architect: Ajiththika**
