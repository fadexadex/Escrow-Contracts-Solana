use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CalculatorAccount {
    pub result: i64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CalculatorInstruction {
    Add { num1: i64, num2: i64 },
    Subtract { num1: i64, num2: i64 },
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = CalculatorInstruction::try_from_slice(instruction_data)?;
    let account = &accounts[0];

    let mut calculator_account = CalculatorAccount::try_from_slice(&account.data.borrow())?;

    match instruction {
        CalculatorInstruction::Add { num1, num2 } => {
            calculator_account.result = num1 + num2;
            msg!("Addition result: {}", calculator_account.result);
        }
        CalculatorInstruction::Subtract { num1, num2 } => {
            calculator_account.result = num1 - num2;
            msg!("Subtraction result: {}", calculator_account.result);
        }
    }

    calculator_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    Ok(())
}