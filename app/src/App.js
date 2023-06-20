import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import EscrowContract from './artifacts/contracts/Escrow.sol/Escrow';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const EscrowInterface = new ethers.utils.Interface(EscrowContract.abi);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [depositorEscrows, setDepositorEscrows] = useState([]);
  const [arbiterEscrows, setArbiterEscrows] = useState([]);
  const [beneficiaryEscrows, setBeneficiaryEscrows] = useState([]);
  const [account, setAccount] = useState('');
  const [signer, setSigner] = useState({});
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    provider.provider.on('accountsChanged', (accounts) => {
      setAccount(accounts[0]);
      //console.log('** change account : ' + account + ' accounts0  :' + accounts[0]);
    });
    return () => {
      provider.provider.removeAllListeners('accountsChanged');
    };
  }, []);

  useEffect(() => {
    async function testLogs() {
      /*const logs = await provider.getLogs({
        topics: [
          ethers.utils.id(EscrowInterface.getEvent('EscrowDeployed').format('sighash')),
          ethers.utils.hexZeroPad(account, 128)
        ],
        fromBlock: 1,
        //toBlock: currentBlock
      });

      console.log(logs);
      console.log(EscrowInterface.parseLog(logs[0]));*/

    }
    testLogs();

  }, []);

  useEffect(() => {
    async function getAccounts() {
      if (account === '') {
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
      } else {


        const depositorLogs = await provider.getLogs({
          topics: [
            ethers.utils.id(EscrowInterface.getEvent('EscrowDeployed').format('sighash')),
            ethers.utils.hexZeroPad(account, 32)
          ],
          fromBlock: 1,
          //toBlock: currentBlock
        });
        let depositorEscrowsTab = [];
        for (let i = 0; i < depositorLogs.length; i++) {
          const parsedLog = EscrowInterface.parseLog(depositorLogs[i]);
          depositorEscrowsTab.push(escrowObj(
            depositorLogs[i].address,
            parsedLog.args._depositor,
            parsedLog.args._arbiter,
            parsedLog.args._beneficiary
          ));
        }
        setDepositorEscrows(depositorEscrowsTab);

        const arbiterLogs = await provider.getLogs({
          topics: [
            ethers.utils.id(EscrowInterface.getEvent('EscrowDeployed').format('sighash')),
            null,
            ethers.utils.hexZeroPad(account, 32)
          ],
          fromBlock: 1,
          //toBlock: currentBlock
        });
        let arbiterEscrowsTab = [];
        for (let i = 0; i < arbiterLogs.length; i++) {
          const parsedLog = EscrowInterface.parseLog(arbiterLogs[i]);
          arbiterEscrowsTab.push(escrowObj(
            arbiterLogs[i].address,
            parsedLog.args._depositor,
            parsedLog.args._arbiter,
            parsedLog.args._beneficiary
          ));
        }
        setArbiterEscrows(arbiterEscrowsTab);


        const beneficiaryLogs = await provider.getLogs({
          topics: [
            ethers.utils.id(EscrowInterface.getEvent('EscrowDeployed').format('sighash')),
            null,
            null,
            ethers.utils.hexZeroPad(account, 32)
          ],
          fromBlock: 1,
          //toBlock: currentBlock
        });
        let beneficiaryEscrowsTab = [];
        for (let i = 0; i < beneficiaryLogs.length; i++) {
          const parsedLog = EscrowInterface.parseLog(beneficiaryLogs[i]);
          beneficiaryEscrowsTab.push(escrowObj(
            beneficiaryLogs[i].address,
            parsedLog.args._depositor,
            parsedLog.args._arbiter,
            parsedLog.args._beneficiary
          ));
        }
        setBeneficiaryEscrows(beneficiaryEscrowsTab);


        //console.log(depositorLogs);
        //console.log(EscrowInterface.parseLog(depositorLogs[0]));
      }
      setSigner(provider.getSigner());
    }

    getAccounts();

    if (account) {
      toast.info('Account ' + account, {
        toastId: account
      });
    }

  }, [account]);

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {

    } else {
      newContract();
    }

    setValidated(true);
  };

  async function newContract() {
    const depositor = account;
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const weiValue = ethers.utils.parseUnits(document.getElementById('eth').value, "ether")
    const value = ethers.BigNumber.from(weiValue);
    try {
      const escrowContract = await deploy(signer, arbiter, beneficiary, value);
      await escrowContract.deployed();
      const escrow = escrowObj(escrowContract.address, depositor, arbiter, beneficiary);
      setDepositorEscrows([...depositorEscrows, escrow]);
    } catch (err) {
      if (err.code === -32603) {
        toast.error("Internal JSON-RPC error, probably wrong nonce");
      } else {
        toast.error("Error " + err.code + ", check console for details");
      }
      console.log(err);
    }



    /*const escrow = {
      address: escrowContract.address,
      depositor,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };*/


  }

  function escrowObj(address, depositor, arbiter, beneficiary) {
    const escrow = {
      address,
      depositor,
      arbiter,
      beneficiary,
      provider,
      EscrowInterface,
    }
    return escrow;
  }


  return (
    <Container className="my-2">
      <Row>
        <Col className="mx-1">
          <Card>
            <Card.Header as={'h3'}>New Contract</Card.Header>
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <InputGroup className="mb-3" >
                  <InputGroup.Text>Depositor</InputGroup.Text>
                  <Form.Control type="text" id="depositor" aria-label="Depositor" disabled value={account} />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Arbiter</InputGroup.Text>
                  <Form.Control type="text" id="arbiter" aria-label="Arbiter" required pattern='^0x[a-fA-F0-9]{40}$' />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Beneficiary</InputGroup.Text>
                  <Form.Control type="text" id="beneficiary" aria-label="Beneficiary" required pattern='^0x[a-fA-F0-9]{40}$' />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Deposit Amount (in Eth)</InputGroup.Text>
                  <Form.Control type="text" id="eth" aria-label="eth" required pattern='^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$' />
                </InputGroup>

                <Button
                  variant="primary"
                  type="submit"
                >
                  Deploy
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col className="mx-1">
          <Card>
            <Card.Header as={'h3'}>Existing Contracts</Card.Header>

            <Card.Body className='p-0'>


              <Card className='mt-1 border-0'>
                <Card.Header as={'h4'} style={{cursor:'pointer'}} className='border-top rounded-0' data-bs-toggle="collapse" data-bs-target="#depositorEscrowsList" aria-expanded="false" aria-controls="depositorEscrowsList">
                  <button className='link-button'>Depository ({depositorEscrows.length})</button>
                </Card.Header>
                <Card.Body className="collapse p-0 border-0" id="depositorEscrowsList">
                  {depositorEscrows.map((escrow) => {
                    return <Escrow key={escrow.address} account={account} {...escrow} />;
                  })}
                </Card.Body>
              </Card>

              <Card className='mt-1 border-0'>
                <Card.Header as={'h4'} className='border-top rounded-0' style={{cursor:'pointer'}} data-bs-toggle="collapse" data-bs-target="#arbiterEscrowsList" aria-expanded="false" aria-controls="arbiterEscrowsList">
                  <button className='link-button'>Arbiter ({arbiterEscrows.length})</button>
                </Card.Header>
                <Card.Body className="collapse p-0 border-0" id="arbiterEscrowsList">
                  {arbiterEscrows.map((escrow) => {
                    return <Escrow key={escrow.address} account={account} {...escrow} />;
                  })}
                </Card.Body>
              </Card>

              <Card className='mt-1 border-0'>
                <Card.Header as={'h4'} className='border-top rounded-0' style={{cursor:'pointer'}} data-bs-toggle="collapse" data-bs-target="#beneficiaryEscrowsList" aria-expanded="false" aria-controls="beneficiaryEscrowsList">
                  <button className='link-button'>Beneficiary ({beneficiaryEscrows.length})</button>
                </Card.Header>
                <Card.Body className="collapse p-0 border-0" id="beneficiaryEscrowsList">
                  {beneficiaryEscrows.map((escrow) => {
                    return <Escrow key={escrow.address} account={account} {...escrow} />;
                  })}
                </Card.Body>
              </Card>

            </Card.Body>
          </Card>
        </Col>
      </Row>
      <ToastContainer />
    </Container>
  );
}

export default App;
