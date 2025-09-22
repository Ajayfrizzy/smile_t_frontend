import React from 'react';
import RoleBasedView from './RoleBasedView';

export default function BookingActions({ role }) {
  return (
    <>
      {/* Superadmin and Receptionist: Receive online bookings and make offline bookings */}
      <RoleBasedView allowed={['superadmin', 'receptionist']} role={role}>
        <button aria-label="Receive Online Booking" role="button">Receive Online Booking</button>
        <button aria-label="Make Offline Booking" role="button">Make Offline Booking</button>
      </RoleBasedView>

      {/* Supervisor: View bookings only */}
      <RoleBasedView allowed={['supervisor']} role={role}>
        <span>View Bookings Only</span>
      </RoleBasedView>
    </>
  );
}
