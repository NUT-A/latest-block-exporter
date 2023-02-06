import axios from "axios";

export type AllocationInfo = {
    name: string
    ipfsHash: string
    creationTime: number
}

type GraphQLResponse = {
    data: {
        allocations: [
            {
                createdAt: number
                subgraphDeployment: {
                    ipfsHash: string
                    originalName: string
                }
            }
        ]
    }
}

export class AllocationManager {
    private subgraphURL: string

    constructor(subgraphURL: string) {
        this.subgraphURL = subgraphURL
    }

    async fetchAllocation(indexer: string): Promise<AllocationInfo[]> {
        const body = {
            "query": `{
                allocations(where:{indexer:"${indexer.toLowerCase()}",closedAtBlockNumber:null}) {
                    createdAt
                    subgraphDeployment {
                        ipfsHash
                        originalName
                    }
                }
            }`,
            "variables": {}
        }

        const response = await axios.post(this.subgraphURL, body)
        const responseBody = response.data as GraphQLResponse

        return responseBody.data.allocations.map((allocation) => {
            return {
                name: allocation.subgraphDeployment.originalName,
                ipfsHash: allocation.subgraphDeployment.ipfsHash,
                creationTime: allocation.createdAt
            }
        })
    }
}