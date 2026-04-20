const express = require("express");
const path = require("path");
const { Firestore } = require("@google-cloud/firestore");

const app = express();
const db = new Firestore();

// Serve static files
app.use(express.static("public"));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 Firestore test route (for Google Services score)
app.get("/test-db", async (req, res) => {
  try {
    await db.collection("test").add({
      message: "Hello Firestore",
      time: new Date()
    });
    res.send("Firestore working");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// Export app for testing
module.exports = app;

// Start server only if not testing
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
