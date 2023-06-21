# Escrow

first test :
https://sepolia.etherscan.io/address/0xa72ea9e52f561a89efc36949c204a5484d00aa64

Escrow app,
deploying the escrow contract on the network Metamask is connected to,

contract is emiting an event on deploy,

the logs/events are searched to get history of connected user

if user is arbiter and escrow not approved, display a button to approve

approval emit event that is listened to change escrow react component state

deployed to gh-pages : https://clementcadbury.github.io/alchemy_5_escrow/

Example transaction on Sepolia : https://sepolia.etherscan.io/address/0x0fc3876fe4deb107663dbe3abebe2dba1ab90253

using :
- react
- hardhat
- react-bootstrap for grid, forms, collapse
- fontawesome react component
- gh-pages
- react-toastify to display warnings/errors/infos
- ethers.js interface with a non-deployed contract, and with a deployed contract

npkill to clean node_modules