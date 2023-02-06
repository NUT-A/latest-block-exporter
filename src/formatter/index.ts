function prometheusFormatBlock(name: string, blockchain: string, number: number) {
    return `#TYPE ${name} gauge\n${name}{blockchain="${blockchain}"} ${number}`
}

function prometheusFormatBalance(network: string, address: string, number: number) {
    return `#TYPE wallet_balance gauge\nwallet_balance{network="${network}", address="${address}"} ${number}`
}

function prometheusFormatAllocation(network: string, indexer: string, name: string, ipfsHash: string, number: number) {
    return `#TYPE allocation_lifetime gauge\nallocation_lifetime{network="${network}", indexer="${indexer}", name="${ipfsHash} (${name})"} ${number}`
}

export class Formatter {
    formatLatest(blockchain: string, number: number) {
        return prometheusFormatBlock("latest_block", blockchain, number)
    }

    formatCurrent(blockchain: string, number: number) {
        return prometheusFormatBlock("current_block", blockchain, number)
    }

    formatBalance(network: string, address: string, number: number) {
        return prometheusFormatBalance(network, address, number)
    }

    formatAllocation(network: string, indexer: string, name: string, ipfsHash: string, number: number) {
        return prometheusFormatAllocation(network, indexer, name, ipfsHash, number)
    }
}