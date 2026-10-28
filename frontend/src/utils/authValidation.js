/*
 * Student account validation for the sign-up, sign-in, password reset and
 * profile forms. Mirrors backend/src/modules/common/validation/studentValidation.js
 * (the server enforces the same rules).
 *
 * Each validator returns an error message, or "" when the value is valid.
 */
export const MIN_AGE = 6;
export const MAX_AGE = 9;
export const GRADES = ["2", "3", "4"];

// VIVA: Names support Unicode letters; the optional school field accepts English text/punctuation.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const NAME_PATTERN = /^[\p{L}][\p{L}\p{M} .'-]*$/u;
const SCHOOL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 .,'&()/-]*$/;
const text = value => (typeof value === "string" ? value.trim() : "");

export const validateFullName = value => {
  const name = text(value);
  if (!name) return "Full name is required.";
  if (name.length < 2 || name.length > 60) return "Full name must be 2 to 60 characters.";
  if (!NAME_PATTERN.test(name)) return "Full name can only contain letters, spaces, apostrophes, dots and hyphens.";
  return "";
};

export const validateAge = value => {
  if (value === undefined || value === null || String(value).trim() === "") return "Age is required.";
  const age = Number(value);
  if (!Number.isInteger(age)) return "Age must be a whole number.";
  if (age < MIN_AGE || age > MAX_AGE) return `Age must be between ${MIN_AGE} and ${MAX_AGE}.`;
  return "";
};

export const validateGrade = value => (GRADES.includes(String(value)) ? "" : "Please choose Grade 2, 3 or 4.");

export const validateEmail = value => {
  const email = text(value);
  if (!email) return "Email address is required.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Please enter a valid email address.";
  return "";
};

// VIVA: Account creation/reset enforce strength; sign-in only requires a nonempty password.
export const validatePassword = value => {
  if (!value) return "Password is required.";
  if (value.length < 8 || value.length > 64) return "Password must be 8 to 64 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Password must include at least one letter and one number.";
  return "";
};

export const validateSchool = value => {
  const school = text(value);
  if (!school) return "";
  if (school.length < 2 || school.length > 100) return "School name must be 2 to 100 characters.";
  if (!SCHOOL_PATTERN.test(school)) return "School name must use English letters, numbers and simple punctuation only.";
  return "";
};

// VIVA: Keep only failed checks, producing the field -> message object consumed by forms.
const collect = checks => Object.fromEntries(Object.entries(checks).filter(([, message]) => message));

export const validateRegistrationForm = form => collect({
  fullName: validateFullName(form.fullName),
  age: validateAge(form.age),
  grade: validateGrade(form.grade),
  email: validateEmail(form.email),
  password: validatePassword(form.password),
  confirmPassword: form.confirmPassword === form.password ? "" : "Passwords do not match.",
});

export const validateLoginForm = form => collect({
  email: validateEmail(form.email),
  password: form.password ? "" : "Password is required.",
});
