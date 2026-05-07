import { useDetailedAging } from '../hooks/useDetailedAging'
import { getRiskColor, getAgingColor, formatAgingPeriodLabel, type AgingPeriod } from '../services/detailedAgingService'
import { RefreshCw, AlertTriangle, Users, Truck, TrendingUp } from 'lucide-react'

const PERIODS: AgingPeriod[] = ['current', '1_30', '31_60', '61_90', 'over_90']

export function DetailedAgingScreen() {
  const { report, isLoading, error, activeTab, refresh, switchTab } = useDetailedAging()

  if (isLoading) {
    return (
      <div className="screen-container">
        <div className="loading-state">
          <RefreshCw size={32} className="spin" />
          <p>Vade analizi raporu yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen-container">
        <div className="error-state">
          <AlertTriangle size={32} />
          <p>{error}</p>
          <button className="btn btn-primary" onClick={refresh}>
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  const currentItems = activeTab === 'customers' ? report.customers : report.suppliers

  return (
    <div className="screen-container">
      {/* Header */}
      <div className="aging-header">
        <div className="aging-title">
          <h2>Detaylı Vade Yaşlandırma</h2>
          <span className="aging-date">Rapor Tarihi: {report.as_of_date}</span>
        </div>
        <button className="btn btn-secondary" onClick={refresh}>
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="aging-summary">
        <div className="summary-card customers">
          <div className="summary-icon"><Users size={24} /></div>
          <div className="summary-content">
            <span className="summary-label">Müşteri Alacakları</span>
            <span className="summary-value">₺{report.total_customer_outstanding.toLocaleString('tr-TR')}</span>
          </div>
        </div>
        <div className="summary-card suppliers">
          <div className="summary-icon"><Truck size={24} /></div>
          <div className="summary-content">
            <span className="summary-label">Tedarikçi Borçları</span>
            <span className="summary-value">₺{report.total_supplier_outstanding.toLocaleString('tr-TR')}</span>
          </div>
        </div>
        <div className="summary-card total">
          <div className="summary-icon"><TrendingUp size={24} /></div>
          <div className="summary-content">
            <span className="summary-label">Toplam Açık</span>
            <span className="summary-value">₺{report.total_outstanding.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="risk-summary">
        <div className="risk-badge high">
          <AlertTriangle size={16} />
          <span>{report.high_risk_count} Yüksek Risk</span>
        </div>
        <div className="risk-badge medium">
          <AlertTriangle size={16} />
          <span>{report.medium_risk_count} Orta Risk</span>
        </div>
        <div className="risk-badge low">
          <span>{report.low_risk_count} Düşük Risk</span>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="aging-tabs">
        <button
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => switchTab('customers')}
        >
          <Users size={18} />
          Müşteriler ({report.customers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => switchTab('suppliers')}
        >
          <Truck size={18} />
          Tedarikçiler ({report.suppliers.length})
        </button>
      </div>

      {/* Aging Table */}
      <div className="aging-table-container">
        <table className="aging-table">
          <thead>
            <tr>
              <th>Cari Hesap</th>
              <th>Toplam Açık</th>
              {PERIODS.map((period) => (
                <th key={period} style={{ color: getAgingColor(period) }}>
                  {formatAgingPeriodLabel(period)}
                </th>
              ))}
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index} className={item.risk_score === 'high' ? 'high-risk-row' : ''}>
                <td className="party-name">
                  <div className="party-info">
                    <span className="party-title">{item.party_name}</span>
                    {item.oldest_invoice_date && (
                      <span className="oldest-date">
                        En eski: {new Date(item.oldest_invoice_date).toLocaleDateString('tr-TR')}
                      </span>
                    )}
                  </div>
                </td>
                <td className="total-outstanding">
                  <strong>₺{item.total_outstanding.toLocaleString('tr-TR')}</strong>
                </td>
                <td className="bucket-cell" style={{ '--bucket-color': getAgingColor('current') } as React.CSSProperties}>
                  ₺{item.buckets.current.toLocaleString('tr-TR')}
                </td>
                <td className="bucket-cell" style={{ '--bucket-color': getAgingColor('1_30') } as React.CSSProperties}>
                  ₺{item.buckets['1_30'].toLocaleString('tr-TR')}
                </td>
                <td className="bucket-cell" style={{ '--bucket-color': getAgingColor('31_60') } as React.CSSProperties}>
                  ₺{item.buckets['31_60'].toLocaleString('tr-TR')}
                </td>
                <td className="bucket-cell" style={{ '--bucket-color': getAgingColor('61_90') } as React.CSSProperties}>
                  ₺{item.buckets['61_90'].toLocaleString('tr-TR')}
                </td>
                <td className="bucket-cell danger" style={{ '--bucket-color': getAgingColor('over_90') } as React.CSSProperties}>
                  ₺{item.buckets.over_90.toLocaleString('tr-TR')}
                </td>
                <td className="risk-cell">
                  <span
                    className={`risk-badge-item ${item.risk_score}`}
                    style={{ backgroundColor: getRiskColor(item.risk_score) }}
                  >
                    {item.risk_score === 'high' ? 'Yüksek' : item.risk_score === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="aging-legend">
        <h4>Dönem Renkleri</h4>
        <div className="legend-items">
          {PERIODS.map((period) => (
            <div key={period} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: getAgingColor(period) }} />
              <span>{formatAgingPeriodLabel(period)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}