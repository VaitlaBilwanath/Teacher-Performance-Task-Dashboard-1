import React, { useState, useEffect } from 'react';
import { Shield, Search, ChevronLeft, ChevronRight, Activity, AlertCircle, Eye, X, RefreshCw } from 'lucide-react';
import GlassCard from '../../components/GlassCard';
import { adminAPI } from '../../services/api';
import '../../index.css';

/* ── Helpers ────────────────────────────────────────────────────── */
const ACTION_COLORS = {
  SUCCESS:   { bg: 'rgba(16,185,129,0.15)',   text: '#10b981' },
  VERIFIED:  { bg: 'rgba(16,185,129,0.15)',   text: '#10b981' },
  CREATED:   { bg: 'rgba(16,185,129,0.15)',   text: '#10b981' },
  CREATE:    { bg: 'rgba(139,92,246,0.15)',    text: '#8b5cf6' },
  MESSAGE:   { bg: 'rgba(139,92,246,0.15)',    text: '#8b5cf6' },
  UPDATED:   { bg: 'rgba(59,130,246,0.15)',    text: '#3b82f6' },
  UPDATE:    { bg: 'rgba(59,130,246,0.15)',    text: '#3b82f6' },
  PROFILE:   { bg: 'rgba(245,158,11,0.15)',    text: '#f59e0b' },
  REQUESTED: { bg: 'rgba(245,158,11,0.15)',    text: '#f59e0b' },
  FAILED:    { bg: 'rgba(239,68,68,0.15)',     text: '#ef4444' },
  LOCKED:    { bg: 'rgba(239,68,68,0.15)',     text: '#ef4444' },
  DELETED:   { bg: 'rgba(239,68,68,0.15)',     text: '#ef4444' },
  DELETE:    { bg: 'rgba(239,68,68,0.15)',     text: '#ef4444' },
};

const getActionStyle = (action = '') => {
  const upper = action.toUpperCase();
  for (const [key, style] of Object.entries(ACTION_COLORS)) {
    if (upper.includes(key)) return style;
  }
  return { bg: 'rgba(139,92,246,0.12)', text: 'var(--primary)' };
};

const fmtTimestamp = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  });
};

const shortId = (id) => id ? `${id.slice(0, 8)}…` : '-';

