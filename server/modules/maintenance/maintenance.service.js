import {
  disableMaintenance,
  enableMaintenance,
  getMaintenanceState,
  updateMaintenanceMessage,
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


export async function saveMaintenanceMessage(
  message,
) {
  return updateMaintenanceMessage(
    message,
  )
}