# Escrow Contracts
Escrow Calculator on Solana

## Description
The Escrow Calculator is a Solana program designed to perform basic arithmetic operations, specifically addition and subtraction. This project leverages the Solana blockchain's capabilities to create a smart contract that not only executes these operations but also stores the final results in a program account. Users can input two numbers and choose the desired operation, with the result securely recorded on the blockchain. This project serves as a practical example of utilizing Rust and Solana for building decentralized applications.
## Getting Started

### Installing

 **Download the project**:
   Clone the repository using the following command:
   ```bash
   git clone https://github.com/yourusername/escrow-contracts.git
   ```
### Executing program
  **Setup Wallet**
  ```bash
  solana-keygen new -o ./wallet.json
  solana config set --url devnet
  solana airdrop 2
  ```
  **Build the contract**
  ```bash
  cargo build-bpf
  ```
  **Deploy the contract**
  ```bash
  solana program deploy target/deploy/solana_calculator.so
  ```
  **Navigate to client directory**
  ```bash
  cd client/
  ```
  **Note:** Replace wallet.json with previously generated wallet file

  **Install dependencies**
  ```bash
  npm i
  ```
  **Start CLI**
  ```bash
  ts-node client.ts
  ```
  **Interact with the CLI**
