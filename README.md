# 🛡️ Edu-Voice: The Zero-Knowledge Campus Safety Platform 
### *2026 OPay Innovation Challenge Submission* 

![Status](https://img.shields.io/badge/Status-MVP_Ready-green)  ![Security](https://img.shields.io/badge/Security-RSA__2048-blue)  ![Auth](https://img.shields.io/badge/Auth-Stateless_OTP-purple)  ![Database](https://img.shields.io/badge/Database-TiDB_MySQL-orange)

## 📖 Project Overview 
**Edu-Voice** is a decentralized, anonymous whistleblowing infrastructure designed to combat victimization, harassment, and corruption in Nigerian tertiary institutions.  

Unlike standard reporting tools, Edu-Voice employs a **"Zero-Knowledge, Verified-Access"** architecture. This ensures that only legitimate students can use the platform (via institutional email verification), yet their identities remain mathematically irretrievable—even to the system administrators. 

--- 

## 🚀 The Core Problem 
In Nigerian universities, a "Culture of Silence" prevails. Students face: 
1.  **"Sex-for-Grades" & Victimization:** Fear of academic retaliation prevents reporting. 
2.  **Lack of Trust:** Existing channels (emails/boxes) are not truly anonymous. 
3.  **Bullying & Cultism:** Students prey on other students with no safe way to alert authorities. 

## 💡 The Solution: "Air-Locked" Anonymity 
Edu-Voice separates **Verification** from **Reporting**: 
* **Step 1:** Verifies the user owns a `.edu.ng` email via a one-time code. 
* **Step 2:** Deletes the email from memory and issues an anonymous "Access Token." 
* **Step 3:** The report is encrypted on the *client device* before submission, ensuring total privacy. 

--- 

## 🛠️ Technical Architecture 

### 1. The "Air-Lock" Verification Flow (Anti-Spam) 
To prevent outsiders from spamming the system, we use a **Stateless OTP** mechanism: 
- User enters school email -> System sends 6-digit OTP via **Nodemailer**. 
- User enters OTP -> System validates and issues a generic `Auth_Token`. 
- **Crucial:** The system immediately *purges* the link between the email and the token. 

### 2. Client-Side "Vaulting" (Encryption) 
All sensitive data (Perpetrator Name, Evidence, Description) is encrypted using **RSA-OAEP** logic within the browser using `node-forge`. 
- **Public Key:** Embedded in the app (Encrypts data). 
- **Private Key:** Held offline by the Ethics Committee (Decrypts data). 
- **Result:** The database stores only scrambled text (Ciphertext). 

--- 

## 📦 Features & Capabilities 

### 🔒 For Students (The Whistleblowers) 
* **Granular Reporting:** specific fields for *Faculty*, *Department*, *Offender Name*, and *Course Code* (e.g., "MTH 101"). 
* **The Panic Button:** A dedicated UI trigger that instantly redirects the screen to Wikipedia if an intruder enters the room. 
* **Evidence Locker:** Secure upload for screenshots/audio (metadata automatically stripped). 
* **Status Tracker:** Track case progress using an anonymous "Case ID." 

### 🛡️ For Administration (The Ethics Committee) 
* **Secure Access:** Login requires a verified `.edu.ng` email + OTP (No passwords). 
* **Decryption Portal:** Secure, local-only interface to decrypt reports using the private key.
* **Read-Only Integrity:** Reports cannot be deleted by admins to preserve audit trails.
* **Safety Heat-Maps:** Visual analytics showing high-risk zones (e.g., *"80% of bullying reports are from Hostel C"*). 

### 🔐 Enterprise-Grade Security (New!)
* **DDoS Protection:** Rate limiting restricts excessive requests (100 req/10min).
* **Header Hardening:** `Helmet` secures HTTP headers against sniffing/injection.
* **Input Sanitization:** `xss-clean` and `hpp` prevent script injection and parameter pollution.
* **Buffer Overflow Protection:** Payload limits set to 10kb.

--- 

## 💻 Tech Stack 

| Component | Technology | Purpose | 
| :--- | :--- | :--- | 
| **Frontend** | React.js (Vite) | Fast, responsive PWA interface. | 
| **Backend** | Node.js / Express | API routing and OTP logic. | 
| **Database** | TiDB (MySQL) + Sequelize | SQL Database for structured, encrypted data. | 
| **Security** | Node-Forge + Helmet/Rate-Limit | RSA-2048 encryption & API Defense. | 
| **Email** | Nodemailer | Handles OTP delivery to school emails. | 

--- 

## ⚙️ Installation & Setup 

**Prerequisites:** Node.js (v18+) and MySQL/TiDB. 

### 1. Clone the Repository 
```bash 
git clone https://github.com/your-username/edu-voice.git  
cd edu-voice
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create a `.env` file in the `backend` directory.
   - Add the following variables:
     ```env
     PORT=5000
     DB_HOST=your_tidb_host
     DB_USER=your_db_user
     DB_PASS=your_db_password
     DB_NAME=edu_voice
     DB_PORT=4000
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_app_password
     ```
4. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Key Generation (Admin Only)
To generate a new RSA Key Pair for encryption:
```bash
node backend/generateKeys.js
```
*This will create `public_key.js` (for frontend) and `private_key.pem` (keep safe!).*
