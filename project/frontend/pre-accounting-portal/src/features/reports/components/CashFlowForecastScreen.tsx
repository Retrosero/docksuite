import { useCashFlowForecast } from '../hooks/useCashFlowForecast'
import { formatForecastPeriodLabel, calculateRiskLevel, getRiskColor } from '../services/cashFlowForecastService'
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Calendar } from 'lucide-react'
import type { ForecastPeriod } from '../services/cashFlowForecastService'

const PERIODS: ForecastPeriod[] = ['30_days', '60_days', '90_days']

export function CashFlowForecastScreen() {
  const { forecast, isLoading, error, period, refresh, changePeriod } = useCashFlowForecast()

  if (isLoading) {
    return (
      <div className="screen-container">
        <div className="loading-state">
          <RefreshCw size={32} className="spin" />
          <p>Nakit akışı tahminleniyor...</p>
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

  const riskLevel = calculateRiskLevel(forecast)
  const riskColor = getRiskColor(riskLevel)

  return (
    <div className="screen-container">
      {/* Header with period selector */}
      <div className="forecast-header">
        <div className="forecast-period-selector">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => changePeriod(p)}
            >
              <Calendar size={16} />
              {formatForecastPeriodLabel(p)}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary" onClick={refresh}>
          <RefreshCw size={16} />
          Yenile
        </button>
      </div>

      {/* Summary Cards */}
      <div className="forecast-summary">
        <div className="summary-card">
          <span className="summary-label">Mevcut Bakiye</span>
          <span className="summary-value">₺{forecast.current_balance.toLocaleString('tr-TR')}</span>
        </div>
        <div className="summary-card inflow">
          <span className="summary-label">Tahmin Edilen Giriş</span>
          <span className="summary-value positive">
            <TrendingUp size={18} />
            ₺{forecast.total_expected_inflow.toLocaleString('tr-TR')}
          </span>
        </div>
        <div className="summary-card outflow">
          <span className="summary-label">Tahmin Edilen Çıkış</span>
          <span className="summary-value negative">
            <TrendingDown size={18} />
            ₺{forecast.total_expected_outflow.toLocaleString('tr-TR')}
          </span>
        </div>
        <div className={`summary-card projected ${forecast.projected_end_balance < 0 ? 'danger' : ''}`}>
          <span className="summary-label">Projeksiyon Sonu</span>
          <span className="summary-value">₺{forecast.projected_end_balance.toLocaleString('tr-TR')}</span>
        </div>
      </div>

      {/* Risk Alert */}
      {(riskLevel !== 'low' || forecast.risk_alert) && (
        <div className="risk-alert" style={{ borderColor: riskColor }}>
          <AlertTriangle size={20} style={{ color: riskColor }} />
          <div>
            <strong>Risk Uyarısı</strong>
            <p>{forecast.risk_message || 'Nakit akışı riskli görünüyor. Ödeme ve tahsilat planlaması yapmanızı öneririz.'}</p>
          </div>
        </div>
      )}

      {/* Forecast Chart Placeholder */}
      <div className="forecast-chart">
        <h3>Haftalık Nakit Akışı Projeksiyonu</h3>
        <div className="chart-placeholder">
          <div className="chart-bars">
            {forecast.forecast_items.map((item, index) => (
              <div key={index} className="chart-bar-container">
                <div
                  className="chart-bar inflow-bar"
                  style={{ height: `${Math.min(100, (item.expected_inflow / forecast.total_expected_inflow) * 100)}%` }}
                />
                <div
                  className="chart-bar outflow-bar"
                  style={{ height: `${Math.min(100, (item.expected_outflow / forecast.total_expected_outflow) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="chart-labels">
            {forecast.forecast_items.map((item, index) => (
              <span key={index} className="chart-label">{item.week}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="forecast-table-container">
        <h3>Detaylı Haftalık Tahmin</h3>
        <table className="forecast-table">
          <thead>
            <tr>
              <th>Hafta</th>
              <th>Tahmini Giriş</th>
              <th>Tahmini Çıkış</th>
              <th>Net Akış</th>
              <th>Kümülatif Bakiye</th>
            </tr>
          </thead>
          <tbody>
            {forecast.forecast_items.map((item, index) => (
              <tr key={index}>
                <td>{item.week}</td>
                <td className="positive">₺{item.expected_inflow.toLocaleString('tr-TR')}</td>
                <td className="negative">₺{item.expected_outflow.toLocaleString('tr-TR')}</td>
                <td className={item.net_flow >= 0 ? 'positive' : 'negative'}>
                  ₺{item.net_flow.toLocaleString('tr-TR')}
                </td>
                <td className={item.running_balance >= 0 ? '' : 'negative'}>
                  ₺{item.running_balance.toLocaleString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disclaimer */}
      <div className="forecast-disclaimer">
        <p>
          * Bu tahminler geçmiş veriler ve cari hesap vadelerine dayanmaktadır.
          Gerçek sonuçlar piyasa koşullarına göre değişebilir.
        </p>
      </div>
    </div>
  )
}