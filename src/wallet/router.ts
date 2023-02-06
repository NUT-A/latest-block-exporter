import { Router } from "express";
import { WalletFetcher } from ".";
import { Formatter } from "../formatter";

type Network = "eth-mainnet" | "eth-goerli"

export class WalletRouterFactory {
    private formatter: Formatter

    private ethMainnetFetcher: WalletFetcher;
    private ethGoerliFetcher: WalletFetcher;

    constructor(formatter: Formatter) {
        this.formatter = formatter

        this.ethMainnetFetcher = new WalletFetcher("https://eth.rpc.blxrbdn.com");
        this.ethGoerliFetcher = new WalletFetcher("https://eth-goerli.public.blastapi.io");
    }

    private async getBalance(network: Network, address: string): Promise<string | null> {
        let fetcher: WalletFetcher;

        switch (network) {
            case "eth-mainnet":
                fetcher = this.ethMainnetFetcher;
                break;
            case "eth-goerli":
                fetcher = this.ethGoerliFetcher;
                break;
            default:
                throw new Error("Invalid network");
        }

        const balance = await fetcher.getBalance(address);

        if (balance === null) {
            return null;
        }

        const response = this.formatter.formatBalance(network, address, balance);

        return response;
    }

    private async getBalances(network: Network, addresses: string[]): Promise<string> {
        const promises = addresses.map( (address) => { return this.getBalance(network, address) })
        const balances: string[] = []

        for (const promise of promises) {
            try {
                const balance = await promise;
                
                if (balance !== null) {
                    balances.push(balance);
                }
            } catch (e) {
                console.log(e);
            }
        }

        return balances.join("\n\n");
    }

    public make(): Router {
        const router = Router();

        router.get("/:network/:addresses", async (req, res) => {
            const network = req.params.network as Network;
            
            const addressesString = req.params.addresses;

            const addresses = addressesString.split(",");
            const response = await this.getBalances(network, addresses);

            res.send(response);
        });

        return router;
    }
}