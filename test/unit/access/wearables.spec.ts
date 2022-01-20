import { EntityType, Hashing } from 'dcl-catalyst-commons'
import { WearableCollection, wearables } from '../../../src/validations/access-checker/wearables'
import { buildDeployment, buildWearableDeployment } from '../../setup/deployments'
import { buildEntity } from '../../setup/entity'
import {
  buildExternalCalls,
  buildSubgraphs,
  fetcherWithoutAccess,
  fetcherWithTPW,
  fetcherWithValidCollectionAndCreator,
} from '../../setup/mock'

describe('Access: wearables', () => {
  it('When non-urns are used as pointers, then validation fails', async () => {
    const pointers = ['invalid-pointer']
    const deployment = buildWearableDeployment(pointers)
    const externalCalls = buildExternalCalls()

    const response = await wearables.validate({ deployment, externalCalls })
    expect(response.ok).toBeFalsy()
    expect(response.errors).toContain(
      'Wearable pointers should be a urn, for example (urn:decentraland:{protocol}:collections-v2:{contract(0x[a-fA-F0-9]+)}:{name}). Invalid pointer: (invalid-pointer)'
    )
  })

  it('When there is more than one pointer set, then validation fails', async () => {
    const pointers = [
      'urn:decentraland:ethereum:collections-v1:atari_launch:a',
      'urn:decentraland:ethereum:collections-v1:atari_launch:b',
    ]
    const deployment = buildWearableDeployment(pointers)
    const externalCalls = buildExternalCalls()

    const response = await wearables.validate({ deployment, externalCalls })
    expect(response.ok).toBeFalsy()
    expect(response.errors).toContain(`Only one pointer is allowed when you create a Wearable. Received: ${pointers}`)
  })

  it('When several pointers resolve to the same URN then accept both but fail with the access', async () => {
    const pointers = [
      'urn:decentraland:ethereum:collections-v1:atari_launch:atari_red_upper_body',
      'urn:decentraland:ethereum:collections-v1:0x4c290f486bae507719c562b6b524bdb71a2570c9:atari_red_upper_body',
    ]
    const deployment = buildWearableDeployment(pointers)
    const externalCalls = buildExternalCalls({
      ownerAddress: () => 'some address',
    })

    const response = await wearables.validate({ deployment, externalCalls })
    expect(response.ok).toBeFalsy()
    expect(response.errors).toContain(
      `The provided Eth Address 'some address' does not have access to the following wearable: 'urn:decentraland:ethereum:collections-v1:atari_launch:atari_red_upper_body'`
    )
  })

  it('When several pointers resolve to the same URN then accept both 2', async () => {
    const pointers = [
      'urn:decentraland:ethereum:collections-v1:dgtble_headspace:dgtble_hoodi_linetang_upper_body',
      'urn:decentraland:ethereum:collections-v1:0x574f64ac2e7215cba9752b85fc73030f35166bc0:dgtble_hoodi_linetang_upper_body',
    ]
    const deployment = buildWearableDeployment(pointers)
    const externalCalls = buildExternalCalls({
      ownerAddress: () => 'some address',
    })

    const response = await wearables.validate({ deployment, externalCalls })
    expect(response.ok).toBeFalsy()
    expect(response.errors).toContain(
      `The provided Eth Address 'some address' does not have access to the following wearable: 'urn:decentraland:ethereum:collections-v1:dgtble_headspace:dgtble_hoodi_linetang_upper_body'`
    )
  })

  it('When pointer resolves to L1 fails with invalid address', async () => {
    const pointers = ['urn:decentraland:ethereum:collections-v1:dgtble_headspace:dgtble_hoodi_linetang_upper_body']
    const deployment = buildWearableDeployment(pointers)
    const externalCalls = buildExternalCalls({
      ownerAddress: () => 'some address',
    })

    const response = await wearables.validate({ deployment, externalCalls })
    expect(response.ok).toBeFalsy()
    expect(response.errors).toContain(
      `The provided Eth Address 'some address' does not have access to the following wearable: 'urn:decentraland:ethereum:collections-v1:dgtble_headspace:dgtble_hoodi_linetang_upper_body'`
    )
  })

  it('When pointer resolves to L1 succeeds with valid address', async () => {
    const pointers = ['urn:decentraland:ethereum:collections-v1:dgtble_headspace:dgtble_hoodi_linetang_upper_body']
    const deployment = buildWearableDeployment(pointers)
    const externalCalls = buildExternalCalls({
      isAddressOwnedByDecentraland: () => true,
    })

    const response = await wearables.validate({ deployment, externalCalls })
    expect(response.ok).toBeTruthy()
  })

  it('When pointer resolves to base-avatar then it resolves okay only with decentraland address', async () => {
    const pointers = ['urn:decentraland:off-chain:base-avatars:BaseFemale']
    const deployment = buildWearableDeployment(pointers)
    const externalCalls = buildExternalCalls({
      isAddressOwnedByDecentraland: () => true,
    })

    const response = await wearables.validate({ deployment, externalCalls })
    expect(response.ok).toBeTruthy()
  })

  const collectionsUrl = 'http://someUrl'
  const blocksUrl = 'http://blocksUrl'
  const thirdPartySubgraphUrl = 'http://thirdPartyUrl'
  const ethAddress = 'address'
  const subgraphs = buildSubgraphs({
    L2: {
      thirdParty: thirdPartySubgraphUrl,
      collections: collectionsUrl,
      blocks: blocksUrl,
    },
  })

  it('When urn network belongs to L2, then L2 subgraph is used', async () => {
    const mockedQueryGraph = fetcherWithValidCollectionAndCreator(ethAddress)
    const externalCalls = buildExternalCalls({
      subgraphs,
      queryGraph: mockedQueryGraph,
      ownerAddress: () => ethAddress,
    })

    const deployment = buildWearableDeployment([
      'urn:decentraland:mumbai:collections-v2:0x8dec2b9bd86108430a0c288ea1b76c749823d104:1',
    ])

    await wearables.validate({ deployment, externalCalls })

    expect(mockedQueryGraph).toHaveBeenNthCalledWith(1, subgraphs.L2.blocks, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(2, subgraphs.L2.collections, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toBeCalledTimes(2)
  })

  it('When urn network belongs to L1, then L1 subgraph is used', async () => {
    const mockedQueryGraph = fetcherWithoutAccess()
    const externalCalls = buildExternalCalls({
      subgraphs,
      queryGraph: mockedQueryGraph,
      ownerAddress: () => ethAddress,
    })

    const deployment = buildWearableDeployment([
      'urn:decentraland:ethereum:collections-v2:0x8dec2b9bd86108430a0c288ea1b76c749823d104:1',
    ])

    await wearables.validate({ deployment, externalCalls })

    expect(mockedQueryGraph).toHaveBeenNthCalledWith(1, subgraphs.L1.blocks, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(2, subgraphs.L1.collections, expect.anything(), expect.anything())
  })

  it(`When urn network belongs to L2, and address doesn't have access, then L2 subgraph is used twice`, async () => {
    const mockedQueryGraph = fetcherWithoutAccess()
    const externalCalls = buildExternalCalls({
      subgraphs,
      queryGraph: mockedQueryGraph,
      ownerAddress: () => ethAddress,
    })

    const deployment = buildWearableDeployment([
      'urn:decentraland:mumbai:collections-v2:0x8dec2b9bd86108430a0c288ea1b76c749823d104:1',
    ])

    await wearables.validate({ deployment, externalCalls })

    expect(mockedQueryGraph).toBeCalledTimes(3)
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(1, subgraphs.L2.blocks, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(2, subgraphs.L2.collections, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(3, subgraphs.L2.collections, expect.anything(), expect.anything())
  })

  it(`When urn network belongs to L1, and address doesn't have access, then L1 subgraph is used twice`, async () => {
    const mockedQueryGraph = fetcherWithoutAccess()
    const externalCalls = buildExternalCalls({
      subgraphs,
      queryGraph: mockedQueryGraph,
      ownerAddress: () => ethAddress,
    })

    const deployment = buildWearableDeployment([
      'urn:decentraland:ethereum:collections-v2:0x8dec2b9bd86108430a0c288ea1b76c749823d104:1',
    ])

    await wearables.validate({ deployment, externalCalls })

    expect(mockedQueryGraph).toBeCalledTimes(3)
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(1, subgraphs.L1.blocks, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(2, subgraphs.L1.collections, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(3, subgraphs.L1.collections, expect.anything(), expect.anything())
  })

  it(`When urn network belongs to a third party wearable, then TPR subgraph is used twice`, async () => {
    const mockedQueryGraph = fetcherWithoutAccess()
    const externalCalls = buildExternalCalls({
      subgraphs,
      queryGraph: mockedQueryGraph,
      ownerAddress: () => ethAddress,
    })

    const deployment = buildWearableDeployment([
      'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection1:0',
    ])

    await wearables.validate({ deployment, externalCalls })

    expect(mockedQueryGraph).toBeCalledTimes(3)
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(1, subgraphs.L2.blocks, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(2, subgraphs.L2.thirdParty, expect.anything(), expect.anything())
    expect(mockedQueryGraph).toHaveBeenNthCalledWith(3, subgraphs.L2.thirdParty, expect.anything(), expect.anything())
  })

  describe('Given a third party urn', () => {
    const TPW_URN = 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:collection1:0'
    describe('When an item with given urn exists', () => {
      describe('And content hash is correct', () => {
        it('Then validation is correct', async () => {
          const content = [{ file: 'someFile', hash: 'someHash' }]
          const entity = buildEntity({ pointers: [TPW_URN], type: EntityType.WEARABLE, content })
          const deployment = buildDeployment({ entity })

          const { hash } = await Hashing.calculateMultipleHashesADR32(content)

          const mockedQueryGraph = fetcherWithTPW(TPW_URN, hash)
          const externalCalls = buildExternalCalls({
            subgraphs,
            queryGraph: mockedQueryGraph,
            ownerAddress: () => ethAddress,
          })

          const result = await wearables.validate({ deployment, externalCalls })
          expect(result.ok).toBeTruthy()
        })
      })
      describe('And content hash does not match', () => {
        const mockedQueryGraph = fetcherWithTPW(TPW_URN, 'someOtherHash')
        it('Then validation fails', async () => {
          const deployment = buildWearableDeployment([TPW_URN])
          const externalCalls = buildExternalCalls({
            subgraphs,
            queryGraph: mockedQueryGraph,
            ownerAddress: () => ethAddress,
          })
          const result = await wearables.validate({ deployment, externalCalls })

          expect(result.errors).toEqual([`The third-party item ${TPW_URN} does not exist.`])
        })
      })
    })
  })
})
