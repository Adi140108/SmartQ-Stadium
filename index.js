const express = require("express");
const path = require("path");

const app = express();

// Serve static files
app.use(express.static("public"));

// Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 👇 THIS IS IMPORTANT
module.exports = app;

// 👇 Only start server if NOT testing
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
