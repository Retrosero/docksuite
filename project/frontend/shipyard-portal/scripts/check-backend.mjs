const target = process.env.VITE_ERP_PROXY_TARGET || "http://127.0.0.1:8000";
const timeoutMs = 3000;
const checkUrl = `${target.replace(/\/+$/, "")}/api/method/frappe.auth.get_logged_user`;

const controller = new AbortController();
const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

async function run() {
  try {
    const response = await fetch(checkUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "X-Frappe-Site-Name": process.env.VITE_ERP_SITE_NAME || "frontend"
      }
    });

    // 200/401/403 all mean backend is reachable.
    if ([200, 401, 403].includes(response.status)) {
      console.log(`[dev-check] ERPNext backend reachable: ${checkUrl} (${response.status})`);
      return;
    }

    console.error(`[dev-check] ERPNext backend responded with unexpected status ${response.status}: ${checkUrl}`);
    process.exit(1);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`[dev-check] ERPNext backend is not reachable: ${checkUrl}`);
    console.error(`[dev-check] Reason: ${reason}`);
    console.error("[dev-check] Start backend first (frappe-bench: bench start) then run npm run dev again.");
    process.exit(1);
  } finally {
    clearTimeout(timeoutHandle);
  }
}

run();
