import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState({});
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();

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
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const weiValue = ethers.utils.parseUnits(document.getElementById('eth').value, "ether")
    const value = ethers.BigNumber.from(weiValue);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);

    const escrow = {
      address: escrowContract.address,
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
    };

    setEscrows([...escrows, escrow]);
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
                <InputGroup className="mb-3" hasValidation>
                  <InputGroup.Text>Arbiter</InputGroup.Text>
                  <Form.Control type="text" id="arbiter" aria-label="Arbiter" required />
                </InputGroup>
                <InputGroup className="mb-3" hasValidation>
                  <InputGroup.Text>Beneficiary</InputGroup.Text>
                  <Form.Control type="text" id="beneficiary" aria-label="Beneficiary" required />
                </InputGroup>
                <InputGroup className="mb-3" hasValidation>
                  <InputGroup.Text>Deposit Amount (in Eth)</InputGroup.Text>
                  <Form.Control type="text" id="eth" aria-label="eth" required />
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

        <Col className="mx-1 existing-contracts">
          <Card>
            <Card.Header as={'h3'}> Existing Contracts </Card.Header>

            <Card.Body>
              {escrows.map((escrow) => {
                return <Escrow key={escrow.address} {...escrow} />;
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
