## 🧭 Getting Started (Run the Project End-to-End Locally)

Welcome to the repository! Follow the steps below to set up and run the project  **end-to-end on your local machine** .

---

### **1. Clone the Repository**

```bash
git clone <repo-url>
cd <repo-folder>
```

---

### **2. Install Dependencies**

Install all required npm packages:

```bash
npm install
```

---

### **3. Start Redis**

Run a Redis server locally using Docker. Replace `<version>` with the Redis version you want (e.g., `latest`):

```bash
docker run -d --name redis -p 6379:6379 redis:<version>
```

> 💡 **Tip:** You can verify Redis is running using:
>
> ```bash
> docker ps
> ```

---

### **4. (Optional) Install RedisInsight**

If you want a GUI to visualize your Redis data, install  **RedisInsight** :

👉 [RedisInsight Installation Guide](https://redis.io/docs/latest/operate/redisinsight/install/)

---

### **5. Set Up MongoDB Atlas**

1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) account.
2. Create a new  **Project** .
3. Use the **default cluster** or create a new one.
4. Inside the cluster, create  **two databases** :
   * `development`
   * `production`
5. Copy the **connection URI** and update it with your credentials:
   ```
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.vuxqp.mongodb.net/development?retryWrites=true&w=majority"
   ```

---

### **6. Configure Environment Variables**

Create a `.env.local` file in the root directory (you can also use `.env`).

Fill in all the required variables based on the `.env.example` file (if available).

Example:

```
MONGODB_URI=<your-mongo-uri>
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
```

---

### **7. Postman Collection**

You can import the Postman collection to test all API endpoints:

`postman/collections/17273157-19503c8f-f5ac-4052-9aa8-83f66c9268a0.json`

> 💡 **Tip:** Import this file into Postman via  **File → Import → Upload Files** .

---

### **8. Run the Project**

Start the local development server using Vercel CLI:

```bash
vercel dev
```

> ⚙️ This command starts the local environment with the same configuration as your Vercel deployment.

---

### ✅ That’s it!

You now have the full project running locally with Redis and MongoDB connected.