/* ── Detail Modal ───────────────────────────────────────────────── */
const DetailModal = ({ log, onClose }) => {
  if (!log) return null;
  const rows = [
    ['Timestamp',   fmtTimestamp(log.timestamp)],
    ['Action',      log.action],
    ['Module',      log.module],
    ['Role',        log.role || '-'],
    ['IP Address',  log.ipAddress || '-'],
    ['User ID',     log.userId || '-'],
    ['Record ID',   log.recordId || '-'],
    ['Old Values',  log.oldValues ? JSON.stringify(log.oldValues, null, 2) : '-'],
    ['New Values',  log.newValues ? JSON.stringify(log.newValues, null, 2) : '-'],
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: '16px', padding: '30px', maxWidth: '600px', width: '100%',
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="var(--primary)" /> Audit Log Details
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: '2px' }}>
                {label}
              </span>
              <span style={{
                color: 'var(--text-primary)', fontSize: '0.9rem', wordBreak: 'break-all',
                background: 'rgba(255,255,255,0.04)', borderRadius: '6px',
                padding: '6px 10px', fontFamily: label.includes('Values') || label.includes('ID') ? 'monospace' : 'inherit',
                whiteSpace: label.includes('Values') ? 'pre-wrap' : 'normal'
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────── */
const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  const fetchLogs = async (page = 1, limit = 25, search = '') => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const response = await adminAPI.getAuditLogs(page, limit, search);
      const data = response.data;
      setLogs(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 });
    } catch (err) {
      setErrorState(err.response?.data?.message || err.message || 'Failed to fetch audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.page, pagination.limit, searchTerm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1, pagination.limit, searchTerm);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  /* Loading */
  if (isLoading && logs.length === 0) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Loading Audit Logs…</p>
        </div>
      </div>
    );
  }

  /* Error */
  if (errorState && logs.length === 0) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <GlassCard style={{ textAlign: 'center', padding: '40px', maxWidth: '500px' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Connection Error</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>{errorState}</p>
          <button className="primary-btn" onClick={() => fetchLogs(pagination.page, pagination.limit, searchTerm)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Shield size={28} color="var(--primary)" />
            System Audit Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.9rem' }}>
            Track system security events and user activities — {pagination.total} total records
          </p>
        </div>
        <button
          onClick={() => fetchLogs(pagination.page, pagination.limit, searchTerm)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px 14px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Search & Page Size */}
      <GlassCard style={{ padding: '18px 22px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, minWidth: '260px', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by action, module, role…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '9px 14px 9px 40px', boxSizing: 'border-box',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <button type="submit" className="primary-btn" style={{ padding: '9px 18px', whiteSpace: 'nowrap' }}>Search</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Rows:</span>
            <select
              value={pagination.limit}
              onChange={e => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', padding: '7px 10px', borderRadius: '6px', outline: 'none' }}
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', minWidth: '950px', borderCollapse: 'collapse',
            fontSize: '0.875rem', tableLayout: 'fixed'
          }}>
            <colgroup>
              <col style={{ width: '160px' }} />
              <col style={{ width: '220px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '60px' }} />
            </colgroup>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Timestamp', 'Action', 'Module', 'Role', 'IP Address', 'Record ID', ''].map(h => (
                  <th key={h} style={{
                    padding: '13px 16px', textAlign: 'left',
                    color: 'var(--text-tertiary)', fontWeight: 700,
                    fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                    whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((log, idx) => {
                const { bg, text } = getActionStyle(log.action);
                return (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.018)'}
                  >
                    {/* Timestamp */}
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {fmtTimestamp(log.timestamp)}
                    </td>

                    {/* Action badge */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '4px 10px', background: bg, color: text,
                        borderRadius: '20px', fontSize: '11.5px', fontWeight: 700,
                        whiteSpace: 'nowrap', maxWidth: '100%',
                        overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        <Activity size={11} />
                        {log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {log.module || '-'}
                    </td>

                    {/* Role */}
                    <td style={{ padding: '12px 16px' }}>
                      {log.role ? (
                        <span style={{
                          display: 'inline-block', padding: '2px 9px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                          color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          {log.role}
                        </span>
                      ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                    </td>

                    {/* IP Address */}
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {log.ipAddress || '—'}
                    </td>

                    {/* Record ID (truncated) */}
                    <td style={{ padding: '12px 16px' }}>
                      {log.recordId ? (
                        <span
                          title={log.recordId}
                          style={{
                            display: 'block', maxWidth: '140px',
                            fontFamily: 'monospace', fontSize: '0.78rem',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            cursor: 'help'
                          }}
                        >
                          {shortId(log.recordId)}
                        </span>
                      ) : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                    </td>

                    {/* View Detail */}
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        title="View full details"
                        style={{
                          background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                          borderRadius: '6px', cursor: 'pointer', color: 'var(--primary)',
                          display: 'inline-flex', padding: '5px 7px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.22)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                    <Shield size={36} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
                    No audit logs found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {logs.length > 0
              ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} records`
              : 'No records'}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                color: pagination.page === 1 ? 'rgba(255,255,255,0.25)' : 'var(--text-primary)',
                padding: '7px 10px', borderRadius: '7px', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500, padding: '0 10px' }}>
              Page {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= (pagination.totalPages || 1)}
              style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                color: pagination.page >= (pagination.totalPages || 1) ? 'rgba(255,255,255,0.25)' : 'var(--text-primary)',
                padding: '7px 10px', borderRadius: '7px', cursor: pagination.page >= (pagination.totalPages || 1) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Detail Modal */}
      {selectedLog && <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
};

export default AuditLogs;
