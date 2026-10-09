import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AssignmentOutlined, VpnKeyOutlined, EditNoteOutlined, LogoutOutlined } from '@mui/icons-material'
import SelfServiceDropdown from '../../components/layout/SelfServiceDropdown'
import StatisticsDropdown from '../../components/layout/StatisticsDropdown'
import { logout } from '../../store/authSlice'
import { clearAccessToken } from '../../services/api'
import HeaderDropdown from './HeaderDropdown'
import ManageDropdown from '../../components/layout/ManageDropdown'
import { DeleteOutlined, LocationOnOutlined, SearchOutlined, MyLocationOutlined, PeopleAlt, ShieldOutlined, InsertDriveFileOutlined, HomeOutlined } from '@mui/icons-material'
import './dashboard.css'

const initialAlarms = ['Warning', 'Tamper alarm', 'Device offline', 'Tamper alarm'].map((type, id) => ({ id, type }))

export default function DashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const [alarms, setAlarms] = useState(initialAlarms)
  const [sound, setSound] = useState(() => localStorage.getItem('purview-alarm-sound') === 'true')
  const [saved, setSaved] = useState(false)
  return <div className="purview-dashboard">
    <header className="purview-header">
      <Link to="/admin/dashboard" className="brand">Purview</Link>
      <nav aria-label="Main navigation">
        <ManageDropdown />
        <StatisticsDropdown />
        <SelfServiceDropdown />
      </nav>
      <div className="account"><span className="avatar">P</span>
        <HeaderDropdown id="account" label="Purview" width={164} items={[
          { label: 'My Account', icon: <AssignmentOutlined />, to: '/admin/settings?section=account' },
          { label: 'AppKey', icon: <VpnKeyOutlined />, to: '/admin/settings?section=appkey' },
          { label: 'Reset Password', icon: <EditNoteOutlined />, to: '/admin/settings?section=password' },
          { label: 'Logout', icon: <LogoutOutlined />, onClick: () => { clearAccessToken(); dispatch(logout()); navigate('/admin/login', { replace: true }) } },
        ]} />
      </div>
    </header>
    <div className="tabbar"><Link className="home-tab" to="/admin/dashboard"><HomeOutlined />Home</Link></div>
    <main className="dashboard-content">
      <svg className="world-map" viewBox="0 0 1000 480" aria-hidden="true"><g fill="currentColor">
        <path d="M60 105 110 74 170 66 210 44 282 55 307 81 278 100 294 130 262 153 231 160 205 199 173 192 155 160 114 151 99 126Z M212 203 245 209 261 246 289 261 272 309 255 337 247 390 217 429 196 381 189 332 164 294 173 252Z M302 30 358 19 390 38 370 71 325 92 304 67Z" />
        <path d="M437 91 471 65 515 71 536 55 565 80 549 104 571 125 540 141 509 118 478 132 450 121Z M465 147 517 137 550 164 573 208 550 259 514 302 484 273 471 226 448 197Z M549 66 588 43 674 45 717 64 762 62 830 88 907 92 942 126 900 141 860 123 832 162 792 179 774 227 745 209 727 169 696 173 668 141 623 151 599 115 560 122Z M793 311 839 291 884 308 909 350 874 371 820 366 788 344Z" /></g>
        {[[170,100],[245,68],[252,338],[492,234],[560,109],[696,214]].map(([x,y]) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} fill="#f5cccc"><path d="M0 28C-4 13-12 3-12-5a12 12 0 0 1 24 0C12 3 4 13 0 28Z"/><circle cy="-5" r="4" fill="white"/></g>)}
      </svg>
      <div className="summary-grid">
        <section className="panel summary"><h2>Device Count</h2><div className="number">2</div><div className="detail"><span>Active</span><span>2</span></div></section>
        <section className="panel summary"><h2>Online</h2><div className="number">0</div><div className="detail"><span>Online this month</span><span>1</span></div></section>
        <section className="panel search"><h2>Search Service</h2><form onSubmit={event => { event.preventDefault(); setFilter(query.trim()) }}><label htmlFor="device-search"><span className="radio"/>Device</label><input id="device-search" aria-label="Device name or IMEI" value={query} onChange={event => setQuery(event.target.value)}/><button className="action teal" type="submit"><SearchOutlined/>Search</button></form>{filter && <p role="status">{ 'prisoner2'.includes(filter.toLowerCase()) || '86375'.includes(filter) ? 'prisoner2 — IMEI 86375…' : 'No matching device' }</p>}</section>
      </div>
      <div className="lower-grid">
        <section className="panel shortcuts"><h2>Shortcuts</h2><div className="shortcut-grid"><Link to="/admin/monitoring-center"><LocationOnOutlined/>Monitoring Center</Link><Link to="/admin/geofence"><MyLocationOutlined/>Geofence</Link><Link to="/admin/health-data"><ShieldOutlined/>Health Data</Link><Link to="/admin/device-management"><PeopleAlt/>Device Management</Link><Link to="/admin/add-device"><InsertDriveFileOutlined/>Add Device</Link></div></section>
        <section className="alarms"><div className="panel alarm-top"><h2>Alarm</h2><div className="alarm-controls"><button className="action orange" onClick={() => setAlarms([])}>Clear</button><label>Sound Switch<button className={`sound ${sound ? 'on' : ''}`} role="switch" aria-checked={sound} aria-label="Alarm sound" onClick={() => { setSound(!sound); setSaved(false) }}><span/>{sound ? 'ON' : 'OFF'}</button></label><button className="action orange" onClick={() => { localStorage.setItem('purview-alarm-sound', String(sound)); setSaved(true) }}>Set</button>{saved && <span role="status">Saved</span>}</div></div>
          <div className="table-scroll"><table><thead><tr><th>Device...</th><th>Except...</th><th>IMEI</th><th>Except...</th><th>Operation</th></tr></thead><tbody>{alarms.map(row => <tr key={row.id}><td>prisoner2</td><td title={row.type}>{row.type}</td><td>86375...</td><td>2026-1...</td><td><div className="row-actions"><button className="action orange" onClick={() => setAlarms(current => current.filter(alarm => alarm.id !== row.id))}><DeleteOutlined/>Clear</button><Link className="action yellow" to="/admin/alerts"><LocationOnOutlined/>Alarm Records</Link></div></td></tr>)}{alarms.length === 0 && <tr><td colSpan={5} className="empty">No alarms</td></tr>}</tbody></table></div>
        </section>
      </div>
    </main><footer>Purview copyright : Purview</footer>
  </div>
}




