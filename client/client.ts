import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { serialize } from "borsh";
import fs from "fs";
import readline from "readline";

class CalculatorInstruction {
  instruction: number;
  num1: number;
  num2: number;

  constructor(props: { instruction: number; num1: number; num2: number }) {
    this.instruction = props.instruction;
    this.num1 = props.num1;
    this.num2 = props.num2;
  }

  serialize(): Buffer {
    return Buffer.from(
      serialize(
        {
          struct: {
            instruction: "u8",
            num1: "i64",
            num2: "i64",
          },
        },
        this
      )
    );
  }
}

class CalculatorAccount {
  result: number;

  constructor(result: number) {
    this.result = result;
  }

  static deserialize(data: Buffer): CalculatorAccount {
    const result = data.readBigInt64LE(0);
    return new CalculatorAccount(Number(result));
  }
}

const PROGRAM_ID = new PublicKey(
  "5kib9gkY3BS5XtsjQbVQyWQ55ug2x2DnNkr6XtjAfmnj"
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  const payerKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync("wallet.json", "utf-8")))
  );
  const calculatorAccount = Keypair.generate();

  // Create account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payerKeypair.publicKey,
    newAccountPubkey: calculatorAccount.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(8),
    space: 8,
    programId: PROGRAM_ID,
  });

  const createAccountTx = new Transaction().add(createAccountInstruction);
  await sendAndConfirmTransaction(connection, createAccountTx, [
    payerKeypair,
    calculatorAccount,
  ]);
  console.log(
    "Calculator account created:",
    calculatorAccount.publicKey.toBase58()
  );

  while (true) {
    const operation = await question("Enter operation (add/subtract/quit): ");
    if (operation === "quit") break;

    const num1 = parseInt(await question("Enter first number: "));
    const num2 = parseInt(await question("Enter second number: "));

    const instruction = new CalculatorInstruction({
      instruction: operation === "add" ? 0 : 1,
      num1,
      num2,
    });

    const tx = new Transaction().add(
      new TransactionInstruction({
        keys: [
          {
            pubkey: calculatorAccount.publicKey,
            isSigner: false,
            isWritable: true,
          },
        ],
        programId: PROGRAM_ID,
        data: instruction.serialize(),
      })
    );

    const signature = await sendAndConfirmTransaction(connection, tx, [
      payerKeypair,
    ]);
    console.log("Transaction signature:", signature);

    // Fetch and display the result
    const accountInfo = await connection.getAccountInfo(
      calculatorAccount.publicKey
    );
    if (accountInfo && accountInfo.data) {
      const calculatorState = CalculatorAccount.deserialize(accountInfo.data);
      console.log("Calculator result:", calculatorState.result);
    } else {
      console.log("Failed to fetch account data");
    }
  }

  rl.close();
}

main()
  .then(() => process.exit())
  .catch((err) => {
    console.error(err);
    process.exit(-1);
  });
