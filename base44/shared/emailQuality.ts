// Common misspellings of popular email providers → the correct domain.
const DOMAIN_TYPOS = {
  "gamil.com": "gmail.com", "gmial.com": "gmail.com", "gmai.com": "gmail.com",
  "gmal.com": "gmail.com", "gmaill.com": "gmail.com", "gnail.com": "gmail.com",
  "gmail.co": "gmail.com", "gmail.con": "gmail.com", "gmail.cm": "gmail.com",
  "gmail.om": "gmail.com", "gmail.cmo": "gmail.com", "gmail.comm": "gmail.com",
  "gmsil.com": "gmail.com", "gmali.com": "gmail.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yhoo.com": "yahoo.com",
  "yahoo.con": "yahoo.com", "yahoo.co": "yahoo.com", "yahoo.cm": "yahoo.com",
  "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com", "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com", "outlook.con": "outlook.com",
  "icloud.con": "icloud.com", "iclod.com": "icloud.com", "icoud.com": "icloud.com",
  "aol.con": "aol.com",
};

// Placeholder / testing domains — never a real person.
const TEST_DOMAINS = ["example.com", "example.org", "example.net", "test.com", "mailinator.com"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw) {
  const email = (raw || "").trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 0) return email;
  const domain = email.slice(at + 1);
  const fixed = DOMAIN_TYPOS[domain];
  return fixed ? `${email.slice(0, at)}@${fixed}` : email;
}

// A real sign-up: a valid email on a real (non-test) domain.
export function isRealEmail(raw) {
  const email = (raw || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return false;
  const domain = email.slice(email.lastIndexOf("@") + 1);
  return !TEST_DOMAINS.includes(domain);
}