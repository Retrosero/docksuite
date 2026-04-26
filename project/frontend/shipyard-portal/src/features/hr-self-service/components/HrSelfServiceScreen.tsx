import { useState, type FormEvent } from "react";
import { AlertTriangle, CalendarClock, CreditCard, FileWarning, RefreshCw, Wallet } from "lucide-react";
import { useHrSelfServiceData } from "../hooks/useHrSelfServiceData";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("tr-TR").format(parsed);
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency || "TRY",
    maximumFractionDigits: 2
  }).format(value || 0);
}

export function HrSelfServiceScreen() {
  const {
    data,
    loading,
    error,
    actionError,
    actionMessage,
    savingDocument,
    uploadingDocument,
    clearActionMessage,
    refresh,
    saveDocumentRecord,
    uploadDocumentFile
  } = useHrSelfServiceData();
  const [documentType, setDocumentType] = useState("Kimlik Belgesi");
  const [fileRef, setFileRef] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState("Pending Review");
  const [isRequired, setIsRequired] = useState(true);
  const [note, setNote] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPrivate, setUploadPrivate] = useState(true);
  const [fileInputKey, setFileInputKey] = useState(0);

  async function handleUploadFile() {
    if (!uploadFile) {
      return;
    }
    clearActionMessage();
    const uploadedFileRef = await uploadDocumentFile(uploadFile, uploadPrivate);
    if (uploadedFileRef) {
      setFileRef(uploadedFileRef);
      setUploadFile(null);
      setFileInputKey((value) => value + 1);
    }
  }

  async function handleDocumentSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearActionMessage();
    const saved = await saveDocumentRecord({
      documentType,
      fileRef,
      issueDate,
      expiryDate,
      status,
      isRequired,
      note
    });

    if (saved) {
      setDocumentType("Kimlik Belgesi");
      setFileRef("");
      setIssueDate("");
      setExpiryDate("");
      setStatus("Pending Review");
      setIsRequired(true);
      setNote("");
      setUploadFile(null);
      setFileInputKey((value) => value + 1);
    }
  }

  return (
    <section className="hr-self-screen">
      <header className="hr-self-hero">
        <div className="hr-self-hero__copy">
          <p className="eyebrow">Calisan Paneli</p>
          <h1>Calisan Paneli</h1>
          <p>Profil, izin, masraf, bordro ve belge durumunu tek ekranda takip edin.</p>
        </div>
        <button className="hr-self-action" onClick={refresh} disabled={loading} type="button">
          <RefreshCw className={loading ? "spin" : ""} size={16} aria-hidden="true" />
          Yenile
        </button>
      </header>

      {error ? (
        <div className="hr-self-state hr-self-state--error">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading && !data ? (
        <div className="hr-self-state">
          <CalendarClock size={18} aria-hidden="true" />
          <p>Calisan paneli yukleniyor...</p>
        </div>
      ) : null}

      {data ? (
        <>
          {data.infoMessage ? (
            <div className="hr-self-state">
              <AlertTriangle size={18} aria-hidden="true" />
              <p>{data.infoMessage}</p>
            </div>
          ) : null}

          {data.profile ? (
            <section className="hr-self-profile">
              <h2>{data.profile.employeeName}</h2>
              <p>
                Sicil: {data.profile.employeeId} | Departman: {data.profile.department} | Unvan: {data.profile.designation}
              </p>
              <p>
                Durum: {data.profile.status} | Ise giris: {formatDate(data.profile.joiningDate)}
              </p>
            </section>
          ) : null}

          <div className="hr-self-summary">
            <article className="hr-self-summary__card">
              <span>Son Attendance</span>
              <strong>{data.attendance.latestStatus}</strong>
              <small>{data.attendance.latestDate ? formatDate(data.attendance.latestDate) : "Kayit yok"}</small>
            </article>
            <article className="hr-self-summary__card">
              <span>Bekleyen Izin</span>
              <strong>{data.summary.pendingLeaveCount}</strong>
              <small>Onay bekleyen izin talepleri</small>
            </article>
            <article className="hr-self-summary__card">
              <span>Bekleyen Masraf</span>
              <strong>{data.summary.pendingExpenseCount}</strong>
              <small>Acik masraf talepleri</small>
            </article>
            <article className="hr-self-summary__card">
              <span>Son Bordro</span>
              <strong>{formatCurrency(data.summary.latestSalaryNetPay, data.summary.latestSalaryCurrency)}</strong>
              <small>Son maas net tutari</small>
            </article>
          </div>

          <div className="hr-self-action-grid">
            <a href="/izinler/yeni">Izin Talebi Olustur</a>
            <a href="/avans-masraf">Masraf Taleplerim</a>
            <a href="/maas">Bordro Ozetim</a>
            {data.profile ? <a href={`/personel/${encodeURIComponent(data.profile.employeeId)}`}>Profil Kartim</a> : <span>Profil Kartim</span>}
          </div>

          <div className="hr-self-layout">
            <section className="hr-self-panel">
              <div className="hr-self-panel__title">
                <div>
                  <p className="eyebrow">Izinler</p>
                  <h2>Bekleyen izin taleplerim</h2>
                </div>
              </div>
              <div className="hr-self-list">
                {data.pendingLeaves.length === 0 ? (
                  <p className="hr-self-state">Bekleyen izin talebi bulunmuyor.</p>
                ) : (
                  data.pendingLeaves.map((item) => (
                    <article className="hr-self-item" key={item.id}>
                      <div>
                        <strong>{item.leaveType}</strong>
                        <small>
                          Baslangic: {formatDate(item.fromDate)} | Bitis: {formatDate(item.toDate)}
                        </small>
                        <small>Durum: {item.status}</small>
                      </div>
                      <div className="hr-self-item__meta">
                        <CalendarClock size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-self-panel">
              <div className="hr-self-panel__title">
                <div>
                  <p className="eyebrow">Masraf</p>
                  <h2>Bekleyen masraf taleplerim</h2>
                </div>
              </div>
              <div className="hr-self-list">
                {data.pendingExpenses.length === 0 ? (
                  <p className="hr-self-state">Bekleyen masraf talebi bulunmuyor.</p>
                ) : (
                  data.pendingExpenses.map((item) => (
                    <article className="hr-self-item" key={item.id}>
                      <div>
                        <strong>{item.claimType}</strong>
                        <small>
                          Tutar: {formatCurrency(item.amount, item.currency)} | Tarih: {formatDate(item.postingDate)}
                        </small>
                        <small>Durum: {item.status}</small>
                      </div>
                      <div className="hr-self-item__meta">
                        <Wallet size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="hr-self-layout">
            <section className="hr-self-panel">
              <div className="hr-self-panel__title">
                <div>
                  <p className="eyebrow">Bordro</p>
                  <h2>Son bordro kayitlari</h2>
                </div>
              </div>
              <div className="hr-self-list">
                {data.recentSalaries.length === 0 ? (
                  <p className="hr-self-state">Bordro kaydi bulunmuyor.</p>
                ) : (
                  data.recentSalaries.map((item) => (
                    <article className="hr-self-item" key={item.id}>
                      <div>
                        <strong>{formatCurrency(item.netPay, item.currency)}</strong>
                        <small>Tarih: {formatDate(item.postingDate)}</small>
                        <small>Durum: {item.status}</small>
                      </div>
                      <div className="hr-self-item__meta">
                        <CreditCard size={16} aria-hidden="true" />
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="hr-self-panel">
              <div className="hr-self-panel__title">
                <div>
                  <p className="eyebrow">Belgeler</p>
                  <h2>Gecerlilik riski olan belgeler</h2>
                </div>
              </div>
              <div className="hr-self-list">
                {data.recentDocuments.length === 0 ? (
                  <p className="hr-self-state">Belge kaydi bulunmuyor.</p>
                ) : (
                  data.recentDocuments.map((item) => (
                    <article className="hr-self-item" key={item.id}>
                      <div>
                        <strong>{item.documentType}</strong>
                        <small>
                          Durum: {item.status} | Belge: {item.fileName}
                        </small>
                        <small>
                          Kayit: {formatDate(item.issueDate)} | Gecerlilik: {formatDate(item.expiryDate)}
                        </small>
                      </div>
                      <div className="hr-self-item__meta">
                        {item.fileUrl ? (
                          <a href={item.fileUrl} rel="noreferrer" target="_blank">
                            Ac
                          </a>
                        ) : (
                          <FileWarning size={16} aria-hidden="true" />
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>

              <form className="hr-self-document-form" onSubmit={handleDocumentSave}>
                <strong>Yeni belge kaydi</strong>
                <div className="hr-self-document-form__grid">
                  <label>
                    Belge Turu
                    <input onChange={(event) => setDocumentType(event.target.value)} required value={documentType} />
                  </label>
                  <label>
                    Dosya Ref
                    <input
                      list="hr-self-file-ref-options"
                      onChange={(event) => setFileRef(event.target.value)}
                      placeholder="FILE-0001 (opsiyonel)"
                      value={fileRef}
                    />
                    <datalist id="hr-self-file-ref-options">
                      {data.fileRefOptions.map((option) => (
                        <option key={option.fileRef} value={option.fileRef}>
                          {option.fileName}
                        </option>
                      ))}
                    </datalist>
                  </label>
                  <label>
                    Belge Tarihi
                    <input onChange={(event) => setIssueDate(event.target.value)} type="date" value={issueDate} />
                  </label>
                  <label>
                    Gecerlilik Bitis
                    <input onChange={(event) => setExpiryDate(event.target.value)} type="date" value={expiryDate} />
                  </label>
                  <label>
                    Durum
                    <select onChange={(event) => setStatus(event.target.value)} value={status}>
                      <option value="Pending Review">Incelemede</option>
                      <option value="Valid">Gecerli</option>
                      <option value="Expiring Soon">Yaklasiyor</option>
                      <option value="Expired">Suresi Doldu</option>
                      <option value="Missing">Eksik</option>
                    </select>
                  </label>
                  <label className="hr-self-document-form__check">
                    <input checked={isRequired} onChange={(event) => setIsRequired(event.target.checked)} type="checkbox" />
                    Zorunlu Belge
                  </label>
                </div>
                <div className="hr-self-document-upload-row">
                  <label>
                    Dosya Yukle
                    <input
                      key={fileInputKey}
                      onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                      type="file"
                    />
                  </label>
                  <label className="hr-self-document-form__check">
                    <input checked={uploadPrivate} onChange={(event) => setUploadPrivate(event.target.checked)} type="checkbox" />
                    Ozel Dosya
                  </label>
                  <button
                    className="hr-self-action hr-self-action--inline"
                    disabled={uploadingDocument || savingDocument || !uploadFile}
                    onClick={() => void handleUploadFile()}
                    type="button"
                  >
                    {uploadingDocument ? "Yukleniyor..." : "Dosyayi Yukle"}
                  </button>
                </div>
                <label>
                  Not
                  <textarea onChange={(event) => setNote(event.target.value)} rows={3} value={note} />
                </label>
                {actionError ? <p className="hr-self-state hr-self-state--error">{actionError}</p> : null}
                {actionMessage ? <p className="hr-self-state hr-self-state--success">{actionMessage}</p> : null}
                <button className="hr-self-action hr-self-action--inline" disabled={savingDocument} type="submit">
                  {savingDocument ? "Kaydediliyor..." : "Belge Kaydi Ekle"}
                </button>
              </form>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
