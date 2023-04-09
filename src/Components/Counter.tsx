import React, { useState, useEffect } from "react"
import SmartAccount from "@biconomy-sdk-dev/smart-account"
import abi from "../utils/counterAbi.json"
import { ethers } from "ethers"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface Props {
  smartAccount: SmartAccount
  provider: any
  acct: any
}

const Counter: React.FC<Props> = ({ smartAccount, provider, acct }) => {
  const [count, setCount] = useState<number>(0)
  const [counterContract, setCounterContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [amount, setAmount] = useState<number>(1)
  const txArray = []

  const counterAddress = "0x47c248bd6b419ad162c0033f680f3183b6483763"
  interface Tx {
    to: string
    data: string
  }
  useEffect(() => {
    setIsLoading(true)
    getCount(false)
  }, [])

  const getCount = async (isUpdating: boolean) => {
    const contract = new ethers.Contract(counterAddress, abi, provider)
    setCounterContract(contract)
    const currentCount = await contract.count()
    setCount(currentCount.toNumber())
    if (isUpdating) {
      toast.success(`count has been updated by ${amount}!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
    }
  }

  const incrementCount = async () => {
    try {
      toast.info("processing count on the blockchain!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })

      const incrementTx =
        await counterContract.populateTransaction.incrementCount()
      const tx1 = {
        to: counterAddress,
        data: incrementTx.data,
      }

      if (amount > 1) {
        // This uses batch transactions to increment the count by the amount specified in gassless way (sign txn prompt will come in this)
        console.log("Batch transaction is used")

        for (let index = 0; index < amount; index++) {
          txArray.push(tx1)
        }
        const txResponse = await smartAccount.sendGaslessTransactionBatch({
          transactions: txArray,
        })
        const txHash = await txResponse.wait()
        console.log(txHash)
      } else {
        // This will increment the count by only 1 in gassless way (no sign txn prompt will come in this)
        console.log("Simple transaction is used")

        const txResponse = await smartAccount.sendGaslessTransaction({
          transaction: tx1,
        })
        const txHash = await txResponse.wait()
        console.log(txHash)
      }

      getCount(true)
    } catch (error) {
      console.log({ error })
      toast.error("error occured check the console", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      })
    }
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div>Count is {count}</div>
      <br />
      <input
        type="number"
        placeholder="Enter the amount by which you want to increment"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button onClick={() => incrementCount()}>Increment Count</button>
    </>
  )
}

export default Counter
