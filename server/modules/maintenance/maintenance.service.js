import {
  disableMaintenance,
  enableMaintenance,
  getMaintenanceState,
} from './maintenance.repository.js'


export async function getMaintenanceStatus() {
  return getMaintenanceState()
}


export async function activateMaintenance() {
  return enableMaintenance()
}


export async function deactivateMaintenance() {
  return disableMaintenance()
}