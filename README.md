# 🛡️ Edu-Voice: The Zero-Knowledge Campus Safety Platform 
 ### *2026 OPay Innovation Challenge Submission* 
  
 ![Status](https://img.shields.io/badge/Status-MVP_Ready-green)  ![Security](https://img.shields.io/badge/Security-RSA__2048-blue)  ![Auth](https://img.shields.io/badge/Auth-Stateless_OTP-purple)  
  
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
  
 ### 📊 For Administration (The Ethics Committee) 
 * **Safety Heat-Maps:** Visual analytics showing high-risk zones (e.g., *"80% of bullying reports are from Hostel C"*). 
 * **Decryption Portal:** A secure, local-only interface to unlock and read reports. 
  
 --- 
  
 ## 💻 Tech Stack 
  
 | Component | Technology | Purpose | 
 | :--- | :--- | :--- | 
 | **Frontend** | React.js (Vite) | Fast, responsive PWA interface. | 
 | **Backend** | Node.js / Express | API routing and OTP logic. | 
 | **Database** | MongoDB (Atlas) | Stores encrypted blobs and anonymous tokens. | 
 | **Security** | Node-Forge | Implements RSA-2048 encryption. | 
 | **Email** | Nodemailer | Handles OTP delivery to school emails. | 
  
 --- 
  
 ## ⚙️ Installation & Setup 
  
 **Prerequisites:** Node.js (v18+) and MongoDB installed. 
  
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
     MONGO_URI=your_mongodb_connection_string
     EMAIL_USER=your_email@edu.ng
     EMAIL_PASS=your_email_password
     ```
4. Start the server:
   ```bash
   npm run dev
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
