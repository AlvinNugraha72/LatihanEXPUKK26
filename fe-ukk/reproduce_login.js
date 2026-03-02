const BASE_URL = "http://localhost:1337/api";

async function test() {
  const identifier = "Admin"; // Capital Case
  const password = "admin123";

  console.log(`--- Testing Admin Login (Case Insensitive $eqi: ${identifier}) ---`);
  try {
      const url = `${BASE_URL}/admins?filters[username][$eqi]=${identifier}&filters[password][$eq]=${password}`;
      console.log("Fetching:", url);
      const res = await fetch(url);
      console.log("Status:", res.status);
      const data = await res.json();
      console.log("Data Length:", data.data?.length);
      console.log("Data:", JSON.stringify(data, null, 2));
  } catch (e) {
      console.error("Error:", e.message);
  }
}

test();
