import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/avatar.png'

const AppHeaderDropdown = () => {
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle
        placement="bottom-end"
        className="py-0 pe-0"
        caret={false}
      >
        <CAvatar
          src={avatar8}
          size="sm"
          style={{ marginTop: '2px' }} // move avatar slightly down
        />
      </CDropdownToggle>

      <CDropdownMenu
        className="pt-0"
        placement="bottom-end"
        style={{ fontSize: '0.75rem', minWidth: '180px' }} // Smaller text + smaller menu
      >
        <CDropdownHeader
          className="bg-body-secondary fw-semibold mb-2"
          style={{ fontSize: '0.7rem', padding: '6px 10px' }}
        >
          Account
        </CDropdownHeader>

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilBell} className="me-2" size="sm" />
          Updates
          <CBadge color="info" className="ms-2" style={{ fontSize: '0.6rem' }}>
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilEnvelopeOpen} className="me-2" size="sm" />
          Messages
          <CBadge color="success" className="ms-2" style={{ fontSize: '0.6rem' }}>
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilTask} className="me-2" size="sm" />
          Tasks
          <CBadge color="danger" className="ms-2" style={{ fontSize: '0.6rem' }}>
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilCommentSquare} className="me-2" size="sm" />
          Comments
          <CBadge color="warning" className="ms-2" style={{ fontSize: '0.6rem' }}>
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownHeader
          className="bg-body-secondary fw-semibold my-2"
          style={{ fontSize: '0.7rem', padding: '6px 10px' }}
        >
          Settings
        </CDropdownHeader>

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilUser} className="me-2" size="sm" />
          Profile
        </CDropdownItem>

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilSettings} className="me-2" size="sm" />
          Settings
        </CDropdownItem>

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilCreditCard} className="me-2" size="sm" />
          Payments
          <CBadge color="secondary" className="ms-2" style={{ fontSize: '0.6rem' }}>
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilFile} className="me-2" size="sm" />
          Projects
          <CBadge color="primary" className="ms-2" style={{ fontSize: '0.6rem' }}>
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem href="#" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>
          <CIcon icon={cilLockLocked} className="me-2" size="sm" />
          Lock Account
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
