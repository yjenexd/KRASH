# KRASH

**An accessibility app that visualises sound for deaf and hard-of-hearing users.**

KRASH calibrates real-world sounds, detects them in real-time via your device's microphone, and provides immediate, colour-coded visual feedback. It is designed to bridge the sensory gap by translating auditory signals into visual cues.

## Tech Stack

- **Frontend:** React 19 (TypeScript) with Vite
- **Backend:** Node.js & Express.js (RESTful API)
- **Detection Algorithm:** MFCC feature extraction + DTW matching (Client-side processing)
- **Styling:** CSS

## Key Features

- **Custom Sound Calibration:** Record and calibrate specific real-world sounds.
- **Real-Time Detection:** Instant microphone monitoring and matching.
- **Visual Feedback:** Distinct, colour-coded alerts for recognised sounds.
- **Sound Library:** Manage and organize your calibrated sound profiles.
- **History Tracking:** Log of past detections for review.
- **User Personalisation:** Settings for sensitivity and preferences.
- **Cross-Platform:** Responsive design optimized for both mobile and desktop.
- **Multi-language Support:** Accessible in multiple languages.

---

## Setup

1. Download the files
    ```makefile
    git clone https://github.com/yourusername/KRASH.git
    cd KRASH
    ```

2. Database setup

      a. Create the database
      ```
      psql -U postgres
      CREATE DATABASE sonicsight;
      \q
      ```


3. Backend Setup (Node.js)

      a. Ensure you have **Node.js (v20+)** installed.
       ```
       cd backend
       cp .env.example .env
       ```
    
      b. Open backend/.env and fill in your Postgres credentials:

     ```
        DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/sonicsight
      PORT=5001
      NODE_ENV=development
      FRONTEND_URL=http://localhost:5173
      ```
      c. Install dependencies and run the server
      
      ```makefile
      npm install
      node server.js
      npm run dev
      ```
      d. backend should now be running at ```http://localhost:5001```

5. Frontend Setup

      a. Open a second terminal:
     ```
     cd frontend
    cp .env.example .env
    npm install
    npm run dev
    ```
      
      b.Frontend will be running at http://localhost:5173.
