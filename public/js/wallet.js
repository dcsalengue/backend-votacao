const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); // Algoritmo usado por Bitcoin e Ethereum

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
            .digest('hex');
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('Você não pode assinar transações de outras carteiras!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (!this.fromAddress) return true; // Transação de mineração

        if (!this.signature || this.signature.length === 0) {
            throw new Error('Transação não assinada!');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class BlockchainWithWallet {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(0, Date.now(), "Genesis Block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        const block = new Block(this.chain.length, Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Bloco minerado com sucesso!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transação precisa de endereço de origem e destino!');
        }

        if (!transaction.isValid()) {
            throw new Error('Transação inválida!');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.data) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.data.every(tx => tx.isValid())) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Testando a wallet
const myKey = ec.genKeyPair();
const myWalletAddress = myKey.getPublic('hex');

const myCoin = new BlockchainWithWallet();

const tx1 = new Transaction(myWalletAddress, 'public_key_destinatário', 10);
tx1.signTransaction(myKey);
myCoin.addTransaction(tx1);

console.log('Iniciando mineração...');
myCoin.minePendingTransactions(myWalletAddress);

console.log('Saldo da minha carteira:', myCoin.getBalanceOfAddress(myWalletAddress));
console.log('Blockchain válida?', myCoin.isChainValid());
