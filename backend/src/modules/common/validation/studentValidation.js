/*
 * Student account validation (sign-up, sign-in, password reset, profile).
 *
 * The same rules are mirrored in frontend/src/utils/authValidation.js so the
 * forms can explain a problem before anything is sent; these server checks are
 * the ones that are enforced.
 *
 * Each validator returns an error message, or "" when the value is valid.
 */

const MIN_AGE = 6;
const MAX_AGE = 9;
const GRADES = ["2", "3", "4"];
const GENDERS = ["male", "female", "other", ""];

// Practical email check: something@domain.tld with no spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
// Names: letters in any script, with spaces, apostrophes, dots and hyphens.
const NAME_PATTERN = /^[\p{L}][\p{L}\p{M} .'-]*$/u;
// School names: English letters, digits, spaces and basic punctuation only.
const SCHOOL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .,'&()/-]*$/;

const text = (value) => (typeof value === "string" ? value.trim() : "");

const validateFullName = (value) => {
  const name = text(value);
  if (!name) return "Full name is required.";
  if (name.length < 2 || name.length > 60) return "Full name must be 2 to 60 characters.";
  if (!NAME_PATTERN.test(name)) return "Full name can only contain letters, spaces, apostrophes, dots and hyphens.";
  return "";
};

const validateAge = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") return "Age is required.";
  const age = Number(value);
  if (!Number.isInteger(age)) return "Age must be a whole number.";
  if (age < MIN_AGE || age > MAX_AGE) return `Age must be between ${MIN_AGE} and ${MAX_AGE}.`;
  return "";
};

const validateGrade = (value) => (GRADES.includes(String(value)) ? "" : "Grade must be Grade 2, 3 or 4.");

const validateEmail = (value) => {
  const email = text(value);
  if (!email) return "Email address is required.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Please enter a valid email address.";
  return "";
};

const validatePassword = (value) => {
  if (typeof value !== "string" || !value) return "Password is required.";
  if (value.length < 8 || value.length > 64) return "Password must be 8 to 64 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Password must include at least one letter and one number.";
  return "";
};

const validateSchool = (value) => {
  const school = text(value);
  if (!school) return ""; // optional
  if (school.length < 2 || school.length > 100) return "School name must be 2 to 100 characters.";
  if (!SCHOOL_PATTERN.test(school)) return "School name must use English letters, numbers and simple punctuation only.";
  return "";
};

const validateGender = (value) => (GENDERS.includes(value ?? "") ? "" : "Please choose a valid gender.");

// Returns { errors, message } where errors maps field -> message.
const collect = (checks) => {
  const errors = {};
  for (const [field, message] of Object.entries(checks)) if (message) errors[field] = message;
  const fields = Object.keys(errors);
  return { errors, message: fields.length ? errors[fields[0]] : "" };
};

const validateRegistration = (body = {}) => collect({
  fullName: validateFullName(body.fullName),
  age: validateAge(body.age),
  grade: validateGrade(body.grade),
  email: validateEmail(body.email),
  password: validatePassword(body.password),
});

// VIVA: Sign-in accepts an existing password; the stronger password rule applies on creation/reset.
const validateLogin = (body = {}) => collect({
  email: validateEmail(body.email),
  password: typeof body.password === "string" && body.password ? "" : "Password is required.",
});

// Profile updates only check the fields that were sent.
const validateProfileUpdate = (body = {}) => collect({
  fullName: body.fullName !== undefined ? validateFullName(body.fullName) : "",
  grade: body.grade !== undefined ? validateGrade(body.grade) : "",
  school: body.school !== undefined ? validateSchool(body.school) : "",
  gender: body.gender !== undefined ? validateGender(body.gender) : "",
});

module.exports = {
  MIN_AGE, MAX_AGE, GRADES,
  validateFullName, validateAge, validateGrade, validateEmail, validatePassword, validateSchool, validateGender,
  validateRegistration, validateLogin, validateProfileUpdate,
};
