import axios from "axios";
import { AllocationInfo, GraphQLResponse, AllocationResponse, OperatorInfo, OperatorsResponse } from "./types";

export class SubgraphManager {
    private subgraphURL: string

    constructor(subgraphURL: string) {
        this.subgraphURL = subgraphURL
    }

    async fetchAllocations(indexer: string): Promise<AllocationInfo[]> {
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
        const responseBody = response.data as GraphQLResponse<AllocationResponse>

        return responseBody.data.allocations.map((allocation) => {
            return {
                name: allocation.subgraphDeployment.originalName,
                ipfsHash: allocation.subgraphDeployment.ipfsHash,
                creationTime: allocation.createdAt
            }
        })
    }

    async fetchOperators(indexer: string): Promise<OperatorInfo[]> {
        const body = {
            "query": `query{indexers(where:{id:"${indexer.toLowerCase()}"}){account{operators{id}}}}`,
            "variables": {}
        }

        const response = await axios.post(this.subgraphURL, body)
        const responseBody = response.data as GraphQLResponse<OperatorsResponse>

        return responseBody.data.indexers[0].account.operators.map((operator) => {
            return {
                id: operator.id
            }
        })
    }
}

export class GraphManager {
    private ethMainnetSubgraphManager: SubgraphManager
    private ethGoerliSubgraphManager: SubgraphManager

    constructor(ethMainnetSubgraphManager: SubgraphManager, ethGoerliSubgraphManager: SubgraphManager) {
        this.ethMainnetSubgraphManager = ethMainnetSubgraphManager
        this.ethGoerliSubgraphManager = ethGoerliSubgraphManager
    }

    private getManager(network: Network): SubgraphManager {
        switch (network) {
            case "eth-mainnet":
                return this.ethMainnetSubgraphManager;
            case "eth-goerli":
                return this.ethGoerliSubgraphManager;
            default:
                throw new Error("Invalid network");
        }
    }

    public async fetchAllocations(network: Network, indexer: string): Promise<AllocationInfo[]> {
        let manager = this.getManager(network);
        return manager.fetchAllocations(indexer);
    }

    public async fetchOperators(network: Network, indexer: string): Promise<OperatorInfo[]> {
        let manager = this.getManager(network);
        return manager.fetchOperators(indexer);
    }
}