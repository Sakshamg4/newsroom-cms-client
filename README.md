📰Newsroom CMS
A simple **role-based Newsroom CMS** built using **Node.js, Express, MongoDB, and React (Vite)**.  
This system allows Writers to create and submit articles, Editors to review and approve/reject them, Readers to view published articles, and Admins to manage roles and users.
---

🚀 Features

- 🔐 JWT Authentication & Role-Based Access
- 🧑‍💻 User Roles: Admin, Editor, Writer, Reader
- ✍️ Writers create and submit articles to Editors
- 🗞️ Editors approve or reject articles (with comments)
- 👀 Readers can view approved/published articles
- ⚙️ Admins can manage users and roles
- 🧩 Article Workflow → Draft → Submitted → Approved / Rejected

---

🧠 Tech Stack

| Layer | Technology |
|--------|-------------|
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Frontend | React (Vite), Axios |
| Authentication | JWT (jsonwebtoken) |
| Styling | Tailwind CSS |

---

## ⚙️ Installation & Setup

### 🧩 1. Clone the repository
```bash
git clone <your-repo-url>
cd newsroom-cms
⚙️ 2. Backend Setup
bash
Copy code
cd server
npm install
Create .env in /server
ini
Copy code
BASE_URL=http://localhost:4000
MONGO_URL='mongodb+srv://saksamguptabgmi4:saksamguptabgmi4@cluster0saksham.76ghyhz.mongodb.net/newsroom?appName=Cluster0Saksham/'
JWT=enjoyingthebackendandlearing
PORT=4000
Run the backend
bash
Copy code
npm run dev
Server runs on → http://localhost:4000

💻 3. Frontend Setup
bash
Copy code
cd ../client
npm install
npm run dev
Frontend runs on → http://localhost:5173

Create .env in /client
bash
Copy code
VITE_API_URL=http://localhost:4000/api
🌱 Database Seeder (Test Users & Articles)
To populate the database with test users and articles, run:

bash
Copy code
cd server
node seed-test.js
✅ The seed creates:
Users

Role	Email	Password
Admin	admin@test.com	pass123
Editor	editor@test.com	pass123
Writer	writer@test.com	pass123
Reader	reader@test.com	pass123

Articles

Title	Status
Seed: Draft Article	Draft
Seed: Submitted Article	Submitted
Seed: Rejected Article	Rejected
Seed: Approved Article	Approved

🔑 Test Credentials
Role	Email	Password	Permissions
🧑‍💻 Admin	admin@test.com	pass123	Manage users, roles, approved articles
🧑‍🏫 Editor	editor@test.com	pass123	Review, approve/reject articles
✍️ Writer	writer@test.com	pass123	Create, edit, submit articles
👀 Reader	reader@test.com	pass123	View approved articles

📡 API Endpoints
🔐 Auth
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login & get JWT token

📰 Articles
Method	Endpoint	Role	Description
POST	/api/articles/create	Writer	Create or submit article
GET	/api/articles/mine	Writer	View own articles
PUT	/api/articles/:id	Writer	Edit or resubmit rejected/draft article
GET	/api/articles/assigned	Editor	View submitted articles assigned to them
POST	/api/articles/:id/review	Editor	Approve or reject article
GET	/api/articles/approved	Reader	View approved articles (with ?q= search)

👥 Users & Admin
Method	Endpoint	Role	Description
GET	/api/users/list	Admin, Editor	View all users
GET	/api/users/editors	Writer, Editor, Admin	List editors for assigning articles
POST	/api/admin/role/:id	Admin	Promote/Demote user role
GET	/api/admin/approved-articles	Admin	View all approved articles

🧾 Example Requests
✍️ Create Article (Writer)
POST /api/articles/create
Headers:

makefile
Copy code
Authorization: Bearer <writer_token>
Body:

json
Copy code
{
  "title": "My Story",
  "content": "<p>Article text</p>",
  "assignedEditorId": "EDITOR_ID",
  "submit": true
}
✅ Approve Article (Editor)
POST /api/articles/:id/review
Headers:

makefile
Copy code
Authorization: Bearer <editor_token>
Body:

json
Copy code
{
  "action": "approve"
}
❌ Reject Article (Editor)
POST /api/articles/:id/review
Headers:

makefile
Copy code
Authorization: Bearer <editor_token>
Body:

json
Copy code
{
  "action": "reject",
  "comment": "Please fix introduction and add more sources."
}
🧩 Article Workflow
nginx
Copy code
Draft → Submitted → Approved / Rejected
🧍‍♂️ User Roles & Capabilities
Role	Capabilities
Reader	View all approved articles
Writer	Create, edit, and submit articles
Editor	Review, approve/reject with comments
Admin	Manage users, roles, and view all approved articles

🧰 Common Commands
Task	Command
Install backend deps	cd server && npm install
Run backend	npm run dev
Seed database	node seed-test.js
Install frontend deps	cd client && npm install
Run frontend	npm run dev

🧠 Troubleshooting
Issue	Solution
403 Forbidden (Writer)	Use /users/editors instead of /users/list
Token Error	Clear browser localStorage & re-login
Mongo Error	Check MongoDB connection & .env config
White Screen	Clear .vite cache & restart frontend
Wrong User Stored	Clear localStorage and login again