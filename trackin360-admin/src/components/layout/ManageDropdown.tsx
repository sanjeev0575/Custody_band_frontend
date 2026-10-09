import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExpandMore, MyLocationOutlined, PeopleAlt } from '@mui/icons-material'
import './manage-dropdown.css'

export default function ManageDropdown() {
  const [open, setOpen] = useState(false)
  return <div className="manage-dropdown" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}
    onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.querySelector('button')?.focus(); setOpen(false) } }}>
    <button className={`manage-dropdown-trigger ${open ? 'is-open' : ''}`} aria-expanded={open} aria-controls="manage-options"
      onFocus={() => setOpen(true)} onClick={() => setOpen(true)}>
      <PeopleAlt />Manage<ExpandMore />
    </button>
    {open && <div id="manage-options" className="manage-dropdown-options" aria-label="Manage options">
      <Link to="/admin/device-management" onClick={() => setOpen(false)}><PeopleAlt />Device Management</Link>
      <Link to="/admin/monitoring-center" onClick={() => setOpen(false)}><MyLocationOutlined />Monitoring Center</Link>
    </div>}
  </div>
}
