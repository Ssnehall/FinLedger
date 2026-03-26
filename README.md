# 💰 FinLedger: Secure Banking & Double-Entry Ledger System

![FinLedger Banner](https://img.shields.io/badge/Fintech-Secure_Banking-6366f1?style=for-the-badge&logo=bank-of-america&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

FinLedger is a robust, full-stack banking application designed with a focus on **Financial Integrity** and **Security**. It implements a strict double-entry ledger system, ensuring that every cent is accounted for and that transactions are atomic and idempotent.

---

## 🚀 Key Features

### 🔐 Security & Integrity
*   **Double-Entry Ledger**: Every transaction creates balanced Debit and Credit entries across accounts, ensuring mathematical consistency.
*   **Atomic Transactions**: Powered by MongoDB Sessions—if one part of a transfer fails, the entire operation rolls back.
*   **Idempotency Protection**: Every transfer requires a unique Client-Side Key, preventing accidental double charges from network retries.
*   **JWT Authentication**: Secure identity management with token blacklisting on logout.

### 📧 Notifications & UX
*   **Transactional Emails**: Automated welcome and transaction alerts via Gmail OAuth2.
*   **Modern Fintech UI**: A sleek, dark-themed dashboard built with React and custom-tailored CSS variables.
*   **Real-time Balance Logic**: Balances are dynamically computed from the ledger, providing a "single source of truth."

---

## 🛠️ Tech Stack

**Frontend:**
*   React 19 (Vite)
*   React Router 7
*   Custom CSS Var-based Theme (Dark Mode)

**Backend:**
*   Node.js & Express
*   MongoDB (Atlas) with Mongoose
*   Nodemailer (OAuth2 Gmail Transport)
*   JWT & BcryptJS

---

## ⚙️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account
*   Google Cloud Console Project (for Email OAuth2)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/FinLedger.git
    cd FinLedger
    ```

2.  **Backend Setup**
    ```bash
    cd backend-ledger
    npm install
    # Create a .env file based on .env.example
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

---

## 🔑 Environment Variables

To run the backend, you must configure a `.env` file in the `backend-ledger` directory with the following keys:

| Key | Description |
| :--- | :--- |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A secure string for signing tokens |
| `EMAIL_USER` | The Gmail address used for sending notifications |
| `CLIENT_ID` | Google OAuth2 Client ID |
| `CLIENT_SECRET` | Google OAuth2 Client Secret |
| `REFRESH_TOKEN` | Google OAuth2 Refresh Token |

---

## 📂 Project Structure

```text
Transactions/
├── backend-ledger/       # Node.js API
│   ├── src/
│   │   ├── controllers/  # 10-Step Transfer Logic
│   │   ├── models/       # Ledger & Transaction Schemas
│   │   └── services/     # Email & Utility Services
├── frontend/             # React Application
│   ├── src/
│   │   ├── components/   # Reusable UI Elements
│   │   └── pages/        # Dashboard, Login, Transactions
```

## 🛡️ The 10-Step Transfer Flow
FinLedger follows a strict sequence for every transfer:
1. Validate Request 2. Check Idempotency 3. Verify Account Status 4. Compute Live Balance 5. Start DB Session 6. Create Pending Transaction 7. Record DEBIT 8. Record CREDIT 9. Commit & Mark Complete 10. Send Email Notification.

---


