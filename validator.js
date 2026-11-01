// Custom module: validates registration data on the server.
function validateRegistration(data) {
  const errors = [];

  const name = String(data.name || "").trim();
  const email = String(data.email || "").trim();
  const password = String(data.password || "");
  const phone = String(data.phone || "").trim();

  if (!name) errors.push("Name is required.");
  else if (name.length < 2) errors.push("Name must contain at least 2 characters.");
  else if (name.length > 50) errors.push("Name must not exceed 50 characters.");

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) errors.push("Email is required.");
  else if (!emailPattern.test(email)) errors.push("Enter a valid email address.");

  if (!password) errors.push("Password is required.");
  else if (password.length < 8) errors.push("Password must be at least 8 characters long.");

  const phonePattern = /^[6-9]\d{9}$/;
  if (!phone) errors.push("Phone number is required.");
  else if (!phonePattern.test(phone)) errors.push("Enter a valid 10-digit Indian mobile number.");

  return errors;
}

module.exports = { validateRegistration };
