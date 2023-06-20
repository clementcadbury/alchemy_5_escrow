import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck,faXmark

} from '@fortawesome/free-solid-svg-icons'

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

export default function Escrow({
  account,
  address,
  depositor,
  arbiter,
  beneficiary,
  // handleApprove,
  provider,
  EscrowInterface
}) {

  const [value, setValue] = useState('0');
  const [isApproved,setIsApproved] = useState(false);


  useEffect(() => {
    async function getEscrow() {
      const escrowContract = new ethers.Contract(address,EscrowInterface,provider);
      const _isApproved = await escrowContract.isApproved();
      //console.log(escrowContract);
      const balance = await provider.getBalance(address);
      setValue(balance);
      setIsApproved(_isApproved);
    }
    getEscrow();
  },[address,EscrowInterface,provider,isApproved]);

  async function handleApprove(){
    const escrowContract = new ethers.Contract(address,EscrowInterface,provider);
    escrowContract.on('Approved', () => {
      setIsApproved(true);
    });
    const signer = provider.getSigner();
    try {
      const approveTxn = await escrowContract.connect(signer).approve();
      await approveTxn.wait();
    } catch(err){
      toast.error("Error approving, are you the arbiter?");
    }
  }

  function getButton() {
    if ( account === arbiter.toLowerCase() && !isApproved) {
      return (
        <button
          className="btn btn-primary btn-sm mt-2 px-3"
          id={"btn"+address}
          onClick={(e) => {
            e.preventDefault();

            handleApprove();
          }}
        >
          Approve
        </button>
      );
    }
  }

  return (

    <div className="card my-2 mx-3 existing-contract">
      <h5 className="card-header" style={{cursor:'pointer'}} data-bs-toggle="collapse" data-bs-target={'#escrowBody' + address} aria-controls={'escrowBody' + address}>
        <button className='link-button'>
          {isApproved
            ? <FontAwesomeIcon icon={faCheck} className="me-2" title="Validated" style={{color: "#008000",}} />
            : <FontAwesomeIcon icon={faXmark} className="me-2" title="Not Validated" style={{color:'#800000'}} />
          }
          {address}
        </button>
      </h5>
      <div id={'escrowBody' + address} className="collapse">
        <div className="card-body">
          <ul className="m-0 p-0">
            <li>
              <div>Depositor</div>
              <div>{depositor}</div>
            </li>
            <li>
              <div>Arbiter</div>
              <div>{arbiter}</div>
            </li>
            <li>
              <div>Beneficiary</div>
              <div>{beneficiary}</div>
            </li>
            <li>
              <div>Value (Eth)</div>
              <div>{ethers.utils.formatEther(value)}</div>
            </li>
            {getButton()}
          </ul>
        </div>
      </div>
    </div>
  )


  /*
      <div className="existing-contract">
        <ul className="fields">
          <li>
            <div> Address </div>
            <div> {address} </div>
          </li>
          <li>
            <div> Depositor </div>
            <div> {depositor} </div>
          </li>
          <li>
            <div> Arbiter </div>
            <div> {arbiter} </div>
          </li>
          <li>
            <div> Beneficiary </div>
            <div> {beneficiary} </div>
          </li>
          <li>
            <div> Value (Eth) </div>
            <div> {ethers.utils.formatEther(value)} </div>
          </li>
          {getButton()}
        </ul>
      </div>
    );*/
}
