frappe.pages["support-operations-dashboard"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Support & Operations",
		single_column: true,
	});

	const state = {
		tenants: [],
		selectedTenant: "",
		logs: [],
		notes: [],
	};

	const styles = `
		.support-ops { display: grid; gap: 12px; }
		.support-card { background: #ffffff; border: 1px solid #d1d5db; border-radius: 10px; padding: 12px; }
		.support-grid { display: grid; gap: 10px; grid-template-columns: 1fr; }
		.support-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
		.support-table-wrap { overflow-x: auto; }
		.support-table { width: 100%; border-collapse: collapse; min-width: 780px; }
		.support-table th, .support-table td { border-bottom: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 12px; }
		.support-muted { color: #6b7280; font-size: 12px; }
		.support-input, .support-select, .support-textarea {
			width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; font-size: 13px;
		}
		.support-textarea { min-height: 82px; }
		@media (min-width: 900px) {
			.support-grid { grid-template-columns: 1fr 1fr; }
		}
	`;

	$(page.body).html(`
		<style>${styles}</style>
		<div class="support-ops">
			<div class="support-card">
				<div class="support-row">
					<div style="min-width:220px; flex:1;">
						<label class="support-muted">Tenant Secimi</label>
						<select id="tenantSelect" class="support-select"></select>
					</div>
					<div class="support-row">
						<button class="btn btn-primary btn-sm" id="refreshAllBtn">Yenile</button>
						<button class="btn btn-default btn-sm" id="refreshLogsBtn">Loglari Yenile</button>
						<button class="btn btn-default btn-sm" id="refreshNotesBtn">Notlari Yenile</button>
					</div>
				</div>
			</div>

			<div class="support-card">
				<div class="support-row" style="justify-content: space-between;">
					<h4 style="margin:0;">Tenant Listesi</h4>
					<span id="tenantCount" class="support-muted">0 tenant</span>
				</div>
				<div class="support-table-wrap">
					<table class="support-table">
						<thead>
							<tr>
								<th>Tenant</th>
								<th>Durum</th>
								<th>Aktif</th>
								<th>Versiyon</th>
								<th>Son Senkron</th>
								<th>Islem</th>
							</tr>
						</thead>
						<tbody id="tenantRows"></tbody>
					</table>
				</div>
			</div>

			<div class="support-grid">
				<div class="support-card">
					<div class="support-row" style="justify-content: space-between;">
						<h4 style="margin:0;">Tenant Log Viewer</h4>
						<span id="logCount" class="support-muted">0 log</span>
					</div>
					<div class="support-table-wrap">
						<table class="support-table">
							<thead>
								<tr>
									<th>Tarih</th>
									<th>Seviye</th>
									<th>Kategori</th>
									<th>Mesaj</th>
								</tr>
							</thead>
							<tbody id="logRows"></tbody>
						</table>
					</div>
				</div>

				<div class="support-card">
					<div class="support-row" style="justify-content: space-between;">
						<h4 style="margin:0;">Support Notes</h4>
						<span id="noteCount" class="support-muted">0 not</span>
					</div>
					<div class="support-row">
						<input id="noteSummary" class="support-input" placeholder="Kisa ozet" />
						<select id="noteType" class="support-select" style="max-width:160px;">
							<option>Bilgi</option>
							<option>Sorun</option>
							<option>Aksiyon</option>
							<option>Cozum</option>
						</select>
						<select id="issueStatus" class="support-select" style="max-width:160px;">
							<option>Acik</option>
							<option>Inceleniyor</option>
							<option>Cozuldu</option>
							<option>Kapandi</option>
						</select>
					</div>
					<textarea id="noteDetails" class="support-textarea" placeholder="Detay notu"></textarea>
					<div class="support-row" style="margin-top: 8px;">
						<button class="btn btn-primary btn-sm" id="addNoteBtn">Not Ekle</button>
					</div>
					<div class="support-table-wrap" style="margin-top: 10px;">
						<table class="support-table">
							<thead>
								<tr>
									<th>Tarih</th>
									<th>Tip</th>
									<th>Durum</th>
									<th>Ozet</th>
								</tr>
							</thead>
							<tbody id="noteRows"></tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	`);

	const tenantSelect = page.body.querySelector("#tenantSelect");
	const tenantRows = page.body.querySelector("#tenantRows");
	const logRows = page.body.querySelector("#logRows");
	const noteRows = page.body.querySelector("#noteRows");

	async function api(method, args = {}) {
		const response = await frappe.call({ method, args });
		return response.message;
	}

	function escapeHtml(value) {
		if (!value) return "";
		return String(value)
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#39;");
	}

	function drawTenantOptions() {
		const current = state.selectedTenant;
		const options = state.tenants
			.map((row) => `<option value="${escapeHtml(row.tenant_site)}">${escapeHtml(row.tenant_site)}</option>`)
			.join("");
		tenantSelect.innerHTML = options || `<option value="">Tenant yok</option>`;

		if (current && state.tenants.some((row) => row.tenant_site === current)) {
			tenantSelect.value = current;
		} else if (state.tenants.length > 0) {
			tenantSelect.value = state.tenants[0].tenant_site;
			state.selectedTenant = state.tenants[0].tenant_site;
		} else {
			state.selectedTenant = "";
		}
	}

	function drawTenantTable() {
		page.body.querySelector("#tenantCount").textContent = `${state.tenants.length} tenant`;
		tenantRows.innerHTML = state.tenants
			.map((row) => {
				const activeText = row.is_active ? "Evet" : "Hayir";
				const statusBtnText = row.is_active ? "Pasif Yap" : "Aktif Yap";
				return `
					<tr>
						<td>${escapeHtml(row.tenant_site)}</td>
						<td>${escapeHtml(row.tenant_status || "")}</td>
						<td>${activeText}</td>
						<td>${escapeHtml(row.current_version || "")}</td>
						<td>${escapeHtml(row.last_version_sync || "")}</td>
						<td>
							<button class="btn btn-default btn-xs js-status" data-tenant="${escapeHtml(row.tenant_site)}" data-active="${row.is_active ? 1 : 0}">${statusBtnText}</button>
							<button class="btn btn-default btn-xs js-version" data-tenant="${escapeHtml(row.tenant_site)}">Versiyon</button>
						</td>
					</tr>
				`;
			})
			.join("");
	}

	function drawLogs() {
		page.body.querySelector("#logCount").textContent = `${state.logs.length} log`;
		logRows.innerHTML = state.logs
			.map(
				(row) => `
					<tr>
						<td>${escapeHtml(row.logged_at || "")}</td>
						<td>${escapeHtml(row.severity || "")}</td>
						<td>${escapeHtml(row.category || "")}</td>
						<td>${escapeHtml(row.message || "")}</td>
					</tr>
				`
			)
			.join("");
	}

	function drawNotes() {
		page.body.querySelector("#noteCount").textContent = `${state.notes.length} not`;
		noteRows.innerHTML = state.notes
			.map(
				(row) => `
					<tr>
						<td>${escapeHtml(row.note_datetime || "")}</td>
						<td>${escapeHtml(row.note_type || "")}</td>
						<td>${escapeHtml(row.issue_status || "")}</td>
						<td>${escapeHtml(row.summary || "")}</td>
					</tr>
				`
			)
			.join("");
	}

	async function loadTenants() {
		const data = await api("shipyard_app.operations_support.list_tenants", { include_inactive: 1 });
		state.tenants = data.tenants || [];
		drawTenantOptions();
		drawTenantTable();
	}

	async function loadLogs() {
		if (!state.selectedTenant) {
			state.logs = [];
			drawLogs();
			return;
		}

		const data = await api("shipyard_app.operations_support.get_tenant_logs", {
			tenant_site: state.selectedTenant,
			limit: 30,
		});
		state.logs = data.logs || [];
		drawLogs();
	}

	async function loadNotes() {
		if (!state.selectedTenant) {
			state.notes = [];
			drawNotes();
			return;
		}

		const data = await api("shipyard_app.operations_support.list_support_notes", {
			tenant_site: state.selectedTenant,
			limit: 30,
		});
		state.notes = data.notes || [];
		drawNotes();
	}

	async function refreshAll() {
		try {
			await loadTenants();
			await loadLogs();
			await loadNotes();
		} catch (error) {
			frappe.msgprint(__("Veriler yuklenirken hata olustu."));
		}
	}

	tenantSelect.addEventListener("change", async (event) => {
		state.selectedTenant = event.target.value;
		await loadLogs();
		await loadNotes();
	});

	page.body.querySelector("#refreshAllBtn").addEventListener("click", refreshAll);
	page.body.querySelector("#refreshLogsBtn").addEventListener("click", loadLogs);
	page.body.querySelector("#refreshNotesBtn").addEventListener("click", loadNotes);

	tenantRows.addEventListener("click", async (event) => {
		const statusTarget = event.target.closest(".js-status");
		const versionTarget = event.target.closest(".js-version");

		if (statusTarget) {
			const tenant = statusTarget.dataset.tenant;
			const currentlyActive = Number(statusTarget.dataset.active) === 1;
			try {
				await api("shipyard_app.operations_support.set_tenant_status", {
					tenant_site: tenant,
					is_active: currentlyActive ? 0 : 1,
					tenant_status: currentlyActive ? "Pasif" : "Aktif",
				});
				await refreshAll();
				frappe.show_alert({ message: __("Tenant durumu guncellendi."), indicator: "green" });
			} catch (error) {
				frappe.msgprint(__("Tenant durumu guncellenemedi."));
			}
		}

		if (versionTarget) {
			const tenant = versionTarget.dataset.tenant;
			frappe.prompt(
				[
					{
						fieldname: "current_version",
						label: "Versiyon",
						fieldtype: "Data",
						reqd: 1,
					},
				],
				async (values) => {
					try {
						await api("shipyard_app.operations_support.update_tenant_version", {
							tenant_site: tenant,
							current_version: values.current_version,
						});
						await refreshAll();
						frappe.show_alert({ message: __("Versiyon guncellendi."), indicator: "green" });
					} catch (error) {
						frappe.msgprint(__("Versiyon guncellenemedi."));
					}
				},
				"Tenant Versiyon Guncelle",
				"Guncelle"
			);
		}
	});

	page.body.querySelector("#addNoteBtn").addEventListener("click", async () => {
		if (!state.selectedTenant) {
			frappe.msgprint(__("Not eklemek icin tenant secin."));
			return;
		}

		const summary = page.body.querySelector("#noteSummary").value || "";
		const details = page.body.querySelector("#noteDetails").value || "";
		const noteType = page.body.querySelector("#noteType").value || "Bilgi";
		const issueStatus = page.body.querySelector("#issueStatus").value || "Acik";

		if (!summary.trim()) {
			frappe.msgprint(__("Ozet alani zorunludur."));
			return;
		}

		try {
			await api("shipyard_app.operations_support.add_support_note", {
				tenant_site: state.selectedTenant,
				summary,
				details,
				note_type: noteType,
				issue_status: issueStatus,
			});

			page.body.querySelector("#noteSummary").value = "";
			page.body.querySelector("#noteDetails").value = "";
			await loadNotes();
			frappe.show_alert({ message: __("Support notu eklendi."), indicator: "green" });
		} catch (error) {
			frappe.msgprint(__("Support notu eklenemedi."));
		}
	});

	refreshAll();
};
