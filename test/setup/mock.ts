import { Fetcher, Timestamp } from 'dcl-catalyst-commons'
import { ExternalCalls } from '../../src/types'
import { WearableCollection } from '../../src/validations/access-checker/wearables'

export const buildExternalCalls = (externalCalls?: Partial<ExternalCalls>): ExternalCalls => ({
  isContentStoredAlready: () => Promise.resolve(new Map()),
  fetchContentFileSize: () => Promise.resolve(undefined),
  validateSignature: () => Promise.resolve({ ok: true }),
  ownerAddress: () => '',
  isAddressOwnedByDecentraland: () => false,
  queryGraph: jest.fn(),
  subgraphs: buildSubgraphs(),
  ...externalCalls,
})

type Subgraphs = ExternalCalls['subgraphs']
export const buildSubgraphs = (subgraphs?: Partial<Subgraphs>): Subgraphs => ({
  L1: {
    landManager: '',
    blocks: '',
    collections: '',
  },
  L2: {
    thirdParty: '',
    blocks: '',
    collections: '',
  },
  ...subgraphs,
})

let queryGraph: Fetcher['queryGraph']
export const mockedQueryGraph = () => jest.fn() as jest.MockedFunction<typeof queryGraph>

const COMMITTEE_MEMBER = '0xCOMMITEE_MEMBER'
export const buildMockedQueryGraph = (
  collection?: Partial<WearableCollection>,
  tpw: { urn: string; contentHash: string } = { urn: '', contentHash: '' }
) =>
  mockedQueryGraph().mockImplementation(async (url, _query, _variables) => {
    const withDefaults = {
      collections: [
        {
          creator: '',
          managers: [],
          isApproved: false,
          isCompleted: false,
          items: [
            {
              managers: [],
              contentHash: '',
            },
          ],
          ...collection,
        },
      ],
      accounts: [{ id: COMMITTEE_MEMBER }],
    }
    if (url.includes('block')) {
      return Promise.resolve({ after: [{ number: 10 }], fiveMinAfter: [{ number: 5 }] })
    } else if (url.includes('thirdParty')) {
      return Promise.resolve({ items: [{ id: tpw.urn, contentHash: tpw.contentHash }] })
    } else {
      return Promise.resolve(withDefaults)
    }
  })

export const fetcherWithoutAccess = () => buildMockedQueryGraph()

export const fetcherWithValidCollectionAndCreator = (address: string) =>
  buildMockedQueryGraph({ creator: address.toLowerCase(), isCompleted: true, isApproved: false })

export const fetcherWithValidCollectionAndCollectionManager = (address: string) =>
  buildMockedQueryGraph({ managers: [address.toLowerCase()], isCompleted: true, isApproved: false })

export const fetcherWithValidCollectionAndItemManager = (address: string) =>
  buildMockedQueryGraph({
    items: [{ managers: [address.toLowerCase()], contentHash: '' }],
    isCompleted: true,
    isApproved: false,
  })

export const fetcherWithValidCollectionAndCreatorAndContentHash = (address: string, contentHash: string) =>
  buildMockedQueryGraph({
    creator: address.toLowerCase(),
    isCompleted: true,
    isApproved: false,
    items: [{ managers: [], contentHash }],
  })

export const fetcherWithInvalidCollectionAndCreator = (address: string) =>
  buildMockedQueryGraph({ creator: address.toLowerCase(), isCompleted: true, isApproved: true })

export const fetcherWithInvalidCollectionAndCollectionManager = (address: string) =>
  buildMockedQueryGraph({ managers: [address.toLowerCase()], isCompleted: true, isApproved: true })

export const fetcherWithInvalidCollectionAndItemManager = (address: string) =>
  buildMockedQueryGraph({
    items: [{ managers: [address.toLowerCase()], contentHash: '' }],
    isCompleted: true,
    isApproved: true,
  })

export const fetcherWithInvalidCollectionAndContentHash = (contentHash: string) =>
  buildMockedQueryGraph({
    items: [{ managers: [], contentHash }],
    isCompleted: true,
    isApproved: true,
  })

export const fetcherWithTPW = (urn: string, contentHash: string) => buildMockedQueryGraph({}, { urn, contentHash })
