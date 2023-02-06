import { Router } from "express";
import { AllocationManager } from ".";
import { Formatter } from "../formatter";

export class AllocationRouterFactory {
    private formatter: Formatter

    private ethMainnetAllocationManager: AllocationManager
    private ethGoerliAllocationManager: AllocationManager

    constructor(formatter: Formatter) {
        this.formatter = formatter

        this.ethMainnetAllocationManager = new AllocationManager("https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet")
        this.ethGoerliAllocationManager = new AllocationManager("https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-goerli")
    }

    private async getAllocations(network: Network, indexer: string): Promise<string> {
        let manager: AllocationManager;

        switch (network) {
            case "eth-mainnet":
                manager = this.ethMainnetAllocationManager;
                break;
            case "eth-goerli":
                manager = this.ethGoerliAllocationManager;
                break;
            default:
                throw new Error("Invalid network");
        }

        const allocations = await manager.fetchAllocation(indexer);
        
        return allocations.map((allocation) => {
            return this.formatter.formatAllocation(network, indexer, allocation.name, allocation.ipfsHash, allocation.creationTime)
        }).join("\n\n")
    }

    private async getAllocationsForIndexers(network: Network, indexers: string[]): Promise<string> {
        const promises = indexers.map( (indexer) => { return this.getAllocations(network, indexer) })
        const allocations: string[] = []

        for (const promise of promises) {
            try {
                allocations.push(await promise);
            } catch (e) {
                console.log(e);
            }
        }

        return allocations.join("\n\n");
    }

    public make(): Router {
        const router = Router();

        router.get("/:network/:indexers", async (req, res) => {
            const network = req.params.network as Network;
            const indexers = req.params.indexers as string;

            const allocations = await this.getAllocationsForIndexers(network, indexers.replace(" ", "").split(","));

            res.send(allocations);
        });

        return router;
    }   
}