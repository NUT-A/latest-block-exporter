import Web3 from 'web3';

export class WalletFetcher {
  private web3: Web3;

  constructor(rpc: string) {
    this.web3 = new Web3(rpc);
  }

  public async getBalance(address: string): Promise<number | null> {
    try {
      const weiBalance = await this.web3.eth.getBalance(address);
      const balance = this.web3.utils.fromWei(weiBalance, 'ether');

      return Number(balance);
    } catch (e) {
      return null;
    }
  }
}