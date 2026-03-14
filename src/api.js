const API = "https://script.google.com/macros/s/AKfycbww7M7cnscSWC6qJL2EpAQOUmQbwsvFFoCxK7mHeSklpEA-1CH40JjQRCm6WmEKqTEo5g/exec"; // Replace with your actual Apps Script URL

// Helper function to format URLs properly
export function formatUrl(url) {
  if (!url) return '';
  
  // Remove leading/trailing whitespace
  url = url.trim();
  
  // Check if it already has a protocol
  if (!url.match(/^https?:\/\//i)) {
    // Add https:// as default
    url = 'https://' + url;
  }
  
  return url;
}

// Helper to extract domain for display
export function getDomainFromUrl(url) {
  if (!url) return '';
  try {
    const urlObj = new URL(formatUrl(url));
    return urlObj.hostname;
  } catch {
    return url;
  }
}

export async function getWorks() {
  const res = await fetch(`${API}?action=getWorks`);
  return res.json();
}

export async function getReviews() {
  const res = await fetch(`${API}?action=getReviews`);
  return res.json();
}

export async function addReview(data) {
  return fetch(API, {
    method: "POST",
    body: JSON.stringify({ ...data, action: "addReview" })
  });
}

export async function addContact(data) {
  return fetch(API, {
    method: "POST",
    body: JSON.stringify({ ...data, action: "addContact" })
  });
}

// Admin functions
export async function addWork(data) {
  return fetch(API, {
    method: "POST",
    body: JSON.stringify({ ...data, action: "addWork" })
  });
}

export async function updateWork(data) {
  return fetch(API, {
    method: "POST",
    body: JSON.stringify({ ...data, action: "updateWork" })
  });
}

export async function deleteWork(data) {
  return fetch(API, {
    method: "POST",
    body: JSON.stringify({ ...data, action: "deleteWork" })
  });
}

export async function deleteReview(data) {
  return fetch(API, {
    method: "POST",
    body: JSON.stringify({ ...data, action: "deleteReview" })
  });
}

export async function getContacts() {
  const res = await fetch(`${API}?action=getContacts`);
  return res.json();
}