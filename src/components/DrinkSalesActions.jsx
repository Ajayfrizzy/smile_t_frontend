import React from 'react';
import RoleBasedView from './RoleBasedView';

export default function DrinkSalesActions({ role }) {
  return (
    <>
      {/* Superadmin and Barmen: Make sales and view sales */}
      <RoleBasedView allowed={['superadmin', 'barmen']} role={role}>
        <button aria-label="Record Drink Sale" role="button">Record Drink Sale</button>
        <button aria-label="View Drink Sales" role="button">View Drink Sales</button>
      </RoleBasedView>

      {/* Supervisor: View drinks sales only */}
      <RoleBasedView allowed={['supervisor']} role={role}>
        <span>View Drinks Sales Only</span>
      </RoleBasedView>
    </>
  );
}
