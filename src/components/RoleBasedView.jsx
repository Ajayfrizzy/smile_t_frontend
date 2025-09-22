import React from 'react';

/**
 * Usage:
 * <RoleBasedView allowed={['superadmin', 'receptionist']} role={user.role}>
 *   <button>Add Booking</button>
 * </RoleBasedView>
 */
export default function RoleBasedView({ allowed, role, children }) {
  if (!allowed.includes(role)) return null;
  return <>{children}</>;
}
