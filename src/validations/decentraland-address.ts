import { conditionalValidation } from "../types"

/** Validate that the address used was owned by Decentraland */
export const decentralandAddress = conditionalValidation({
  predicate: async ({ deployment, externalCalls }) => {
    const address = externalCalls.ownerAddress(deployment.auditInfo)
    return await externalCalls.isAddressOwnedByDecentraland(address)
  },
  message: ({ deployment, externalCalls }) => {
    const address = externalCalls.ownerAddress(deployment.auditInfo)
    return `Expected an address owned by decentraland. Instead, we found ${address}`
  },
})
